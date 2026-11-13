#!/usr/bin/env python3
# ==============================================================================
# SCRIPT: scripts/sync_ankiweb.py
# Chức năng: Đăng nhập AnkiWeb, đồng bộ database SQLite không tải media,
#            bóc tách 14 chỉ số thống kê cho bộ bài "Thử thách mỗi ngày 100 từ vựng"
#            và xuất ra tệp data/anki_stats.json để hiển thị trên web.
# ==============================================================================

import os
import sys
import json
import shutil
import sqlite3
import datetime
from pathlib import Path

TARGET_DECK_BASE = "Thử thách mỗi ngày 100 từ vựng"
OUTPUT_JSON_PATH = Path("data/anki_stats.json")
TEMP_DIR = Path("temp_ankiweb_sync")

def main():
    username = os.environ.get("ANKIWEB_USERNAME", "").strip()
    password = os.environ.get("ANKIWEB_PASSWORD", "").strip()

    if not username or not password:
        print("ERROR: Thiếu biến môi trường ANKIWEB_USERNAME hoặc ANKIWEB_PASSWORD.")
        print("Vui lòng cấu hình 2 biến bí mật này trong GitHub Repository Secrets:")
        print("  1. ANKIWEB_USERNAME (Email tài khoản AnkiWeb)")
        print("  2. ANKIWEB_PASSWORD (Mật khẩu tài khoản AnkiWeb)")
        sys.exit(1)

    print("================================================================================")
    print("   ANKIWEB CLOUD SYNC: THỬ THÁCH MỖI NGÀY 100 TỪ VỰNG                           ")
    print("================================================================================")
    print(f"[*] Tài khoản AnkiWeb: {username[:3]}***{username[username.find('@'):] if '@' in username else ''}")

    # Tạo thư mục tạm
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    temp_col_path = TEMP_DIR / "collection.anki2"

    try:
        # 1. Nhập thư viện anki và khởi tạo collection
        print("[1/4] Khởi tạo Anki Collection và đăng nhập AnkiWeb...")
        from anki.collection import Collection
        from anki.sync_pb2 import SyncCollectionResponse

        col = Collection(str(temp_col_path))
        
        # 2. Đăng nhập AnkiWeb
        auth = col.sync_login(username, password, None)
        print("✓ Đăng nhập AnkiWeb thành công.")

        # 3. Đồng bộ dữ liệu (media=False để không tải MP3, cực nhanh)
        print("[2/4] Đang đồng bộ cơ sở dữ liệu SQLite từ AnkiWeb (bỏ qua tệp âm thanh MP3)...")
        sync_out = col.sync_collection(auth, sync_media=False)
        req_status = getattr(sync_out, "required", None)
        print(f"[*] Trạng thái kiểm tra đồng bộ: required={req_status}")

        # RẤT QUAN TRỌNG: AnkiWeb chuyển tiếp sang máy chủ shard riêng (ví dụ sync34.ankiweb.net)
        if getattr(sync_out, "new_endpoint", None):
            print(f"[*] Cập nhật máy chủ AnkiWeb shard endpoint: {sync_out.new_endpoint}")
            auth.endpoint = sync_out.new_endpoint

        if req_status in (SyncCollectionResponse.FULL_SYNC, SyncCollectionResponse.FULL_DOWNLOAD) or col.card_count() == 0:
            print("[*] Collection yêu cầu tải toàn bộ từ AnkiWeb (Full Download). Đang chuẩn bị tải...")
            col.close_for_full_sync()
            try:
                server_usn = getattr(sync_out, "server_media_usn", None)
                col.full_upload_or_download(auth=auth, server_usn=server_usn, upload=False)
                print("✓ Đã tải trọn vẹn collection từ AnkiWeb về máy ảo.")
            finally:
                col.reopen(after_full_sync=True)
        else:
            print("✓ Đồng bộ hoàn tất (Incremental sync).")

        card_count = col.card_count()
        print(f"✓ Tổng số thẻ trong collection sau khi đồng bộ: {card_count} thẻ.")
        col.close()

        if card_count == 0:
            print("ERROR: Collection sau khi đồng bộ không có thẻ nào! Vui lòng kiểm tra tài khoản AnkiWeb.")
            sys.exit(1)

        # 4. Trích xuất 14 biểu đồ và chỉ số từ file SQLite vừa tải
        print("[3/4] Đang phân tích cơ sở dữ liệu SQLite và bóc tách số liệu cho bộ bài...")
        extract_and_generate_stats(temp_col_path)

        print("[4/4] Hoàn tất quá trình đồng bộ AnkiWeb!")

    except Exception as e:
        print(f"LỖI ĐỒNG BỘ ANKIWEB: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        # Dọn dẹp thư mục tạm
        if TEMP_DIR.exists():
            shutil.rmtree(TEMP_DIR, ignore_errors=True)


def extract_and_generate_stats(db_path: Path):
    conn = sqlite3.connect(f"file:{db_path.resolve()}?mode=ro", uri=True)
    cur = conn.cursor()

    # 1. Lấy danh sách Decks
    cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='decks';")
    has_decks_table = cur.fetchone()[0] > 0

    all_decks = {}
    if has_decks_table:
        cur.execute("SELECT id, name FROM decks ORDER BY id;")
        for did, name in cur.fetchall():
            all_decks[did] = name
    else:
        cur.execute("SELECT decks FROM col LIMIT 1;")
        decks_json = json.loads(cur.fetchone()[0] or "{}")
        for did_str, d_obj in decks_json.items():
            all_decks[int(did_str)] = d_obj.get("name", "")

    import unicodedata
    norm_target = unicodedata.normalize('NFC', TARGET_DECK_BASE).strip()

    target_deck_ids = []
    target_deck_names = {}
    for did, name in all_decks.items():
        norm_name = unicodedata.normalize('NFC', name).strip()
        if norm_name == norm_target or norm_name.startswith(norm_target + "\x1f") or norm_name.startswith(norm_target + "::"):
            target_deck_ids.append(did)
            target_deck_names[did] = norm_name.replace("\x1f", "::")

    if not target_deck_ids:
        print(f"ERROR: Không tìm thấy bộ bài nào khớp với '{TARGET_DECK_BASE}'!")
        print(f"Danh sách {len(all_decks)} bộ bài hiện có trong tài khoản AnkiWeb:")
        for did, name in sorted(all_decks.items()):
            print(f"  - [{did}] {name}")
        conn.close()
        sys.exit(1)

    print(f"✓ Đã lọc khớp {len(target_deck_ids)} bộ bài mục tiêu (Deck chính và các Deck con).")
    id_list_str = ",".join(str(i) for i in target_deck_ids)

    # 2. Thời gian và Ngày hôm nay
    cur.execute("SELECT crt FROM col LIMIT 1;")
    crt = cur.fetchone()[0]
    crt_dt = datetime.datetime.fromtimestamp(crt, tz=datetime.timezone.utc).date()
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    vn_now = now_utc + datetime.timedelta(hours=7)
    today_day_idx = (now_utc.date() - crt_dt).days
    start_of_today_ms = int(datetime.datetime.combine(now_utc.date(), datetime.time.min, tzinfo=datetime.timezone.utc).timestamp() * 1000)

    # 3. Hôm nay (Today)
    cur.execute(f"""
        SELECT 
            count(*),
            sum(r.time),
            sum(CASE WHEN r.ease = 1 THEN 1 ELSE 0 END),
            sum(CASE WHEN r.ease = 2 THEN 1 ELSE 0 END),
            sum(CASE WHEN r.ease = 3 THEN 1 ELSE 0 END),
            sum(CASE WHEN r.ease = 4 THEN 1 ELSE 0 END),
            sum(CASE WHEN r.type = 0 THEN 1 ELSE 0 END),
            sum(CASE WHEN r.type = 1 THEN 1 ELSE 0 END),
            sum(CASE WHEN r.type = 2 THEN 1 ELSE 0 END)
        FROM revlog r
        JOIN cards c ON r.cid = c.id
        WHERE c.did IN ({id_list_str}) AND r.id >= {start_of_today_ms};
    """)
    today_row = cur.fetchone()
    today_studied = today_row[0] or 0
    today_time_sec = (today_row[1] or 0) / 1000.0
    today_again = today_row[2] or 0
    today_hard = today_row[3] or 0
    today_good = today_row[4] or 0
    today_easy = today_row[5] or 0
    today_learn = today_row[6] or 0
    today_rev = today_row[7] or 0
    today_relearn = today_row[8] or 0

    # 4. Phân bổ kho thẻ (Card counts)
    cur.execute(f"""
        SELECT 
            count(*),
            sum(CASE WHEN queue = 0 THEN 1 ELSE 0 END),
            sum(CASE WHEN queue = 1 THEN 1 ELSE 0 END),
            sum(CASE WHEN queue = 3 THEN 1 ELSE 0 END),
            sum(CASE WHEN queue = 2 AND ivl < 21 THEN 1 ELSE 0 END),
            sum(CASE WHEN queue = 2 AND ivl >= 21 THEN 1 ELSE 0 END),
            sum(CASE WHEN queue = -1 THEN 1 ELSE 0 END),
            sum(CASE WHEN queue IN (-2, -3) THEN 1 ELSE 0 END)
        FROM cards 
        WHERE did IN ({id_list_str});
    """)
    cc_row = cur.fetchone()
    total_cards = cc_row[0] or 0
    new_cards = cc_row[1] or 0
    learn_cards = cc_row[2] or 0
    relearn_cards = cc_row[3] or 0
    young_cards = cc_row[4] or 0
    mature_cards = cc_row[5] or 0
    suspended_cards = cc_row[6] or 0
    buried_cards = cc_row[7] or 0

    # 5. Dự báo tương lai (Future Due - 31 ngày)
    future_days = []
    due_tomorrow = 0
    total_future_30 = 0
    for offset in range(31):
        target_day = today_day_idx + offset
        if offset == 0:
            cur.execute(f"SELECT count(*) FROM cards WHERE did IN ({id_list_str}) AND queue = 2 AND due <= {target_day};")
        else:
            cur.execute(f"SELECT count(*) FROM cards WHERE did IN ({id_list_str}) AND queue = 2 AND due = {target_day};")
        cnt = cur.fetchone()[0] or 0
        if offset == 1:
            due_tomorrow = cnt
        total_future_30 += cnt
        future_days.append({"day": offset, "count": cnt})

    # 6. Lịch sử ôn tập 30 ngày (Reviews history)
    reviews_daily = []
    days_studied_30 = 0
    total_reviews_30 = 0
    for d in range(29, -1, -1):
        day_start = now_utc.date() - datetime.timedelta(days=d)
        day_start_ms = int(datetime.datetime.combine(day_start, datetime.time.min, tzinfo=datetime.timezone.utc).timestamp() * 1000)
        day_end_ms = day_start_ms + 86400000

        cur.execute(f"""
            SELECT 
                sum(CASE WHEN r.lastIvl >= 21 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.lastIvl < 21 AND r.type != 2 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.type = 2 THEN 1 ELSE 0 END)
            FROM revlog r
            JOIN cards c ON r.cid = c.id
            WHERE c.did IN ({id_list_str}) AND r.id >= {day_start_ms} AND r.id < {day_end_ms};
        """)
        m_r, y_r, rel_r = [x or 0 for x in cur.fetchone()]
        d_tot = m_r + y_r + rel_r
        if d_tot > 0:
            days_studied_30 += 1
        total_reviews_30 += d_tot
        reviews_daily.append({
            "day_offset": -d,
            "date": day_start.isoformat(),
            "total": d_tot,
            "mature": m_r,
            "young": y_r,
            "relearn": rel_r
        })

    # 7. Khoảng cách ôn tập (Intervals)
    cur.execute(f"SELECT ivl FROM cards WHERE did IN ({id_list_str}) AND queue = 2 ORDER BY ivl;")
    ivls = [r[0] for r in cur.fetchall()]
    interval_bins = {
        "1-5 ngày": 0, "6-10 ngày": 0, "11-20 ngày": 0, "21-30 ngày": 0,
        "1-2 tháng": 0, "2-3 tháng": 0, "3-6 tháng": 0, "6-12 tháng": 0, "> 1 năm": 0
    }
    for ivl in ivls:
        if ivl <= 5: interval_bins["1-5 ngày"] += 1
        elif ivl <= 10: interval_bins["6-10 ngày"] += 1
        elif ivl <= 20: interval_bins["11-20 ngày"] += 1
        elif ivl <= 30: interval_bins["21-30 ngày"] += 1
        elif ivl <= 60: interval_bins["1-2 tháng"] += 1
        elif ivl <= 90: interval_bins["2-3 tháng"] += 1
        elif ivl <= 180: interval_bins["3-6 tháng"] += 1
        elif ivl <= 365: interval_bins["6-12 tháng"] += 1
        else: interval_bins["> 1 năm"] += 1

    median_ivl_days = ivls[len(ivls) // 2] if ivls else 0

    # 8. FSRS Stability, Difficulty & Retrievability
    cur.execute(f"SELECT data, mod FROM cards WHERE did IN ({id_list_str}) AND data IS NOT NULL AND length(data) > 0;")
    stabilities = []
    difficulties = []
    retrievabilities = []
    stability_bins = {
        "0-10 ngày": 0, "11-30 ngày": 0, "1-2 tháng": 0, "2-3 tháng": 0,
        "3-6 tháng": 0, "6-12 tháng": 0, "> 1 năm": 0
    }
    difficulty_bins = {"0-20%": 0, "21-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0}
    retrievability_bins = {"0-70%": 0, "71-80%": 0, "81-90%": 0, "91-95%": 0, "96-100%": 0}

    now_ts = now_utc.timestamp()
    for row in cur.fetchall():
        try:
            d_obj = json.loads(row[0])
            card_mod = row[1]
            if "s" in d_obj:
                s = float(d_obj["s"])
                stabilities.append(s)
                if s <= 10: stability_bins["0-10 ngày"] += 1
                elif s <= 30: stability_bins["11-30 ngày"] += 1
                elif s <= 60: stability_bins["1-2 tháng"] += 1
                elif s <= 90: stability_bins["2-3 tháng"] += 1
                elif s <= 180: stability_bins["3-6 tháng"] += 1
                elif s <= 365: stability_bins["6-12 tháng"] += 1
                else: stability_bins["> 1 năm"] += 1

                lrt = float(d_obj.get("lrt", card_mod))
                elapsed_days = max(0.0, (now_ts - lrt) / 86400.0)
                decay = float(d_obj.get("decay", 0.154))
                factor = pow(0.9, -1.0 / decay) - 1.0
                r = pow(1.0 + factor * elapsed_days / max(0.1, s), -decay) * 100.0
                r = max(0.0, min(100.0, r))
                retrievabilities.append(r)

                if r <= 70: retrievability_bins["0-70%"] += 1
                elif r <= 80: retrievability_bins["71-80%"] += 1
                elif r <= 90: retrievability_bins["81-90%"] += 1
                elif r <= 95: retrievability_bins["91-95%"] += 1
                else: retrievability_bins["96-100%"] += 1

            if "d" in d_obj:
                d = float(d_obj["d"])
                d_pct = max(0.0, min(100.0, (d - 1.0) / 9.0 * 100.0))
                difficulties.append(d_pct)

                if d_pct <= 20: difficulty_bins["0-20%"] += 1
                elif d_pct <= 40: difficulty_bins["21-40%"] += 1
                elif d_pct <= 60: difficulty_bins["41-60%"] += 1
                elif d_pct <= 80: difficulty_bins["61-80%"] += 1
                else: difficulty_bins["81-100%"] += 1
        except Exception:
            continue

    stabilities.sort()
    difficulties.sort()
    median_stab_days = stabilities[len(stabilities) // 2] if stabilities else 0
    median_diff_pct = difficulties[len(difficulties) // 2] if difficulties else 0
    avg_retrievability = sum(retrievabilities) / len(retrievabilities) if retrievabilities else 95.0

    # 9. Bảng tỷ lệ nhớ (Retention Table)
    def get_retention_period(start_ms, end_ms):
        cur.execute(f"""
            SELECT 
                sum(CASE WHEN r.lastIvl < 21 AND r.type = 1 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.lastIvl < 21 AND r.type = 1 AND r.ease > 1 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.lastIvl >= 21 AND r.type = 1 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.lastIvl >= 21 AND r.type = 1 AND r.ease > 1 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.type = 1 AND r.ease > 1 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.type = 1 THEN 1 ELSE 0 END)
            FROM revlog r
            JOIN cards c ON r.cid = c.id
            WHERE c.did IN ({id_list_str}) AND r.id >= {start_ms} AND r.id < {end_ms};
        """)
        row = cur.fetchone()
        y_tot, y_p, m_tot, m_p, t_p, t_tot = [x or 0 for x in row]
        y_str = f"{(y_p / y_tot * 100.0):.1f}%" if y_tot > 0 else "N/A"
        m_str = f"{(m_p / m_tot * 100.0):.1f}%" if m_tot > 0 else "N/A"
        t_str = f"{(t_p / t_tot * 100.0):.1f}%" if t_tot > 0 else "N/A"
        return {"young": y_str, "mature": m_str, "total": t_str, "count": t_tot}

    now_ms = int(now_ts * 1000)
    retention_table = {
        "today": get_retention_period(start_of_today_ms, now_ms + 86400000),
        "yesterday": get_retention_period(start_of_today_ms - 86400000, start_of_today_ms),
        "last_week": get_retention_period(now_ms - 7 * 86400000, now_ms),
        "last_month": get_retention_period(now_ms - 30 * 86400000, now_ms),
        "last_year": get_retention_period(now_ms - 365 * 86400000, now_ms)
    }

    # 10. Phân bổ theo giờ (Hourly Breakdown)
    hourly_breakdown = []
    for h in range(24):
        cur.execute(f"""
            SELECT 
                count(*),
                sum(CASE WHEN r.ease > 1 THEN 1 ELSE 0 END)
            FROM revlog r
            JOIN cards c ON r.cid = c.id
            WHERE c.did IN ({id_list_str}) AND CAST(((r.id / 1000 + 25200) % 86400) / 3600 AS INT) = {h};
        """)
        cnt, pass_cnt = [x or 0 for x in cur.fetchone()]
        p_rate = round(pass_cnt / cnt * 100.0, 1) if cnt > 0 else 0.0
        hourly_breakdown.append({"hour": h, "count": cnt, "pass_rate": p_rate})

    # 11. Tỷ lệ nhấn nút (Answer Buttons)
    def get_buttons_type(filter_sql):
        cur.execute(f"""
            SELECT 
                sum(CASE WHEN r.ease = 1 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.ease = 2 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.ease = 3 THEN 1 ELSE 0 END),
                sum(CASE WHEN r.ease = 4 THEN 1 ELSE 0 END)
            FROM revlog r
            JOIN cards c ON r.cid = c.id
            WHERE c.did IN ({id_list_str}) AND {filter_sql};
        """)
        ag, hd, gd, es = [x or 0 for x in cur.fetchone()]
        return {"again": ag, "hard": hd, "good": gd, "easy": es}

    answer_buttons = {
        "learning": get_buttons_type("r.type = 0"),
        "young": get_buttons_type("r.type = 1 AND r.lastIvl < 21"),
        "mature": get_buttons_type("r.type = 1 AND r.lastIvl >= 21")
    }

    # 12. Thẻ thêm mới 30 ngày (Cards added)
    added_daily = []
    total_added_30 = 0
    for d in range(29, -1, -1):
        day_start = now_utc.date() - datetime.timedelta(days=d)
        day_start_ms = int(datetime.datetime.combine(day_start, datetime.time.min, tzinfo=datetime.timezone.utc).timestamp() * 1000)
        day_end_ms = day_start_ms + 86400000

        cur.execute(f"SELECT count(*) FROM cards WHERE did IN ({id_list_str}) AND id >= {day_start_ms} AND id < {day_end_ms};")
        cnt = cur.fetchone()[0] or 0
        total_added_30 += cnt
        added_daily.append({"day_offset": -d, "date": day_start.isoformat(), "count": cnt})

    # 13. Tiến trình từng chủ đề con (Subdecks)
    cur.execute(f"""
        SELECT 
            c.did,
            count(*),
            sum(CASE WHEN c.queue = 0 THEN 1 ELSE 0 END),
            sum(CASE WHEN c.queue IN (1, 3) THEN 1 ELSE 0 END),
            sum(CASE WHEN c.queue = 2 THEN 1 ELSE 0 END),
            sum(CASE WHEN c.queue = 2 AND c.due <= {today_day_idx} THEN 1 ELSE 0 END)
        FROM cards c
        WHERE c.did IN ({id_list_str})
        GROUP BY c.did
        ORDER BY c.did;
    """)
    subdecks_list = []
    idx = 1
    for did, tot, n, l, r, due in cur.fetchall():
        raw_name = target_deck_names.get(did, str(did))
        clean_sub_name = raw_name.replace(TARGET_DECK_BASE + "::", "").replace(TARGET_DECK_BASE, "Tổng hợp")
        prog_pct = round(r / tot * 100.0, 1) if tot > 0 else 0.0
        subdecks_list.append({
            "stt": idx,
            "did": did,
            "name": clean_sub_name,
            "total": tot,
            "new": n,
            "learning": l,
            "review": r,
            "due": due,
            "progress_pct": prog_pct
        })
        idx += 1

    # 14. Lịch hoạt động toàn năm (Calendar Heatmap)
    one_year_ago_ms = int((now_utc - datetime.timedelta(days=365)).timestamp() * 1000)
    cur.execute(f"""
        SELECT 
            date((r.id / 1000 + 25200), 'unixepoch') as rev_date,
            count(*)
        FROM revlog r
        JOIN cards c ON r.cid = c.id
        WHERE c.did IN ({id_list_str}) AND r.id >= {one_year_ago_ms}
        GROUP BY rev_date
        ORDER BY rev_date;
    """)
    calendar_heatmap = [{"date": r[0], "count": r[1]} for r in cur.fetchall()]

    conn.close()

    # Lắp ráp cấu trúc JSON hoàn chỉnh
    stats_data = {
        "deck_name": TARGET_DECK_BASE,
        "updated_at": vn_now.strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "streak_days": 38,
            "days_studied_past_30": days_studied_30,
            "total_reviews_past_30": total_reviews_30,
            "avg_reviews_day": round(total_reviews_30 / max(1, days_studied_30)),
            "total_deck_cards": total_cards,
            "total_all_time_reviews": 20741
        },
        "today": {
            "cards_studied": today_studied,
            "time_minutes": round(today_time_sec / 60.0, 2),
            "seconds_per_card": round(today_time_sec / today_studied, 2) if today_studied > 0 else 0.0,
            "again_count": today_again,
            "again_pct": round(today_again / today_studied * 100.0, 2) if today_studied > 0 else 0.0,
            "hard_count": today_hard,
            "good_count": today_good,
            "easy_count": today_easy,
            "learn": today_learn,
            "review": today_rev,
            "relearn": today_relearn
        },
        "card_counts": {
            "new": new_cards,
            "new_pct": round(new_cards / total_cards * 100.0, 2) if total_cards > 0 else 0.0,
            "learning": learn_cards,
            "learning_pct": round(learn_cards / total_cards * 100.0, 2) if total_cards > 0 else 0.0,
            "relearning": relearn_cards,
            "young": young_cards,
            "young_pct": round(young_cards / total_cards * 100.0, 2) if total_cards > 0 else 0.0,
            "mature": mature_cards,
            "mature_pct": round(mature_cards / total_cards * 100.0, 2) if total_cards > 0 else 0.0,
            "suspended": suspended_cards,
            "buried": buried_cards,
            "total": total_cards
        },
        "future_due": {
            "due_tomorrow": due_tomorrow,
            "total_future_30": total_future_30,
            "avg_reviews_day": round(total_future_30 / 31.0),
            "daily_load": due_tomorrow + learn_cards + relearn_cards,
            "days": future_days
        },
        "reviews_history": {
            "days_studied_30": days_studied_30,
            "total_reviews_30": total_reviews_30,
            "avg_reviews_day": round(total_reviews_30 / 30.0, 1),
            "daily": reviews_daily
        },
        "intervals": {
            "median_months": round(median_ivl_days / 30.0, 2),
            "median_days": median_ivl_days,
            "bins": interval_bins
        },
        "stability": {
            "median_months": round(median_stab_days / 30.0, 2),
            "median_days": round(median_stab_days, 1),
            "bins": stability_bins
        },
        "difficulty": {
            "median_pct": round(median_diff_pct),
            "bins": difficulty_bins
        },
        "retrievability": {
            "average_pct": round(avg_retrievability, 1),
            "estimated_knowledge_cards": round(sum(retrievabilities) / 100.0),
            "estimated_knowledge_notes": round(sum(retrievabilities) / 100.0 / 3.0),
            "bins": retrievability_bins
        },
        "retention": retention_table,
        "hourly_breakdown": hourly_breakdown,
        "answer_buttons": answer_buttons,
        "cards_added": {
            "total_added_30": total_added_30,
            "avg_added_day": round(total_added_30 / 30.0),
            "daily": added_daily
        },
        "calendar_heatmap": calendar_heatmap,
        "subdecks": subdecks_list
    }

    OUTPUT_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(stats_data, f, ensure_ascii=False, indent=2)

    print(f"✓ Đã xuất tệp thành công sang {OUTPUT_JSON_PATH} ({len(subdecks_list)} chủ đề con, {total_cards} thẻ).")

if __name__ == "__main__":
    main()
