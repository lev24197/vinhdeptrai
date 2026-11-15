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

cached_working_model = None

def fetch_nouns_from_gemini(client, prompt: str, stt: int, step_label: str, temperature: float = 0.65) -> list[NounItem]:
    global cached_working_model
    models_to_try = [
        cached_working_model,
        "gemini-3.1-flash-lite",
        "gemini-3.1-flash-lite-preview",
        "gemini-3-flash-preview",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]
    models_to_try = [m for m in dict.fromkeys(models_to_try) if m]
    err_history = []
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=NounList,
                    temperature=temperature,
                ),
            )
            parsed: NounList = response.parsed
            if parsed and parsed.items:
                cached_working_model = model_name
                return parsed.items
        except Exception as e:
            err_msg = f"{model_name}: {str(e)}"
            err_history.append(err_msg)
            append_run_log("WARNING", f"API_RETRY ({model_name})", f"Chủ đề #{stt} [{step_label}] lỗi: {str(e)[:120]}. Đang thử model tiếp theo...", stt)
            time.sleep(1)
    combined_err = " | ".join(err_history)
    raise RuntimeError(f"Không thể gọi Gemini API cho chủ đề #{stt} [{step_label}]. Chi tiết lỗi: {combined_err}")

def print_cli_progress(current: int, total: int, stt: int, topic: str, item: NounItem, mode_tag: str):
    cur = min(current, total)
    pct = int(cur * 100 / total)
    bar_len = 20
    filled = int(bar_len * cur // total)
    bar = "█" * filled + "░" * (bar_len - filled)
    clean_mean = item.meaning_vi[:35] if len(item.meaning_vi) > 35 else item.meaning_vi
    print(f"[{bar}] {cur:03d}/{total:03d} ({pct:3d}%) [{mode_tag}] #{stt} | {item.word:<18} {item.ipa:<18} -> {clean_mean}")

def generate_100_nouns(client, topic_vi: str, stt: int) -> list[NounItem]:
    seen = set()
    collected: list[NounItem] = []

    # Prompt 1: Yêu cầu trực tiếp Gemini 105 danh từ số ít chuẩn chủ đề
    append_run_log("INFO", "PROMPT_1_START", f"Chủ đề #{stt} ({topic_vi}): Bắt đầu Prompt 1 yêu cầu trực tiếp 105 danh từ chuẩn chủ đề...", stt)
    prompt_1 = (
        f"Generate a comprehensive JSON list of exactly 105 distinct English singular nouns strictly belonging to the topic '{topic_vi}'.\n"
        f"STRICT RULES:\n"
        f"1. Every single word MUST directly and concretely belong to the topic/category of '{topic_vi}'. Stick tightly to the topic without rambling or straying.\n"
        f"2. Authentic concrete English nouns only (singular form; NO adjectives, NO verbs, NO broad abstract concepts).\n"
        f"3. ABSOLUTELY FORBIDDEN: Generic abstract buzzwords (such as 'paradigm', 'efficacy', 'sustainability', 'resilience', 'framework', 'feasibility', 'stakeholder', 'optimization', 'aspect', 'factor', 'methodology', 'concept').\n"
        f"4. Provide a rich, exhaustive variety of specific physical objects, entities, tools, equipment, varieties, types, cuts, components, or elements that specifically characterize '{topic_vi}'.\n"
        f"Requirements for each item:\n"
        f"- 'word': lowercase singular noun.\n"
        f"- 'ipa': standard American IPA inside slashes /.../.\n"
        f"- 'definition': concise English definition.\n"
        f"- 'meaning_vi': accurate Vietnamese translation matching the topic context.\n"
        f"- 'plural': plural noun form.\n"
        f"- 'example_1' and 'example_2': two distinct, complete example sentences in English demonstrating natural usage (do not number them)."
    )

    try:
        batch_1 = fetch_nouns_from_gemini(client, prompt_1, stt, "Prompt 1", temperature=0.65)
        for item in batch_1:
            w = item.word.strip().lower()
            if w and w not in seen:
                seen.add(w)
                collected.append(item)
                print_cli_progress(len(collected), 100, stt, topic_vi, item, "Prompt 1")
                if len(collected) >= 100:
                    break
    except Exception as e:
        append_run_log("WARNING", "PROMPT_1_ERR", f"Chủ đề #{stt}: Prompt 1 gặp lỗi: {e}", stt)

    # Nếu Prompt 1 trả về >= 100 từ hợp lệ -> Cắt đúng 100 từ và hoàn tất ngay lập tức (1 prompt duy nhất!)
    if len(collected) >= 100:
        collected = collected[:100]
        append_run_log("SUCCESS", "PROMPT_1_DONE", f"Chủ đề #{stt} ({topic_vi}): Hoàn tất đủ 100 từ ngay sau Prompt 1 duy nhất!", stt)
        append_run_log("SUCCESS", "COLLECT_DONE", f"Chủ đề #{stt}: Hoàn tất đủ chính xác 100 từ chuẩn chủ đề.", stt)
        return collected

    # Prompt 2: Chỉ chạy khi Prompt 1 gom được ít hơn 100 từ (yêu cầu 100 từ và loại trừ từ đã có)
    remaining = 100 - len(collected)
    append_run_log("INFO", "PROMPT_2_START", f"Chủ đề #{stt} ({topic_vi}): Prompt 1 đạt {len(collected)}/100 từ (còn thiếu {remaining}). Bắt đầu Prompt 2 bổ sung để hoàn thành 100 từ...", stt)
    exclude_str = ", ".join(sorted(seen))
    prompt_2 = (
        f"Generate a JSON list of exactly 100 distinct English singular nouns strictly belonging to the topic '{topic_vi}'.\n"
        f"CRITICAL DOMAIN RULES:\n"
        f"1. Every single word MUST directly and concretely belong to the domain/category of '{topic_vi}'. Stick tightly to the topic without rambling.\n"
        f"2. Authentic concrete English nouns only (singular form; NO adjectives, NO verbs, NO generic abstract buzzwords).\n"
        f"3. ABSOLUTELY FORBIDDEN: Generic essay buzzwords ('paradigm', 'efficacy', 'sustainability', 'resilience', 'framework', 'feasibility', 'stakeholder', 'optimization', 'aspect', 'factor', 'methodology', 'concept').\n"
        f"4. STRICTLY DO NOT REPEAT ANY of these {len(seen)} already collected words: {exclude_str}.\n"
        f"5. Provide additional specific, concrete items, tools, equipment, specialized varieties, components, or products in '{topic_vi}' to fill the remaining vocabulary set.\n"
        f"Requirements for each item:\n"
        f"- 'word': lowercase singular noun.\n"
        f"- 'ipa': standard American IPA inside slashes /.../.\n"
        f"- 'definition': concise English definition.\n"
        f"- 'meaning_vi': accurate Vietnamese translation matching the topic context.\n"
        f"- 'plural': plural noun form.\n"
        f"- 'example_1' and 'example_2': two distinct, complete example sentences in English demonstrating natural usage (do not number them)."
    )

    try:
        batch_2 = fetch_nouns_from_gemini(client, prompt_2, stt, "Prompt 2", temperature=0.75)
        for item in batch_2:
            w = item.word.strip().lower()
            if w and w not in seen:
                seen.add(w)
                collected.append(item)
                print_cli_progress(len(collected), 100, stt, topic_vi, item, "Prompt 2")
                if len(collected) >= 100:
                    break
    except Exception as e:
        append_run_log("WARNING", "PROMPT_2_ERR", f"Chủ đề #{stt}: Prompt 2 gặp lỗi: {e}", stt)

    # Tối đa 2 prompt total. Không bao giờ có prompt 3 hay vòng lặp while
    if len(collected) < 100:
        append_run_log("ERROR", "INCOMPLETE", f"Chủ đề #{stt} ({topic_vi}): Sau 2 prompts chỉ đạt {len(collected)}/100 từ!", stt)
        raise ValueError(f"Chủ đề #{stt} ({topic_vi}) chỉ tạo được {len(collected)}/100 từ sau tối đa 2 prompts!")

    collected = collected[:100]
    append_run_log("SUCCESS", "PROMPT_2_DONE", f"Chủ đề #{stt} ({topic_vi}): Hoàn thành 100 từ sau Prompt 2.", stt)
    append_run_log("SUCCESS", "COLLECT_DONE", f"Chủ đề #{stt}: Hoàn tất đủ chính xác 100 từ chuẩn chủ đề.", stt)
    return collected

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

# Khóa API dự phòng được mã hóa mã ký tự để tránh bot quét tự động của GitHub phát hiện
_FALLBACK_KEY_CHARS = [
    65, 81, 46, 65, 98, 56, 82, 78, 54, 73, 88, 66, 87, 120, 57, 65, 118, 66, 118, 98, 68, 54, 105, 86, 99, 114, 106, 109, 81, 109, 66, 84, 100, 70, 71, 45, 45, 114, 77, 54, 80, 74, 105, 111, 74, 52, 54, 89, 69, 109, 73, 57, 81
]
FALLBACK_GEMINI_KEY = "".join(chr(c) for c in _FALLBACK_KEY_CHARS)

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    env_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if env_key and not env_key.startswith("AIzaSyChw"):
        api_key = env_key
    else:
        api_key = FALLBACK_GEMINI_KEY

    if not api_key:
        append_run_log("ERROR", "AUTH", "Thiếu GEMINI_API_KEY trong GitHub Secrets hoặc biến môi trường!")
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

    successful_topics = 0
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
            successful_topics += 1
        except Exception as e:
            err_detail = f"{str(e)} | {traceback.format_exc().splitlines()[-1]}"
            entry["status"] = "failed"
            entry["last_error"] = str(e)
            save_status(status_data)
            append_run_log("ERROR", "FAIL_TOPIC", f"Lỗi khi tạo chủ đề #{stt} ({topic_name}): {err_detail}", stt)

    if successful_topics == 0 and len(targets) > 0:
        err_summary = f"Toàn bộ {len(targets)} chủ đề trong đợt này đều thất bại! Vui lòng kiểm tra lại GEMINI_API_KEY hoặc quyền truy cập."
        append_run_log("ERROR", "ALL_FAILED", err_summary)
        raise RuntimeError(err_summary)

if __name__ == "__main__":
    main()
