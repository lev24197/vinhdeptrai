import html
import os
import json
import time
import traceback
from datetime import datetime, timezone, timedelta
import pandas as pd
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

EXCEL_FILE = "topics.xlsx"
STATUS_FILE = "status.json"
LOG_FILE = "run_logs.json"
OUTPUT_DIR = "output"
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "3"))
TARGET_STT = os.environ.get("TARGET_STT", "").strip()

vn_tz = timezone(timedelta(hours=7))

def now_str() -> str:
    return datetime.now(vn_tz).strftime("%Y-%m-%d %H:%M:%S")

def append_run_log(level: str, step: str, message: str, stt=None):
    """Ghi nhật ký chạy vào run_logs.json để Web Dashboard hiển thị"""
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    logs = json.loads(content)
        except Exception:
            logs = []

    entry = {
        "time": now_str(),
        "level": level,  # INFO, SUCCESS, WARNING, ERROR
        "step": step,
        "stt": stt,
        "message": message
    }
    logs.insert(0, entry)
    logs = logs[:200]  # Giữ 200 dòng log gần nhất
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)
    print(f"[{level}] [{step}] {message}")

class NounItem(BaseModel):
    word: str = Field(description="Singular English noun in lowercase")
    ipa: str = Field(description="US IPA transcription enclosed in slashes, e.g., '/ˈɡʌv.ɚn.mənt/'")
    definition: str = Field(description="Clear, concise English definition of the noun")
    meaning_vi: str = Field(description="Vietnamese meaning of the noun")
    plural: str = Field(description="Plural form of the noun")
    example_1: str = Field(description="First natural English example sentence")
    example_2: str = Field(description="Second natural English example sentence")

class NounList(BaseModel):
    items: list[NounItem]

def make_cloze(word: str) -> str:
    parts = word.strip().split(" ")
    return " ".join([p if len(p) <= 2 else p[0] + "_" * (len(p) - 2) + p[-1] for p in parts])

def make_sound(word: str) -> str:
    clean_word = "_".join(word.strip().lower().split())
    return f"[sound:{clean_word}.mp3]"

def clean_field(text: str) -> str:
    return str(text).replace("\t", " ").replace("\n", " ").replace("\r", " ").strip()

