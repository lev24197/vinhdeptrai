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

def fetch_batch(client, topic_vi: str, count: int, exclude_words: list[str], stt: int) -> list[NounItem]:
    exclude_str = ", ".join(exclude_words) if exclude_words else "None"
    prompt = (
        f"Generate exactly {count} common and useful English nouns (single words or standard compound nouns) "
        f"related to the Vietnamese topic: '{topic_vi}'.\n"
        f"Do NOT include any of these already generated words: {exclude_str}.\n"
        f"Requirements:\n"
        f"- 'word': lowercase singular noun.\n"
        f"- 'ipa': standard American IPA inside slashes /.../.\n"
        f"- 'definition': concise English definition.\n"
        f"- 'meaning_vi': accurate Vietnamese translation matching the topic context.\n"
        f"- 'plural': plural noun form.\n"
        f"- 'example_1' and 'example_2': two distinct, complete example sentences in English (do not number them)."
    )
    models_to_try = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=NounList,
                    temperature=0.4,
                ),
            )
            parsed: NounList = response.parsed
            if parsed and parsed.items:
                return parsed.items
        except Exception as e:
            append_run_log("WARNING", f"API_RETRY ({model_name})", f"Chủ đề #{stt} gặp lỗi tạm thời: {str(e)}. Đang thử lại...", stt)
            time.sleep(5)
    raise RuntimeError(f"Không thể gọi Gemini API cho chủ đề #{stt} sau khi thử các model.")

def generate_100_nouns(client, topic_vi: str, stt: int) -> list[NounItem]:
    collected: list[NounItem] = []
    seen = set()
    for attempt in range(1, 5):
        needed = 100 - len(collected)
        if needed <= 0:
            break
        ask_count = min(55, needed + 5)
        append_run_log("INFO", f"BATCH_{attempt}", f"Đang xin {ask_count} từ cho chủ đề #{stt} ({topic_vi}) - Hiện có: {len(collected)}/100", stt)
        batch = fetch_batch(client, topic_vi, ask_count, list(seen), stt)
        for item in batch:
            w = item.word.strip().lower()
            if w and w not in seen:
                seen.add(w)
                collected.append(item)
                if len(collected) == 100:
                    break
        time.sleep(2)
    return collected[:100]

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
        topic_name = str(row[col_topic]).strip() if pd.notna(row[col_topic]) else ""
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
            if len(lines) > 0:
                entry["status"] = "completed"
                entry["word_count"] = len(lines)
                entry["last_error"] = None

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
        targets = [t for t in status_data["topics"] if t["status"] != "completed"][:BATCH_SIZE]

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
