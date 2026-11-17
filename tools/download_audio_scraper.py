#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
CÔNG CỤ CÀO ÂM THANH BẢN XỨ ĐA NGUỒN (MULTI-SOURCE AUDIO SCRAPER)
Nhánh: feature/cambridge-scraper
Thứ tự ưu tiên nguồn âm thanh người thật bản xứ:
1. Cambridge Dictionary (US -> UK)
2. Oxford Learner's Dictionaries (US -> UK)
3. Collins Dictionary (US -> UK)
4. Free Dictionary API (US -> UK)
5. Wikimedia Commons Audio (US)
6. Google Translate TTS (Chỉ dùng làm chốt chặn cuối cùng cho từ ghép/hiếm)
==============================================================================
"""

import os
import re
import sys
import time
import random
import shutil
import argparse
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from bs4 import BeautifulSoup

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
]

MAX_WORKERS = 5

def create_session():
    s = requests.Session()
    s.headers.update({
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    })
    adapter = requests.adapters.HTTPAdapter(pool_connections=MAX_WORKERS, pool_maxsize=MAX_WORKERS)
    s.mount('https://', adapter)
    s.mount('http://', adapter)
    return s

session = create_session()

def fetch_url_with_retry(url, headers=None, retries=3, timeout=8):
    for attempt in range(retries):
        try:
            req_headers = {"User-Agent": random.choice(USER_AGENTS)}
            if headers:
                req_headers.update(headers)
            res = session.get(url, headers=req_headers, timeout=timeout)
            if res.status_code == 200:
                return res
            elif res.status_code in [429, 403, 503]:
                time.sleep(1.0 * (attempt + 1) + random.uniform(0.2, 0.6))
            elif res.status_code == 404:
                return None
        except Exception:
            time.sleep(1.0 * (attempt + 1))
    return None

# 1. ƯU TIÊN SỐ 1: CAMBRIDGE DICTIONARY (US -> UK)
def get_from_cambridge(word):
    search_word = word.strip().lower().replace(" ", "-")
    url = f"https://dictionary.cambridge.org/dictionary/english/{quote(search_word)}"
    headers = {"Referer": "https://dictionary.cambridge.org/"}
    res = fetch_url_with_retry(url, headers=headers, retries=2)
    if res:
        soup = BeautifulSoup(res.text, 'html.parser')
        sources = soup.find_all('source', type='audio/mpeg')
        us_url, uk_url = None, None
        for s in sources:
            src = s.get('src', '')
            if not src:
                continue
            full_src = src if src.startswith("http") else "https://dictionary.cambridge.org" + src
            if ('us_pron' in src or '/us/' in src) and not us_url:
                us_url = full_src
            elif ('uk_pron' in src or '/uk/' in src) and not uk_url:
                uk_url = full_src
        if us_url:
            return us_url, "1. Cambridge (US)", headers
        if uk_url:
            return uk_url, "1. Cambridge (UK)", headers
    return None, None, None

# 2. ƯU TIÊN SỐ 2: OXFORD LEARNER'S DICTIONARIES (US -> UK)
def get_from_oxford(word):
    clean = word.strip().lower().replace('\ufeff', '')
    candidates = [
        clean.replace(" ", "-"),
        clean.replace(" ", "_"),
        clean.replace(" ", "-") + "_1",
        clean.replace("ll", "l").replace(" ", "-"),  # installment -> instalment
    ]
    headers = {"Referer": "https://www.oxfordlearnersdictionaries.com/"}
    for slug in candidates:
        url = f"https://www.oxfordlearnersdictionaries.com/definition/english/{quote(slug)}"
        res = fetch_url_with_retry(url, headers=headers, retries=2)
        if res:
            soup = BeautifulSoup(res.text, 'html.parser')
            us_btn = soup.find(attrs={"class": re.compile(r"pron-us"), "data-src-mp3": True})
            uk_btn = soup.find(attrs={"class": re.compile(r"pron-uk"), "data-src-mp3": True})
            if us_btn:
                return us_btn['data-src-mp3'], "2. Oxford (US)", headers
            if uk_btn:
                return uk_btn['data-src-mp3'], "2. Oxford (UK)", headers
    return None, None, None

# 3. ƯU TIÊN SỐ 3: COLLINS DICTIONARY (US -> UK)
def get_from_collins(word):
    search_word = word.strip().lower().replace(" ", "-")
    url = f"https://www.collinsdictionary.com/dictionary/english/{quote(search_word)}"
    headers = {"Referer": "https://www.collinsdictionary.com/"}
    res = fetch_url_with_retry(url, headers=headers, retries=2)
    if res:
        soup = BeautifulSoup(res.text, 'html.parser')
        audio_tags = soup.find_all('a', attrs={'data-src-mp3': True})
        us_url, uk_url = None, None
        for tag in audio_tags:
            mp3 = tag.get('data-src-mp3', '')
            title = tag.get('title', '').lower()
            if ('american' in title or 'us' in mp3.lower() or 'en_us' in mp3.lower()) and not us_url:
                us_url = mp3
            elif not uk_url:
                uk_url = mp3
        if us_url:
            return us_url, "3. Collins (US)", headers
        if uk_url:
            return uk_url, "3. Collins (UK)", headers
    return None, None, None

# 4. ƯU TIÊN SỐ 4: FREE DICTIONARY API (US -> UK)
def get_from_freedict(word):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{quote(word.strip().lower())}"
    res = fetch_url_with_retry(url, retries=2)
    if res:
        try:
            data = res.json()
            us_url, uk_url, any_url = None, None, None
            if isinstance(data, list):
                for entry in data:
                    for p in entry.get("phonetics", []):
                        audio = p.get("audio", "")
                        if not audio:
                            continue
                        if not audio.startswith("http"):
                            audio = "https:" + audio
                        if "-us.mp3" in audio or "_us_" in audio:
                            us_url = audio
                        elif "-uk.mp3" in audio or "_gb_" in audio or "-au.mp3" in audio:
                            uk_url = audio
                        else:
                            any_url = audio
            if us_url:
                return us_url, "4. FreeDict (US)", None
            if uk_url:
                return uk_url, "4. FreeDict (UK)", None
            if any_url:
                return any_url, "4. FreeDict", None
        except Exception:
            pass
    return None, None, None

# 5. ƯU TIÊN SỐ 5: WIKIMEDIA COMMONS AUDIO (US)
def get_from_wikimedia(word):
    clean_word = word.strip().lower()
    api_url = f"https://en.wiktionary.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:En-us-{quote(clean_word)}.ogg&format=json"
    res = fetch_url_with_retry(api_url, retries=2)
    if res:
        try:
            pages = res.json().get("query", {}).get("pages", {})
            for page_id, page_data in pages.items():
                if page_id != "-1" and "imageinfo" in page_data:
                    return page_data["imageinfo"][0]["url"], "5. Wikimedia (US)", None
        except Exception:
            pass
    return None, None, None

# 6. CHỐT CHẶN CUỐI CÙNG: GOOGLE TRANSLATE TTS
def download_google_tts(word, file_path):
    q = quote(word.strip())
    tts_endpoints = [
        f"https://translate.google.com/translate_tts?ie=UTF-8&q={q}&tl=en&client=tw-ob",
        f"https://translate.googleapis.com/translate_tts?ie=UTF-8&q={q}&tl=en-US&client=gtx"
    ]
    for url in tts_endpoints:
        res = fetch_url_with_retry(url, retries=3, timeout=10)
        if res and len(res.content) > 500:
            with open(file_path, 'wb') as f:
                f.write(res.content)
            return True, "6. Google TTS (US)"
    return False, None

def download_single_word(item, output_dir, overwrite=False):
    idx, word, file_name = item
    file_path = os.path.join(output_dir, file_name)

    if not overwrite and os.path.exists(file_path) and os.path.getsize(file_path) > 1000:
        return (item, True, "Đã có sẵn", False)

    dictionary_sources = [
        get_from_cambridge,
        get_from_oxford,
        get_from_collins,
        get_from_freedict,
        get_from_wikimedia
    ]

    for get_source in dictionary_sources:
        audio_url, source_name, extra_headers = get_source(word)
        if audio_url:
            audio_res = fetch_url_with_retry(audio_url, headers=extra_headers, retries=3, timeout=10)
            if audio_res and len(audio_res.content) > 1000:
                with open(file_path, 'wb') as f:
                    f.write(audio_res.content)
                return (item, True, source_name, False)

    # Chốt chặn cuối cùng nếu không có trên 5 từ điển
    tts_ok, tts_source = download_google_tts(word, file_path)
    if tts_ok:
        return (item, True, tts_source, True)

    return (item, False, "Lỗi tải", False)

def process_topic_audio(stt, overwrite=True):
    txt_path = f"output/{stt}.txt"
    if not os.path.exists(txt_path):
        print(f"[LỖI] Không tìm thấy file {txt_path}!")
        return False

    words = []
    with open(txt_path, "r", encoding="utf-8-sig") as f:
        for line in f:
            parts = line.strip().split("\t")
            if parts and parts[0]:
                w = parts[0].strip().replace('\ufeff', '').lower()
                if w:
                    words.append(w)

    if not words:
        print(f"[CẢNH BÁO] Chủ đề #{stt} không có từ vựng nào!")
        return False

    output_dir = f"output/audio/{stt}"
    os.makedirs(output_dir, exist_ok=True)

    tasks = []
    seen = {}
    for idx, w in enumerate(words, 1):
        clean_name = w.replace(" ", "_")
        file_name = f"{clean_name}.mp3"
        tasks.append((idx, w, file_name))

    print(f"\n========================================================")
    print(f"BẮT ĐẦU CÀO ÂM THANH BẢN XỨ CHO CHỦ ĐỀ #{stt} ({len(tasks)} TỪ)")
    print(f"Thư mục lưu: {output_dir}")
    print(f"========================================================")

    start_time = time.time()
    pending = tasks[:]
    round_num = 1
    success_count = 0
    source_stats = {}
    tts_fallback = []

    global session

    while pending:
        if round_num > 1:
            wait_sec = min(10, round_num * 2)
            print(f"\n[LƯỢT {round_num}] Còn {len(pending)} từ chưa xong. Nghỉ {wait_sec}s...")
            time.sleep(wait_sec)
            session = create_session()

        failed_round = []
        workers = MAX_WORKERS if round_num == 1 else max(2, MAX_WORKERS // 2)

        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_map = {executor.submit(download_single_word, it, output_dir, overwrite): it for it in pending}
            for fut in as_completed(future_map):
                item, is_ok, src_name, is_tts = fut.result()
                idx, word, file_name = item
                if is_ok:
                    success_count += 1
                    source_stats[src_name] = source_stats.get(src_name, 0) + 1
                    status_icon = "[TTS]" if is_tts else "[NATIVE]"
                    if is_tts:
                        tts_fallback.append(word)
                    print(f"  {status_icon} [{success_count}/{len(tasks)}] {file_name} -> {src_name}")
                else:
                    failed_round.append(item)
                    print(f"  [RETRY] Chưa tải được: {word}")

        pending = failed_round
        round_num += 1
        if round_num > 4:
            break

    elapsed = time.time() - start_time
    zip_path = f"output/audio/{stt}.zip"
    if os.path.exists(zip_path):
        os.remove(zip_path)
    shutil.make_archive(f"output/audio/{stt}", "zip", output_dir)

    print(f"\n--- TỔNG KẾT CHỦ ĐỀ #{stt} ---")
    print(f"Hoàn thành: {success_count}/{len(tasks)} tệp trong {elapsed:.1f} giây")
    print(f"Đã đóng gói: {zip_path}")
    print("Nguồn phân bổ:")
    for src, c in sorted(source_stats.items()):
        print(f"  - {src}: {c} từ")
    return True

def main():
    parser = argparse.ArgumentParser(description="Multi-Source Native Audio Scraper")
    parser.add_argument("--stt", type=int, default=0, help="STT của chủ đề cần cào (ví dụ: 176)")
    parser.add_argument("--all", action="store_true", help="Cào âm thanh bản xứ cho tất cả 500 chủ đề")
    parser.add_argument("--overwrite", action="store_true", default=True, help="Ghi đè file cũ")
    args = parser.parse_args()

    if args.stt > 0:
        process_topic_audio(args.stt, overwrite=args.overwrite)
    elif args.all:
        for stt in range(1, 501):
            if os.path.exists(f"output/{stt}.txt"):
                process_topic_audio(stt, overwrite=args.overwrite)
    else:
        print("Vui lòng truyền tham số --stt <số> (ví dụ: --stt 176) hoặc --all để cào toàn bộ.")

if __name__ == "__main__":
    main()
