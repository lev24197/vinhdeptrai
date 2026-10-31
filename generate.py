import os
import json
import time
from datetime import datetime, timezone, timedelta
import pandas as pd
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# Cấu hình đường dẫn
EXCEL_FILE = "topics.xlsx"
STATUS_FILE = "status.json"
OUTPUT_DIR = "output"
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "3"))
TARGET_STT = os.environ.get("TARGET_STT", "").strip()

# Khởi tạo Gemini Client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

class NounItem(BaseModel):
    word: str = Field(description="Singular English noun in lowercase, e.g., 'government' or 'prime minister'")
    ipa: str = Field(description="US IPA transcription enclosed in slashes, e.g., '/ˈɡʌv.ɚn.mənt/'")
    definition: str = Field(description="Clear, concise English definition of the noun")
    meaning_vi: str = Field(description="Vietnamese meaning of the noun, e.g., 'chính phủ'")
    plural: str = Field(description="Plural form of the noun, e.g., 'governments'")
    example_1: str = Field(description="First natural English example sentence using the word")
    example_2: str = Field(description="Second natural English example sentence using the word")

class NounList(BaseModel):
    items: list[NounItem]

def make_cloze(word: str) -> str:
    """Biến đổi 'prime minister' -> 'p___e m______r'"""
    parts = word.strip().split(" ")
    cloze_parts = []
    for p in parts:
        if len(p) <= 2:
            cloze_parts.append(p)
        else:
            cloze_parts.append(p[0] + "_" * (len(p) - 2) + p[-1])
    return " ".join(cloze_parts)

def make_sound(word: str) -> str:
    """Biến đổi 'prime minister' -> '[sound:prime_minister.mp3]'"""
    clean_word = "_".join(word.strip().lower().split())
    return f"[sound:{clean_word}.mp3]"

def clean_field(text: str) -> str:
    """Loại bỏ ký tự xuống dòng và tab thừa để không làm hỏng cấu trúc TSV"""
    return str(text).replace("\t", " ").replace("\n", " ").replace("\r", " ").strip()

def fetch_batch(topic_vi: str, count: int, exclude_words: list[str]) -> list[NounItem]:
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
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=NounList,
            temperature=0.4,
        ),
    )
    parsed: NounList = response.parsed
    return parsed.items if parsed and parsed.items else []

def generate_100_nouns(topic_vi: str) -> list[NounItem]:
    collected: list[NounItem] = []
    seen = set()
    # Chia thành các lượt gọi 50 từ để tránh giới hạn token đầu ra và đảm bảo đủ 100 từ
    for attempt in range(4):
        needed = 100 - len(collected)
        if needed <= 0:
            break
        ask_count = min(55, needed + 5)
        batch = fetch_batch(topic_vi, ask_count, list(seen))
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
    # Lấy cột 1 làm STT, cột 2 làm Tên chủ đề
    col_stt = df.columns[0]
    col_topic = df.columns[1]

    status_data = {"updated_at": "", "topics": []}
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, "r", encoding="utf-8") as f:
            status_data = json.load(f)

    existing_map = {str(t["stt"]): t for t in status_data.get("topics", [])}
    synced_topics = []

    for _, row in df.iterrows():
        stt = str(int(row[col_stt])) if pd.notna(row[col_stt]) else ""
        topic_name = str(row[col_topic]).strip() if pd.notna(row[col_topic]) else ""
        if not stt or not topic_name:
            continue

        file_path = f"{OUTPUT_DIR}/{stt}.txt"
        if stt in existing_map:
            entry = existing_map[stt]
            entry["topic"] = topic_name
        else:
            entry = {
                "stt": int(stt),
                "topic": topic_name,
                "status": "pending",
                "word_count": 0,
                "file_path": file_path,
                "generated_at": None,
            }

        # Kiểm tra thực tế file trong thư mục output
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as tf:
                lines = [line for line in tf.read().splitlines() if line.strip()]
            if len(lines) > 0:
                entry["status"] = "completed"
                entry["word_count"] = len(lines)

        synced_topics.append(entry)

    status_data["topics"] = synced_topics
    return status_data

def save_status(status_data: dict):
    vn_tz = timezone(timedelta(hours=7))
    status_data["updated_at"] = datetime.now(vn_tz).strftime("%Y-%m-%d %H:%M:%S")
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(status_data, f, ensure_ascii=False, indent=2)

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    status_data = load_and_sync_status()
    save_status(status_data)

    # Xác định các chủ đề cần tạo trong lần chạy này
    if TARGET_STT:
        targets = [t for t in status_data["topics"] if str(t["stt"]) == TARGET_STT]
    else:
        targets = [t for t in status_data["topics"] if t["status"] != "completed"][:BATCH_SIZE]

    if not targets:
        print("Không có chủ đề nào cần tạo thêm.")
        return

    vn_tz = timezone(timedelta(hours=7))
    for entry in targets:
        stt = entry["stt"]
        topic_name = entry["topic"]
        print(f"Đang tạo chủ đề #{stt}: {topic_name}...")

        nouns = generate_100_nouns(topic_name)
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

            # 9 trường ngăn cách bởi phím Tab theo đúng chuẩn file mẫu
            row_tsv = "\t".join([w, cloze, ipa, sound, definition, vi, vi, plural, examples])
            lines.append(row_tsv)

        file_path = f"{OUTPUT_DIR}/{stt}.txt"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

        entry["status"] = "completed"
        entry["word_count"] = len(lines)
        entry["generated_at"] = datetime.now(vn_tz).strftime("%Y-%m-%d %H:%M")
        save_status(status_data)
        print(f"Hoàn thành #{stt} ({len(lines)} từ) -> {file_path}")

if __name__ == "__main__":
    main()
