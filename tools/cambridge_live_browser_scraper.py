#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
CÔNG CỤ CÀO ÂM THANH TRỰC QUAN TRÊN TRÌNH DUYỆT CHROME (TOPIC 100 -> 500)
- Mở cửa sổ Chrome thật trên màn hình để bạn theo dõi trực tiếp từng thao tác.
- Ưu tiên số 1: Cambridge Dictionary (US -> UK).
- Nếu từ không có trên Cambridge: Tự động chuyển sang Oxford / Collins / FreeDict.
- Đóng gói file zip âm thanh ngay sau khi xong mỗi chủ đề.
- Chi phí API = 0 ĐỒNG.
==============================================================================
"""

import os
import re
import sys
import time
import shutil
import argparse
from urllib.parse import quote
from playwright.sync_api import sync_playwright

def get_status_data():
    status_file = "status.json"
    if os.path.exists(status_file):
        import json
        with open(status_file, "r", encoding="utf-8-sig") as f:
            return json.load(f)
    return {"topics": []}

def get_topic_name(stt, status_data):
    for t in status_data.get("topics", []):
        if t.get("stt") == stt:
            return t.get("topic", f"Chủ đề #{stt}")
    return f"Chủ đề #{stt}"

def get_fallback_audio(word, context):
    clean = word.strip().lower()

    # 1. Ưu tiên số 2: Oxford Learner's Dictionaries (US)
    candidates = [
        clean.replace(" ", "-"),
        clean.replace(" ", "_"),
        clean.replace(" ", "-") + "_1",
        clean.replace("ll", "l").replace(" ", "-")
    ]
    for slug in candidates:
        oxford_url = f"https://www.oxfordlearnersdictionaries.com/definition/english/{quote(slug)}"
        try:
            r = context.request.get(oxford_url, headers={"Referer": "https://www.oxfordlearnersdictionaries.com/"}, timeout=5000)
            if r.status == 200:
                m = re.search(r'data-src-mp3=["\']([^"\']*us_pron[^"\']*)["\']', r.text())
                if not m:
                    m = re.search(r'data-src-mp3=["\']([^"\']*\.mp3)["\']', r.text())
                if m:
                    audio_res = context.request.get(m.group(1), timeout=5000)
                    if audio_res.status == 200 and len(audio_res.body()) > 1000:
                        return audio_res.body(), "Oxford (US)"
        except Exception:
            pass

    # 2. Ưu tiên số 3: Collins Dictionary (US)
    collins_url = f"https://www.collinsdictionary.com/dictionary/english/{quote(clean.replace(' ', '-'))}"
    try:
        r = context.request.get(collins_url, headers={"Referer": "https://www.collinsdictionary.com/"}, timeout=5000)
        if r.status == 200:
            m = re.search(r'data-src-mp3=["\']([^"\']*\.mp3)["\']', r.text())
            if m:
                audio_res = context.request.get(m.group(1), timeout=5000)
                if audio_res.status == 200 and len(audio_res.body()) > 1000:
                    return audio_res.body(), "Collins (US)"
    except Exception:
        pass

    # 3. Ưu tiên số 4: Free Dictionary API
    freedict_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{quote(clean)}"
    try:
        r = context.request.get(freedict_url, timeout=4000)
        if r.status == 200:
            data = r.json()
            if isinstance(data, list):
                for entry in data:
                    for p in entry.get("phonetics", []):
                        audio = p.get("audio", "")
                        if audio:
                            if not audio.startswith("http"):
                                audio = "https:" + audio
                            audio_res = context.request.get(audio, timeout=5000)
                            if audio_res.status == 200 and len(audio_res.body()) > 1000:
                                return audio_res.body(), "FreeDict"
    except Exception:
        pass

    # 4. Chốt chặn cuối cùng: Google TTS (cho từ ghép / không có mục từ)
    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(word)}&tl=en-US&client=tw-ob"
    try:
        r = context.request.get(tts_url, timeout=5000)
        if r.status == 200 and len(r.body()) > 500:
            return r.body(), "Google TTS"
    except Exception:
        pass

    return None, None

def run_visible_scraper(start_stt=100, end_stt=500, max_words=None):
    profile_dir = os.path.expanduser("~/.cambridge-browser-profile")
    os.makedirs(profile_dir, exist_ok=True)
    status_data = get_status_data()

    topic_range = list(range(start_stt, end_stt + 1))
    valid_topics = [stt for stt in topic_range if os.path.exists(f"output/{stt}.txt")]

    print("\n" + "=" * 65)
    print(f"KHỞI CHẠY CÀO ÂM THANH TRỰC QUAN TRÊN GOOGLE CHROME")
    print(f"Phạm vi chủ đề: Từ #{start_stt} đến #{end_stt} (Tổng cộng: {len(valid_topics)} chủ đề)")
    print(f"Cửa sổ Google Chrome đang mở trên màn hình để bạn quan sát trực tiếp...")
    print("=" * 65 + "\n")

    with sync_playwright() as p:
        try:
            context = p.chromium.launch_persistent_context(
                user_data_dir=profile_dir,
                headless=False,
                channel="chrome",
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--start-maximized"
                ]
            )
        except Exception:
            context = p.chromium.launch_persistent_context(
                user_data_dir=profile_dir,
                headless=False,
                channel="msedge",
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--start-maximized"
                ]
            )

        page = context.pages[0] if context.pages else context.new_page()

        # Kiểm tra phiên Cambridge
        page.goto("https://dictionary.cambridge.org/dictionary/english/apple", timeout=60000)
        for _ in range(30):
            title = page.title()
            if "Just a moment" not in title and ("Cambridge" in title or "apple" in title.lower()):
                print(f"[XÁC MINH HỢP LỆ] Đã thông qua bảo mật Cambridge thành công!")
                break
            time.sleep(1)

        total_done = 0

        for t_idx, stt in enumerate(valid_topics, 1):
            txt_path = f"output/{stt}.txt"
            topic_name = get_topic_name(stt, status_data)

            words = []
            with open(txt_path, "r", encoding="utf-8-sig") as f:
                for line in f:
                    parts = line.strip().split("\t")
                    if parts and parts[0]:
                        w = parts[0].strip().replace('\ufeff', '').lower()
                        if w:
                            words.append(w)

            if max_words:
                words = words[:max_words]

            if not words:
                continue

            output_dir = f"output/audio/{stt}"
            os.makedirs(output_dir, exist_ok=True)

            print(f"\n>>> [{t_idx}/{len(valid_topics)}] BẮT ĐẦU CHỦ ĐỀ #{stt} - {topic_name} ({len(words)} TỪ)")
            start_topic_time = time.time()
            cambridge_count = 0
            other_dict_count = 0
            tts_count = 0
            success_count = 0

            for w_idx, w in enumerate(words, 1):
                clean_word = w.replace(" ", "_")
                mp3_file = os.path.join(output_dir, f"{clean_word}.mp3")

                # Cập nhật banner HUD trên cửa sổ Chrome để người dùng xem trực tiếp
                hud_script = f"""
                (() => {{
                    let banner = document.getElementById('anki-live-hud');
                    if (!banner) {{
                        banner = document.createElement('div');
                        banner.id = 'anki-live-hud';
                        banner.style.position = 'fixed';
                        banner.style.top = '0';
                        banner.style.left = '0';
                        banner.style.right = '0';
                        banner.style.zIndex = '999999999';
                        banner.style.background = 'linear-gradient(90deg, #1e1e2e, #2d1b69)';
                        banner.style.color = '#ffffff';
                        banner.style.padding = '10px 20px';
                        banner.style.fontFamily = 'Segoe UI, sans-serif';
                        banner.style.fontSize = '14px';
                        banner.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
                        banner.style.display = 'flex';
                        banner.style.justifyContent = 'space-between';
                        banner.style.alignItems = 'center';
                        document.body.prepend(banner);
                    }}
                    banner.innerHTML = `
                        <div>
                            <span style="background:#ff0055;padding:3px 8px;border-radius:4px;font-weight:bold;margin-right:10px;">ĐANG CÀO ÂM THANH</span>
                            <b>Chủ đề #{stt}: {topic_name}</b> ({t_idx}/{len(valid_topics)})
                        </div>
                        <div>
                            Từ vựng ({w_idx}/{len(words)}): <b style="color:#00ffcc;font-size:16px;">{w}</b>
                        </div>
                    `;
                }})();
                """

                # 1. Thử lấy từ Cambridge trước
                slug = w.replace(" ", "-")
                cambridge_url = f"https://dictionary.cambridge.org/dictionary/english/{quote(slug)}"

                audio_url = None
                try:
                    # Chuyển hướng tab Chrome tới từ này để người dùng quan sát trên màn hình
                    page.goto(cambridge_url, wait_until="domcontentloaded", timeout=6000)
                    try:
                        page.evaluate(hud_script)
                    except Exception:
                        pass

                    html_content = page.content()
                    us_match = re.search(r'type=["\']audio/mpeg["\'][^>]*src=["\']([^"\']*us_pron[^"\']*)["\']', html_content)
                    if not us_match:
                        us_match = re.search(r'src=["\']([^"\']*us_pron[^"\']*\.mp3)["\']', html_content)
                    if us_match:
                        src = us_match.group(1)
                        audio_url = src if src.startswith("http") else "https://dictionary.cambridge.org" + src
                    else:
                        uk_match = re.search(r'src=["\']([^"\']*uk_pron[^"\']*\.mp3)["\']', html_content)
                        if uk_match:
                            src = uk_match.group(1)
                            audio_url = src if src.startswith("http") else "https://dictionary.cambridge.org" + src
                except Exception:
                    pass

                downloaded = False
                source_used = ""

                # Tải từ Cambridge nếu tìm thấy
                if audio_url:
                    try:
                        audio_res = context.request.get(audio_url, headers={"Referer": "https://dictionary.cambridge.org/"}, timeout=5000)
                        if audio_res.status == 200 and len(audio_res.body()) > 1000:
                            with open(mp3_file, "wb") as f:
                                f.write(audio_res.body())
                            downloaded = True
                            cambridge_count += 1
                            source_used = "Cambridge (US)"
                    except Exception:
                        pass

                # 2. Nếu Cambridge không có -> Chuyển sang Oxford / Collins / FreeDict theo yêu cầu của bạn
                if not downloaded:
                    fallback_bytes, fallback_src = get_fallback_audio(w, context)
                    if fallback_bytes:
                        with open(mp3_file, "wb") as f:
                            f.write(fallback_bytes)
                        downloaded = True
                        source_used = fallback_src
                        if "TTS" in fallback_src:
                            tts_count += 1
                        else:
                            other_dict_count += 1

                if downloaded:
                    success_count += 1
                    print(f"  [{w_idx}/{len(words)}] {clean_word}.mp3 -> {source_used}")
                else:
                    print(f"  [{w_idx}/{len(words)}] {clean_word}.mp3 -> [THẤT BẠI]")

                time.sleep(0.08)

            # Nén ZIP sau khi hoàn thành 100 từ của chủ đề
            zip_path = f"output/audio/{stt}.zip"
            if os.path.exists(zip_path):
                os.remove(zip_path)
            shutil.make_archive(f"output/audio/{stt}", "zip", output_dir)

            elapsed = time.time() - start_topic_time
            total_done += 1
            print(f">>> [HOÀN THÀNH #{stt}] Cambridge: {cambridge_count} | Từ điển khác: {other_dict_count} | TTS: {tts_count} | Thời gian: {elapsed:.1f}s | Đã nén: {zip_path}")

        context.close()
        print("\n" + "=" * 65)
        print(f"HOÀN THÀNH TOÀN BỘ TIẾN TRÌNH: ĐÃ CÀO XONG {total_done} CHỦ ĐỀ!")
        print("=" * 65 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Live Visual Chrome Audio Scraper")
    parser.add_argument("--start", type=int, default=100, help="STT bắt đầu (mặc định: 100)")
    parser.add_argument("--end", type=int, default=500, help="STT kết thúc (mặc định: 500)")
    parser.add_argument("--max_words", type=int, default=None, help="Giới hạn số từ mỗi chủ đề (để kiểm tra)")
    args = parser.parse_args()

    run_visible_scraper(args.start, args.end, max_words=args.max_words)