def fetch_batch(client, topic_vi: str, count: int, exclude_words: list[str], stt: int, mode: str = "conversational") -> list[NounItem]:
    exclude_str = ", ".join(exclude_words) if exclude_words else "None"

    core_membership_rule = (
        f"CRITICAL CATEGORY MEMBERSHIP CONSTRAINT:
"
        f"1. 100% DIRECT DOMAIN MEMBERS & CORE ELEMENTS: Every single word MUST directly and concretely belong to the domain of '{topic_vi}'.
"
        f"   - Name actual tangible objects, varieties, specific sub-types, core ingredients, preparations, or key elements that uniquely define '{topic_vi}'.
"
        f"2. ABSOLUTELY FORBIDDEN - DO NOT GENERATE GENERIC ESSAY WORDS OR UNRELATED FLUFF:
"
        f"   - NEVER include general academic meta-words or abstract buzzwords: 'paradigm', 'efficacy', 'amelioration', 'resilience', 'sustainability', 'governance', 'policy', 'framework', 'stakeholder', 'optimization', 'vulnerability', 'scalability', 'feasibility'.
"
        f"3. STRICTLY NO ADJECTIVES, NO VERBS: Must be authentic English singular nouns or standard compound nouns."
    )

    if mode == "advanced":
        mode_instruction = (
            f"CATEGORY: ADVANCED, SPECIALIZED, PRIZED, OR GOURMET VARIETIES OF '{topic_vi}' (CEFR C1-C2 level).
"
            f"- Generate distinct, less common, prized, gourmet, or specialized varieties, species, and cuts of '{topic_vi}'.
"
            f"- Maintain 100% adherence to the 'IS-A' membership constraint above (NO biology textbook terms, NO gear, NO surroundings).
"
            f"{core_membership_rule}"
        )
    else:
        mode_instruction = (
            f"CATEGORY: POPULAR & COMMON CONVERSATIONAL MEMBERS OF '{topic_vi}' (CEFR A2-B2 level, essential daily vocabulary).
"
            f"- Generate the most popular, familiar, practical, and frequently encountered real-world varieties, species, and cuts of '{topic_vi}'.
"
            f"{core_membership_rule}"
        )

    prompt = (
        f"Generate exactly {count} distinct English nouns (single words or standard compound nouns) "
        f"that belong 100% to the category of '{topic_vi}'.
"
        f"{mode_instruction}
"
        f"Do NOT include any of these already generated words: {exclude_str}.
"
        f"Requirements:
"
        f"- 'word': lowercase singular noun.
"
        f"- 'ipa': standard American IPA inside slashes /.../.
"
        f"- 'definition': concise English definition.
"
        f"- 'meaning_vi': accurate Vietnamese translation matching the topic context.
"
        f"- 'plural': plural noun form.
"
        f"- 'example_1' and 'example_2': two distinct, complete example sentences in English demonstrating natural usage (do not number them)."
    )
    models_to_try = [
        "gemini-3.1-flash-lite-preview",
        "gemini-3.1-flash-lite",
        "gemini-3-flash-preview",
        "gemini-3-flash",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]
    err_history = []
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=NounList,
                    temperature=0.35,
                ),
            )
            parsed: NounList = response.parsed
            if parsed and parsed.items:
                return parsed.items
        except Exception as e:
            err_msg = f"{model_name}: {str(e)}"
            err_history.append(err_msg)
            append_run_log("WARNING", f"API_RETRY ({model_name})", f"Chủ đề #{stt} ({mode}) lỗi: {str(e)[:120]}. Đang thử model tiếp theo...", stt)
            time.sleep(1)
    combined_err = " | ".join(err_history)
    raise RuntimeError(f"Không thể gọi Gemini API cho chủ đề #{stt} ({mode}). Chi tiết lỗi: {combined_err}")

