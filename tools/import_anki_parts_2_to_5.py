#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TỰ ĐỘNG TẠO VÀ IMPORT PHẦN 2, PHẦN 3, PHẦN 4, PHẦN 5 (CHỦ ĐỀ 101 -> 500) VÀO ANKI
- Giữ nguyên 100% Phần 1 ('Thử thách mỗi ngày 100 từ vựng') để người dùng tự đổi tên thủ công.
- Tạo 4 Deck độc lập mới:
  + Thử thách mỗi ngày 100 từ vựng phần 2 (101 -> 200)
  + Thử thách mỗi ngày 100 từ vựng phần 3 (201 -> 300)
  + Thử thách mỗi ngày 100 từ vựng phần 4 (301 -> 400)
  + Thử thách mỗi ngày 100 từ vựng phần 5 (401 -> 500)
- Sử dụng đúng Note Type: 'English new words-163e4' (9 trường, 3 thẻ/từ).
- Sao chép toàn bộ tệp âm thanh .mp3 từ output/audio/ vào collection.media.
"""

import os
import re
import sys
import json
import shutil
import zipfile
from anki.collection import Collection, AddNoteRequest


def clean_topic_name(raw_topic: str) -> str:
    # Bỏ phần tiếng Anh trong ngoặc đơn ở cuối (ví dụ: "Kế toán kiểm toán (Auditing & Accounting)" -> "Kế toán kiểm toán")
    cleaned = re.sub(r'\s*\([^)]*\)\s*$', '', raw_topic).strip()
    return cleaned if cleaned else raw_topic.strip()


def get_part_number(stt: int) -> int:
    if 1 <= stt <= 100:
        return 1
    elif 101 <= stt <= 200:
        return 2
    elif 201 <= stt <= 300:
        return 3
    elif 301 <= stt <= 400:
        return 4
    else:
        return 5


def import_to_collection(db_path: str):
    print(f">>> Đang mở cơ sở dữ liệu Anki: {db_path}")
    with open("status.json", "r", encoding="utf-8-sig") as f:
        status_data = json.load(f)

    topic_map = {}
    for item in status_data.get("topics", []):
        stt = int(item["stt"])
        topic_map[stt] = clean_topic_name(item["topic"])

    col = Collection(db_path)
    nt = col.models.by_name("English new words-163e4")
    if not nt:
        col.close()
        raise RuntimeError("Không tìm thấy Note Type 'English new words-163e4' trong Anki!")

    print(f">>> Đã tìm thấy Note Type: {nt['name']} (ID: {nt['id']}) với {len(nt['flds'])} trường.")

    # Khởi tạo 4 Deck cha độc lập (Phần 2 -> Phần 5) với cùng cấu hình giới hạn thẻ như Phần 1
    for part in range(2, 6):
        parent_name = f"Thử thách mỗi ngày 100 từ vựng phần {part}"
        parent_id = col.decks.id(parent_name)
        parent_deck = col.decks.get(parent_id)
        parent_deck["conf"] = 1
        parent_deck["newLimit"] = 300
        parent_deck["reviewLimit"] = 3000
        parent_deck["collapsed"] = True
        parent_deck["browserCollapsed"] = True
        col.decks.save(parent_deck)
        print(f"  + Đã khởi tạo Deck chính: '{parent_name}' (ID: {parent_id})")

    total_topics_imported = 0
    all_requests = []

    for stt in range(101, 501):
        part = get_part_number(stt)
        parent_name = f"Thử thách mỗi ngày 100 từ vựng phần {part}"
        topic_vi = topic_map.get(stt, f"Chủ đề {stt:03d}")
        subdeck_name = f"{parent_name}::{stt:03d}. {topic_vi}"

        did = col.decks.id(subdeck_name)
        subdeck = col.decks.get(did)
        subdeck["conf"] = 1
        subdeck["collapsed"] = True
        subdeck["browserCollapsed"] = True
        col.decks.save(subdeck)

        # Kiểm tra xem subdeck đã có thẻ chưa để tránh nạp trùng
        existing_cards = col.find_cards(f"did:{did}")
        if len(existing_cards) >= 250:
            continue

        txt_path = f"output/{stt}.txt"
        if not os.path.exists(txt_path):
            print(f"[CẢNH BÁO] Không tìm thấy {txt_path}")
            continue

        with open(txt_path, "r", encoding="utf-8-sig") as f:
            lines = f.readlines()

        for line in lines:
            line_str = line.strip("\r\n")
            if not line_str or line_str.startswith("#"):
                continue
            cols = line_str.split("\t")
            if len(cols) < 9:
                continue

            # Chuẩn hóa cột 9 (Examples): chuyển "  2." thành " <br>2." để xuống dòng đẹp trong template
            ex_col = cols[8].strip()
            if "2." in ex_col and "<br>" not in ex_col:
                ex_col = re.sub(r'\s+2\.', ' <br>2.', ex_col, count=1)

            note = col.new_note(nt)
            note.fields[0] = cols[0].strip().replace('\ufeff', '')
            note.fields[1] = cols[1].strip()
            note.fields[2] = cols[2].strip()
            note.fields[3] = cols[3].strip()
            note.fields[4] = cols[4].strip()
            note.fields[5] = cols[5].strip()
            note.fields[6] = cols[6].strip()
            note.fields[7] = cols[7].strip()
            note.fields[8] = ex_col

            all_requests.append(AddNoteRequest(note=note, deck_id=did))

        total_topics_imported += 1
        if total_topics_imported % 100 == 0 or stt == 500:
            print(f"  -> Đã chuẩn bị tới chủ đề #{stt:03d} ({total_topics_imported}/400 chủ đề, {len(all_requests)} từ vựng)", flush=True)

    print(f">>> Đang ghi hàng loạt {len(all_requests)} từ vựng ({len(all_requests) * 3} thẻ) vào cơ sở dữ liệu Anki...", flush=True)
    if all_requests:
        col.add_notes(all_requests)
    print(f">>> Hoàn tất nạp {total_topics_imported} chủ đề ({len(all_requests)} từ vựng = {len(all_requests) * 3} thẻ)!", flush=True)
    col.close()


def copy_all_media(media_dir: str):
    print(f"\n>>> Đang đồng bộ tệp âm thanh MP3 vào: {media_dir}")
    os.makedirs(media_dir, exist_ok=True)
    copied_count = 0
    skipped_count = 0

    audio_root = "output/audio"
    if not os.path.exists(audio_root):
        print("[CẢNH BÁO] Không tìm thấy thư mục output/audio")
        return

    for stt in range(1, 501):
        folder_path = os.path.join(audio_root, str(stt))
        zip_path = os.path.join(audio_root, f"{stt}.zip")

        if os.path.isdir(folder_path):
            for fname in os.listdir(folder_path):
                if fname.lower().endswith(".mp3"):
                    src = os.path.join(folder_path, fname)
                    dst = os.path.join(media_dir, fname)
                    if not os.path.exists(dst) or os.path.getsize(src) != os.path.getsize(dst):
                        shutil.copy2(src, dst)
                        copied_count += 1
                    else:
                        skipped_count += 1
        elif os.path.isfile(zip_path):
            try:
                with zipfile.ZipFile(zip_path, 'r') as zf:
                    for member in zf.namelist():
                        if member.lower().endswith(".mp3"):
                            fname = os.path.basename(member)
                            if not fname:
                                continue
                            dst = os.path.join(media_dir, fname)
                            if not os.path.exists(dst):
                                with zf.open(member) as src_f, open(dst, "wb") as dst_f:
                                    shutil.copyfileobj(src_f, dst_f)
                                copied_count += 1
                            else:
                                skipped_count += 1
            except Exception as e:
                print(f"[CẢNH BÁO] Lỗi giải nén {zip_path}: {e}")

    print(f">>> Đã chép mới {copied_count} tệp MP3 (đã có sẵn {skipped_count} tệp) vào collection.media!")


if __name__ == "__main__":
    target_db = sys.argv[1] if len(sys.argv) > 1 else os.path.expandvars(r"%APPDATA%\Anki2\User 1\collection.anki2")
    import_to_collection(target_db)
    if "--copy-media" in sys.argv:
        media_folder = os.path.expandvars(r"%APPDATA%\Anki2\User 1\collection.media")
        copy_all_media(media_folder)
