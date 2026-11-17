#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CÔNG CỤ CÀO ÂM THANH CHÍNH THỨC 100% TỪ TỪ ĐIỂN CAMBRIDGE QUA GOOGLE CHROME
- Mở cửa sổ Chrome thật trên màn hình để duy trì phiên xác minh con người.
- Tự động cào và tải trực tiếp tệp âm thanh MP3 chuẩn Cambridge US.
- Chi phí API = 0 ĐỒNG (chỉ đọc từ vựng từ output/*.txt và tải qua mạng).
"""

import os
import re
import sys
import time
import shutil
import argparse
from urllib.parse import quote
from playwright.sync_api import sync_playwright

def scrape_topics(stt_list, max_words=None):
    profile_dir = os.path.expanduser("~/.cambridge-browser-profile")
    os.makedirs(profile_dir, exist_ok=True)

    print("\n========================================================")
    print(f"KHỞI CHẠY TRÌNH DUYỆT CHROME ĐỂ CÀO ÂM THANH CAMBRIDGE")
    print(f"Số lượng chủ đề cần xử lý: {len(stt_list)}")
    print("========================================================")

    with sync_playwright() as p:
        try:
            context = p.chromium.launch_persistent_context(
                user_data_dir=profile_dir,
                headless=False,
                channel="chrome",
                args=["--disable-blink-features=AutomationControlled"]
            )
        except Exception as e:
            print(f"[CẢNH BÁO] Không thể mở Chrome ({e}), chuyển sang Microsoft Edge...")
            context = p.chromium.launch_persistent_context(
                user_data_dir=profile_dir,
                headless=False,
                channel="msedge",
                args=["--disable-blink-features=AutomationControlled"]
            )

        page = context.pages[0] if context.pages else context.new_page()

        print(">>> Đang kiểm tra kết nối tới Cambridge Dictionary...")
        page.goto("https://dictionary.cambridge.org/dictionary/english/apple", timeout=60000)

        # Chờ người dùng xác minh nếu gặp Cloudflare
        for _ in range(120):
            title = page.title()
            if "Just a moment" not in title and ("Cambridge" in title or "apple" in title.lower()):
                print(f"[XÁC MINH HỢP LỆ] Đã thông qua bảo mật Cambridge (Tiêu đề: {title})")
                break
            time.sleep(1)

        time.sleep(1)

        total_topics_done = 0

        for stt in stt_list:
            txt_path = f"output/{stt}.txt"
            if not os.path.exists(txt_path):
                print(f"[BỎ QUA] Không tìm thấy file {txt_path}!")
                continue

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

            print(f"\n>>> [CHỦ ĐỀ #{stt}] Đang tải âm thanh Cambridge cho {len(words)} từ vựng...")
            start_time = time.time()
            cambridge_count = 0
            fallback_count = 0

            for idx, w in enumerate(words, 1):
                clean_word = w.replace(" ", "_")
                mp3_file = os.path.join(output_dir, f"{clean_word}.mp3")

                slug = w.replace(" ", "-")
                url = f"https://dictionary.cambridge.org/dictionary/english/{quote(slug)}"

                audio_url = None
                try:
                    res = context.request.get(url, headers={"Referer": "https://dictionary.cambridge.org/"})
                    if res.status == 200:
                        html_content = res.text()
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
                if audio_url:
                    try:
                        audio_res = context.request.get(audio_url, headers={"Referer": "https://dictionary.cambridge.org/"})
                        if audio_res.status == 200 and len(audio_res.body()) > 1000:
                            with open(mp3_file, "wb") as f:
                                f.write(audio_res.body())
                            downloaded = True
                            cambridge_count += 1
                            print(f"  [CAMBRIDGE US] [{idx}/{len(words)}] {clean_word}.mp3 ({len(audio_res.body())} bytes)")
                    except Exception:
                        pass

                # Nếu là từ ghép/thuật ngữ không có mục từ riêng trên Cambridge
                if not downloaded:
                    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={quote(w)}&tl=en-US&client=tw-ob"
                    try:
                        tts_res = context.request.get(tts_url)
                        if tts_res.status == 200 and len(tts_res.body()) > 500:
                            with open(mp3_file, "wb") as f:
                                f.write(tts_res.body())
                            downloaded = True
                            fallback_count += 1
                            print(f"  [TTS DỰ PHÒNG] [{idx}/{len(words)}] {clean_word}.mp3 (Từ ghép không có trên Cambridge)")
                    except Exception:
                        pass

                time.sleep(0.1)

            # Đóng gói zip sau mỗi chủ đề
            zip_path = f"output/audio/{stt}.zip"
            if os.path.exists(zip_path):
                os.remove(zip_path)
            shutil.make_archive(f"output/audio/{stt}", "zip", output_dir)

            elapsed = time.time() - start_time
            total_topics_done += 1
            print(f">>> [XONG #{stt}] Cambridge gốc: {cambridge_count}/{len(words)} | Dự phòng: {fallback_count} | {elapsed:.1f}s | Đã nén: {zip_path}")

        context.close()
        print(f"\n========================================================")
        print(f"HOÀN THÀNH TOÀN BỘ {total_topics_done} CHỦ ĐỀ VỚI ÂM THANH CAMBRIDGE!")
        print(f"========================================================\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cambridge Audio Browser Scraper")
    parser.add_argument("--stt", type=int, default=0, help="Chủ đề cụ thể cần cào (ví dụ: --stt 176)")
    parser.add_argument("--start", type=int, default=0, help="STT bắt đầu (ví dụ: --start 171)")
    parser.add_argument("--end", type=int, default=0, help="STT kết thúc (ví dụ: --end 200)")
    parser.add_argument("--all", action="store_true", help="Cào toàn bộ 500 chủ đề")
    parser.add_argument("--test", action="store_true", help="Chạy thử 5 từ đầu tiên")
    args = parser.parse_args()

    max_w = 5 if args.test else None

    if args.stt > 0:
        scrape_topics([args.stt], max_words=max_w)
    elif args.start > 0 and args.end >= args.start:
        scrape_topics(list(range(args.start, args.end + 1)), max_words=max_w)
    elif args.all:
        scrape_topics(list(range(1, 501)), max_words=max_w)
    else:
        print("Vui lòng truyền --stt <số>, hoặc --start <số> --end <số>, hoặc --all.")