def print_cli_progress(current: int, total: int, stt: int, topic: str, item: NounItem, mode_tag: str):
    pct = int(current * 100 / total)
    bar_len = 20
    filled = int(bar_len * current // total)
    bar = "█" * filled + "░" * (bar_len - filled)
    clean_mean = item.meaning_vi[:35] if len(item.meaning_vi) > 35 else item.meaning_vi
    print(f"[{bar}] {current:03d}/{total:03d} ({pct:3d}%) [{mode_tag}] #{stt} | {item.word:<18} {item.ipa:<18} -> {clean_mean}")
def generate_100_nouns(client, topic_vi: str, stt: int) -> list[NounItem]:
    seen = set()
    conversational_nouns: list[NounItem] = []
    advanced_nouns: list[NounItem] = []

    # --- PHẦN 1: 50 DANH TỪ GIAO TIẾP THÔNG DỤNG (A2 - B2) ---
    append_run_log("INFO", "START_CONV", f"Bắt đầu tạo 50 từ giao tiếp thông dụng cho chủ đề #{stt} ({topic_vi})", stt)
    conv_attempt = 0
    while len(conversational_nouns) < 50 and conv_attempt < 15:
        conv_attempt += 1
        needed = 50 - len(conversational_nouns)
        ask_count = min(55, max(needed + 5, 15))
        append_run_log("INFO", f"CONV_BATCH_{conv_attempt}", f"Đang xin {ask_count} từ giao tiếp (#{stt}) - Đã có: {len(conversational_nouns)}/50", stt)
        batch = fetch_batch(client, topic_vi, ask_count, list(seen), stt, mode="conversational")
        for item in batch:
            w = item.word.strip().lower()
            if w and w not in seen:
                seen.add(w)
                conversational_nouns.append(item)
                print_cli_progress(len(conversational_nouns), 100, stt, topic_vi, item, 'A2-B2 Giao tiếp')
                if len(conversational_nouns) == 50:
                    break
        time.sleep(1)

    # --- PHẦN 2: 50 DANH TỪ NÂNG CAO THÔNG DỤNG (C1 - C2 / IELTS 7.5+) ---
    append_run_log("INFO", "START_ADV", f"Bắt đầu tạo 50 từ nâng cao thông dụng cho chủ đề #{stt} ({topic_vi})", stt)
    adv_attempt = 0
    while len(advanced_nouns) < 50 and adv_attempt < 15:
        adv_attempt += 1
        needed = 50 - len(advanced_nouns)
        ask_count = min(55, max(needed + 5, 15))
        append_run_log("INFO", f"ADV_BATCH_{adv_attempt}", f"Đang xin {ask_count} từ nâng cao (#{stt}) - Đã có: {len(advanced_nouns)}/50", stt)
        batch = fetch_batch(client, topic_vi, ask_count, list(seen), stt, mode="advanced")
        for item in batch:
            w = item.word.strip().lower()
            if w and w not in seen:
                seen.add(w)
                advanced_nouns.append(item)
                current_total = len(conversational_nouns) + len(advanced_nouns)
                print_cli_progress(current_total, 100, stt, topic_vi, item, 'C1-C2 Nâng cao')
                if len(advanced_nouns) == 50:
                    break
        time.sleep(1)

    total_nouns = conversational_nouns[:50] + advanced_nouns[:50]

    # --- PHẦN 3: BẢO HIỂM CHẮC CHẮN ĐẠT ĐỦ 100 TỪ (SAFETY TOP-UP LOOP) ---
    topup_attempt = 0
    while len(total_nouns) < 100 and topup_attempt < 15:
        topup_attempt += 1
        needed = 100 - len(total_nouns)
        ask_count = min(40, max(needed + 5, 12))
        append_run_log("WARNING", f"TOPUP_BATCH_{topup_attempt}", f"Chủ đề #{stt}: Bù đắp {needed} từ còn thiếu để đạt chuẩn 100 từ (Đang có: {len(total_nouns)}/100)...", stt)
        mode = "advanced" if len(advanced_nouns) < 50 else "conversational"
        batch = fetch_batch(client, topic_vi, ask_count, list(seen), stt, mode=mode)
        for item in batch:
            w = item.word.strip().lower()
            if w and w not in seen:
                seen.add(w)
                total_nouns.append(item)
                print_cli_progress(len(total_nouns), 100, stt, topic_vi, item, 'Bù đắp 100 từ')
                if len(total_nouns) == 100:
                    break
        time.sleep(1)

    total_nouns = total_nouns[:100]
    if len(total_nouns) < 100:
        raise ValueError(f"Chủ đề #{stt} ({topic_vi}) chỉ tạo được {len(total_nouns)}/100 từ sau nhiều lần thử lại!")

    append_run_log("SUCCESS", "COLLECT_DONE", f"Chủ đề #{stt}: Hoàn tất đủ 100 từ chuẩn (50 giao tiếp + 50 nâng cao).", stt)
    return total_nouns

def load_and_sync_status() -> dict:
    df = pd.read_excel(EXCEL_FILE)
    col_stt = df.columns[0]
    col_topic = df.columns[1]

    status_data = {"updated_at": "", "topics": []}
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    status_data = json.loads(content)
        except Exception as e:
            append_run_log("WARNING", "INIT_STATUS", f"File status.json trống hoặc lỗi ({e}), tự khởi tạo mới.")

    existing_map = {str(t["stt"]): t for t in status_data.get("topics", [])}
    synced_topics = []

    for _, row in df.iterrows():
        stt = str(int(row[col_stt])) if pd.notna(row[col_stt]) else ""
        topic_name = html.unescape(str(row[col_topic]).strip()) if pd.notna(row[col_topic]) else ""
        if not stt or not topic_name:
            continue

        file_path = f"{OUTPUT_DIR}/{stt}.txt"
        entry = existing_map.get(stt, {
            "stt": int(stt),
            "topic": topic_name,
            "status": "pending",
            "word_count": 0,
            "file_path": file_path,
            "generated_at": None,
            "last_error": None
        })
        entry["topic"] = topic_name

        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as tf:
                lines = [line for line in tf.read().splitlines() if line.strip()]
            if len(lines) >= 100:
                entry["status"] = "completed"
                entry["word_count"] = len(lines)
                entry["last_error"] = None
            elif len(lines) > 0:
                entry["status"] = "incomplete"
                entry["word_count"] = len(lines)
                entry["last_error"] = f"Thiếu từ ({len(lines)}/100 từ)"

        synced_topics.append(entry)

    status_data["topics"] = synced_topics
    return status_data

def save_status(status_data: dict):
    status_data["updated_at"] = now_str()
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(status_data, f, ensure_ascii=False, indent=2)

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        append_run_log("ERROR", "AUTH", "Thiếu GEMINI_API_KEY trong GitHub Secrets!")
        raise ValueError("Missing GEMINI_API_KEY")

    client = genai.Client(api_key=api_key)
    status_data = load_and_sync_status()
    save_status(status_data)

    if TARGET_STT:
        targets = [t for t in status_data["topics"] if str(t["stt"]) == TARGET_STT]
    else:
        # Ưu tiên các chủ đề bị thiếu từ (< 100 từ) chạy trước để sửa lỗi ngay lập tức
        incomplete = [t for t in status_data["topics"] if 0 < t.get("word_count", 0) < 100]
        pending = [t for t in status_data["topics"] if t.get("status") not in ("completed", "incomplete")]
        targets = (incomplete + pending)[:BATCH_SIZE]

    if not targets:
        append_run_log("INFO", "QUEUE", "Không có chủ đề nào cần tạo thêm.")
        return

    append_run_log("INFO", "START_JOB", f"Bắt đầu tiến trình tạo {len(targets)} chủ đề: {[t['stt'] for t in targets]}")

    for entry in targets:
        stt = entry["stt"]
        topic_name = entry["topic"]
        try:
            nouns = generate_100_nouns(client, topic_name, stt)
            lines = []
            for item in nouns:
                w = clean_field(item.word.lower())
                cloze = make_cloze(w)
                ipa = clean_field(item.ipa)
                if not ipa.startswith("/"):
                    ipa = f"/{ipa.strip('/')}/"
                sound = make_sound(w)
                definition = clean_field(item.definition)
                vi = clean_field(item.meaning_vi)
                plural = clean_field(item.plural.lower())
                ex1 = clean_field(item.example_1).lstrip("1234567890. ")
                ex2 = clean_field(item.example_2).lstrip("1234567890. ")
                examples = f"1. {ex1} <br>2. {ex2}"
                lines.append("\t".join([w, cloze, ipa, sound, definition, vi, vi, plural, examples]))

            if len(lines) != 100:
                raise ValueError(f"Chủ đề #{stt} ({topic_name}) bắt buộc phải có đúng 100 từ nhưng chỉ có {len(lines)} từ! Từ chối lưu file.")

            file_path = f"{OUTPUT_DIR}/{stt}.txt"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines) + "\n")

            entry["status"] = "completed"
            entry["word_count"] = len(lines)
            entry["generated_at"] = datetime.now(vn_tz).strftime("%Y-%m-%d %H:%M")
            entry["last_error"] = None
            save_status(status_data)
            append_run_log("SUCCESS", "DONE_TOPIC", f"Hoàn thành chủ đề #{stt} ({topic_name}) với {len(lines)} từ.", stt)
        except Exception as e:
            err_detail = f"{str(e)} | {traceback.format_exc().splitlines()[-1]}"
            entry["status"] = "failed"
            entry["last_error"] = str(e)
            save_status(status_data)
            append_run_log("ERROR", "FAIL_TOPIC", f"Lỗi khi tạo chủ đề #{stt} ({topic_name}): {err_detail}", stt)

if __name__ == "__main__":
    main()
