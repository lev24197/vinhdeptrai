#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script cào âm thanh Cambridge Dictionary 100% chạy trực tiếp trên máy tính cá nhân hoặc Google Colab.
Mạng gia đình / Colab không bao giờ bị Cloudflare chặn như server đám mây.
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

def create_session(max_workers=10):
    s = requests.Session()
    s.headers.update({
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    })
    adapter = requests.adapters.HTTPAdapter(pool_connections=max_workers, pool_maxsize=max_workers)
    s.mount('https://', adapter)
    s.mount('http://', adapter)
    return s

def fetch_url_with_retry(session, url, headers=None, retries=3, timeout=8):
    for attempt in range(retries):
        try:
            req_headers = {"User-Agent": random.choice(USER_AGENTS)}
            if headers:
                req_headers.update(headers)
            res = session.get(url, headers=req_headers, timeout=timeout)
            if res.status_code == 200:
                return res
            elif res.status_code in [429, 403, 503]:
                time.sleep(1.5 * (attempt + 1) + random.uniform(0.2, 0.8))
            elif res.status_code == 404:
                return None
        except Exception:
            time.sleep(1.0 * (attempt + 1))
    return None

def get_from_cambridge_api(session, word):
    clean = word.strip().lower()
    candidates = [clean.replace(" ", "-"), clean]
    for slug in candidates:
        try:
            api_url = f"https://cambridge-dictionary-api.vercel.app/api/dictionary/en/{quote(slug)}"
            res = fetch_url_with_retry(session, api_url, retries=2, timeout=6)
            if res:
                data = res.json()
                pron_list = data.get("pronunciation", [])
                us_url = None
                uk_url = None
                for p in pron_list:
                    url = p.get("url", "")
                    if not url:
                        continue
                    if p.get("lang") == "us" and not us_url:
                        us_url = url
                    elif p.get("lang") == "uk" and not uk_url:
                        uk_url = url
                target_url = us_url or uk_url
                if target_url:
                    headers = {"Referer": "https://dictionary.cambridge.org/"}
                    src = "1. Cambridge (US)" if target_url == us_url else "1. Cambridge (UK)"
                    return target_url, src, headers
        except Exception:
            pass
    return None, None, None

def get_from_cambridge(session, word):
    clean = word.strip().lower()
    candidates = [
        clean.replace(" ", "-"),
        clean.replace(" ", "_"),
        clean
    ]
    headers = {"Referer": "https://dictionary.cambridge.org/"}

    for slug in candidates:
        url = f"https://dictionary.cambridge.org/dictionary/english/{quote(slug)}"
        res = fetch_url_with_retry(session, url, headers=headers, retries=3)
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

def get_from_oxford(session, word):
    clean = word.strip().lower()
    candidates = [
        clean.replace(" ", "-"),
        clean.replace(" ", "_"),
        clean.replace(" ", "-") + "_1"
    ]
    headers = {"Referer": "https://www.oxfordlearnersdictionaries.com/"}
    for slug in candidates:
        url = f"https://www.oxfordlearnersdictionaries.com/definition/english/{quote(slug)}"
        res = fetch_url_with_retry(session, url, headers=headers, retries=2)
        if res:
            soup = BeautifulSoup(res.text, 'html.parser')
            us_btn = soup.find(attrs={"class": re.compile(r"pron-us"), "data-src-mp3": True})
            uk_btn = soup.find(attrs={"class": re.compile(r"pron-uk"), "data-src-mp3": True})
            if us_btn and us_btn.get('data-src-mp3'):
                return us_btn['data-src-mp3'], "2. Oxford (US)", headers
            if uk_btn and uk_btn.get('data-src-mp3'):
                return uk_btn['data-src-mp3'], "2. Oxford (UK)", headers
    return None, None, None

def download_word_audio(session, item, output_dir):
    idx, word, file_name = item
    file_path = os.path.join(output_dir, file_name)

    if os.path.exists(file_path) and os.path.getsize(file_path) > 500:
        return (item, True, "Đã có sẵn", False)

    # 1. Thử Cambridge API chuẩn xác
    audio_url, source_name, headers = get_from_cambridge_api(session, word)
    if not audio_url:
        # 2. Thử Cambridge cào trực tiếp
        audio_url, source_name, headers = get_from_cambridge(session, word)

    if audio_url:
        res = fetch_url_with_retry(session, audio_url, headers=headers, retries=3, timeout=10)
        if res and len(res.content) > 500:
            with open(file_path, 'wb') as f:
                f.write(res.content)
            return (item, True, source_name, False)

    # 2. Dự phòng Oxford
    audio_url, source_name, headers = get_from_oxford(session, word)
    if audio_url:
        res = fetch_url_with_retry(session, audio_url, headers=headers, retries=2, timeout=10)
        if res and len(res.content) > 500:
            with open(file_path, 'wb') as f:
                f.write(res.content)
            return (item, True, source_name, False)

    # 3. Google TTS nếu từ hiếm
    q = quote(word.strip())
    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={q}&tl=en&client=tw-ob"
    res = fetch_url_with_retry(session, tts_url, retries=2, timeout=8)
    if res and len(res.content) > 500:
        with open(file_path, 'wb') as f:
            f.write(res.content)
        return (item, True, "3. Google TTS Fallback", True)

    return (item, False, "Thất bại", False)

def process_topic(stt: int, max_workers: int = 8):
    tsv_path = os.path.join("output", f"{stt}.txt")
    if not os.path.exists(tsv_path):
        print(f"❌ Không tìm thấy file {tsv_path}")
        return

    words = []
    with open(tsv_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                parts = line.split("\t")
                if parts and parts[0].strip():
                    words.append(parts[0].strip())

    if not words:
        print(f"❌ File {tsv_path} không có từ vựng nào.")
        return

    out_dir = os.path.join("output_audio", f"topic_{stt}")
    os.makedirs(out_dir, exist_ok=True)

    tasks = []
    for idx, w in enumerate(words, 1):
        clean_file = "_".join(w.lower().split()) + ".mp3"
        tasks.append((idx, w, clean_file))

    print(f"🚀 Bắt đầu cào 100% âm thanh Cambridge cho Chủ Đề #{stt} ({len(tasks)} từ)...")
    start_time = time.time()
    session = create_session(max_workers)

    source_stats = {}
    success_count = 0

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_word_audio, session, item, out_dir): item for item in tasks}
        for future in as_completed(futures):
            item, ok, src, is_tts = future.result()
            if ok:
                success_count += 1
                source_stats[src] = source_stats.get(src, 0) + 1
                print(f"[{success_count}/{len(tasks)}] ✅ {item[2]} -> {src}")
            else:
                print(f"❌ Không thể tải: {item[1]}")

    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print(f"🎉 Hoàn tất trong {elapsed:.2f}s! Đã tải thành công {success_count}/{len(tasks)} từ.")
    print("📊 Thống kê nguồn:")
    for src, cnt in sorted(source_stats.items()):
        print(f"  - {src}: {cnt} từ")
    print("=" * 60)

    # Đóng gói zip
    zip_path = f"output_{stt}_audio.zip"
    shutil.make_archive(f"output_{stt}_audio", 'zip', out_dir)
    print(f"📦 Đã tạo file nén: {zip_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cambridge Audio Crawler for Anki")
    parser.add_argument("--stt", type=int, default=113, help="STT của chủ đề (VD: 113)")
    parser.add_argument("--workers", type=int, default=8, help="Số luồng cào song song (mặc định: 8)")
    args = parser.parse_args()

    process_topic(args.stt, args.workers)
