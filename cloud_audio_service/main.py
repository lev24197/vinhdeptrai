import os
import io
import re
import time
import zipfile
import logging
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Khởi tạo logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("audio_service")

app = FastAPI(
    title="Anki Audio Crawler Service (Cambridge + Google Cloud TTS)",
    description="Microservice cào âm thanh chất lượng cao từ Cambridge Dictionary và Google Cloud TTS cho Anki.",
    version="1.0.0"
)

# Bật CORS cho phép gọi từ GitHub Pages và localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_WORKERS = 10
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Cache lưu file âm thanh tạm thời trong RAM để phát ngay tức thì
AUDIO_MEMORY_CACHE = {}

# Khởi tạo Google Cloud Text-to-Speech client (nếu có credentials)
gcp_tts_client = None
try:
    from google.cloud import texttospeech
    gcp_tts_client = texttospeech.TextToSpeechClient()
    logger.info("Google Cloud Text-to-Speech client initialized successfully.")
except Exception as e:
    logger.warning(f"Chưa cấu hình GCP Service Account hoặc thư viện TTS ({e}). Sẽ dùng Google TTS fallback.")

def fetch_cambridge_audio(word: str) -> tuple[Optional[bytes], Optional[str]]:
    """
    Cào âm thanh từ từ điển Cambridge.
    Ưu tiên 1: Giọng Mỹ (US)
    Ưu tiên 2: Giọng Anh (UK)
    """
    slug = word.strip().lower().replace(" ", "-")
    url = f"https://dictionary.cambridge.org/dictionary/english/{quote(slug)}"
    headers = {
        "User-Agent": USER_AGENT,
        "Referer": "https://dictionary.cambridge.org/",
        "Accept-Language": "en-US,en;q=0.9"
    }

    try:
        res = requests.get(url, headers=headers, timeout=8)
        if res.status_code != 200:
            return None, None

        soup = BeautifulSoup(res.text, "html.parser")
        sources = soup.find_all("source", type="audio/mpeg")
        us_url, uk_url = None, None

        for s in sources:
            src = s.get("src", "")
            if not src:
                continue
            full_src = src if src.startswith("http") else "https://dictionary.cambridge.org" + src
            if ("us_pron" in src or "/us/" in src) and not us_url:
                us_url = full_src
            elif ("uk_pron" in src or "/uk/" in src) and not uk_url:
                uk_url = full_src

        target_url = us_url or uk_url
        source_name = "1. Cambridge (US)" if target_url == us_url else "1. Cambridge (UK)"

        if target_url:
            audio_res = requests.get(target_url, headers=headers, timeout=10)
            if audio_res.status_code == 200 and len(audio_res.content) > 500:
                return audio_res.content, source_name

    except Exception as e:
        logger.debug(f"Lỗi khi cào Cambridge cho '{word}': {e}")

    return None, None

def generate_gcp_cloud_tts(word: str) -> tuple[Optional[bytes], Optional[str]]:
    """
    Tạo âm thanh chuẩn Studio/Neural2 bằng Google Cloud Text-to-Speech API.
    """
    if gcp_tts_client:
        try:
            from google.cloud import texttospeech
            s_input = texttospeech.SynthesisInput(text=word.strip())
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US",
                name="en-US-Neural2-F",  # Giọng nữ phát thanh viên bản xứ Mỹ cực tự nhiên
                ssml_gender=texttospeech.SsmlVoiceGender.FEMALE,
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=0.95
            )
            response = gcp_tts_client.synthesize_speech(
                input=s_input, voice=voice, audio_config=audio_config
            )
            if response.audio_content and len(response.audio_content) > 500:
                return response.audio_content, "2. Google Cloud TTS (Neural2 US)"
        except Exception as e:
            logger.warning(f"Lỗi gọi Google Cloud TTS cho '{word}': {e}")

    # Fallback cuối cùng nếu không có GCP Key: Google Translate TTS
    try:
        q = quote(word.strip())
        tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={q}&tl=en&client=tw-ob"
        res = requests.get(tts_url, headers={"User-Agent": USER_AGENT}, timeout=8)
        if res.status_code == 200 and len(res.content) > 500:
            return res.content, "2. Google TTS Fallback (US)"
    except Exception as e:
        logger.error(f"Lỗi fallback TTS cho '{word}': {e}")

    return None, None

def get_audio_for_word(word: str) -> tuple[Optional[bytes], str]:
    """
    Logic ưu tiên nghiêm ngặt:
    1. Ưu tiên số 1: Cambridge (US -> UK)
    2. Chốt chặn cuối: Google Cloud TTS (Neural2) / Google TTS
    """
    clean_w = word.strip().lower()
    if clean_w in AUDIO_MEMORY_CACHE:
        return AUDIO_MEMORY_CACHE[clean_w]

    # Bước 1: Cambridge
    data, src = fetch_cambridge_audio(clean_w)
    if data:
        AUDIO_MEMORY_CACHE[clean_w] = (data, src)
        return data, src

    # Bước 2: Google Cloud TTS
    data, src = generate_gcp_cloud_tts(clean_w)
    if data:
        AUDIO_MEMORY_CACHE[clean_w] = (data, src)
        return data, src

    return None, "Thất bại"

class CrawlTopicRequest(BaseModel):
    topic_id: int
    topic_name: str
    words: List[str]

@app.get("/")
def home():
    return {
        "service": "Anki Audio Crawler Service",
        "status": "online",
        "version": "1.0.0",
        "engine": "FastAPI + Cambridge Scraper + Google Cloud TTS",
        "docs": "/docs"
    }

@app.get("/audio/{word}")
def stream_word_audio(word: str):
    """
    Phát âm thanh trực tiếp cho 1 từ trên Web (dùng cho nút loa 🔊).
    """
    audio_data, src = get_audio_for_word(word)
    if not audio_data:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy âm thanh cho từ '{word}'")
    
    return Response(content=audio_data, media_type="audio/mpeg", headers={
        "X-Audio-Source": quote(src),
        "Cache-Control": "public, max-age=86400"
    })

@app.post("/crawl_zip")
def crawl_and_zip_topic(req: CrawlTopicRequest):
    """
    Cào âm thanh đa luồng cho toàn bộ danh sách từ của chủ đề và đóng gói thành file .ZIP.
    """
    start_time = time.time()
    words = [w.strip() for w in req.words if w and w.strip()]
    if not words:
        raise HTTPException(status_code=400, detail="Danh sách từ trống.")

    zip_buffer = io.BytesIO()
    source_stats = {}
    tts_fallback_list = []
    success_count = 0

    results = {}
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_map = {executor.submit(get_audio_for_word, w): w for w in words}
        for future in as_completed(future_map):
            w = future_map[future]
            try:
                audio_bytes, src_name = future.result()
                results[w] = (audio_bytes, src_name)
            except Exception as e:
                results[w] = (None, str(e))

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for w in words:
            audio_bytes, src_name = results.get(w, (None, "Không rõ"))
            # Tên file chuẩn hóa 1:1 theo cột Sound của Anki: "sea urchin" -> "sea_urchin.mp3"
            clean_filename = "_".join(w.lower().split()) + ".mp3"

            if audio_bytes:
                success_count += 1
                source_stats[src_name] = source_stats.get(src_name, 0) + 1
                zf.writestr(clean_filename, audio_bytes)
                if "Google" in src_name:
                    tts_fallback_list.append(f"{w} ({src_name})")
            else:
                logger.warning(f"Không thể tải âm thanh cho từ: {w}")

        # Thêm file báo cáo chi tiết
        elapsed = time.time() - start_time
        report_lines = [
            f"=== BÁO CÁO ÂM THANH CHỦ ĐỀ #{req.topic_id}: {req.topic_name.upper()} ===",
            f"Thời gian tạo: {time.strftime('%Y-%m-%d %H:%M:%S')}",
            f"Tổng số từ: {len(words)} | Tải thành công: {success_count}/{len(words)}",
            f"Thời gian xử lý: {elapsed:.2f} giây\n",
            "--- THỐNG KÊ NGUỒN PHÁT ÂM ---",
        ]
        for src, cnt in sorted(source_stats.items()):
            report_lines.append(f"- {src}: {cnt} từ")

        report_lines.append("\n--- CÁC TỪ DÙNG GOOGLE TTS (DO CAMBRIDGE KHÔNG CÓ) ---")
        if tts_fallback_list:
            report_lines.extend(tts_fallback_list)
        else:
            report_lines.append("Tất cả các từ đều được cào thành công từ từ điển Cambridge!")

        zf.writestr("bao_cao_am_thanh.txt", "\n".join(report_lines))

    zip_buffer.seek(0)
    filename = f"output_{req.topic_id}_audio.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Success-Count": str(success_count),
            "X-Total-Count": str(len(words))
        }
    )
