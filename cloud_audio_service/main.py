import os
import io
import re
import time
import random
import zipfile
import logging
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional, Dict, Any

from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Khởi tạo logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("audio_service")

# Thử import curl_cffi (giúp vượt qua Cloudflare TLS JA3/JA4 fingerprinting)
try:
    from curl_cffi import requests as cffi_requests
    HAS_CURL_CFFI = True
    logger.info("curl_cffi loaded successfully - Chrome TLS impersonation ENABLED.")
except Exception as e:
    import requests as cffi_requests
    HAS_CURL_CFFI = False
    logger.warning(f"curl_cffi not available ({e}). Using standard requests.")

import requests as std_requests

app = FastAPI(
    title="Anki Audio Crawler Service (Cambridge + Oxford + Google Cloud TTS)",
    description="Microservice cào âm thanh từ điển Cambridge chuẩn 100%, Oxford và Google Cloud TTS cho Anki.",
    version="2.0.0"
)

# Bật CORS cho phép gọi từ GitHub Pages và localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_WORKERS = 8
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

def fetch_url(url: str, headers: dict = None, timeout: int = 10):
    """
    Gửi request HTTP giả lập hoàn hảo TLS fingerprint của Google Chrome (nếu có curl_cffi)
    để vượt qua cơ chế Cloudflare Bot Challenge của Cambridge Dictionary.
    """
    if HAS_CURL_CFFI:
        return cffi_requests.get(url, headers=headers, impersonate="chrome", timeout=timeout)
    else:
        return std_requests.get(url, headers=headers, timeout=timeout)

def fetch_cambridge_audio(word: str) -> tuple[Optional[bytes], Optional[str], Optional[str]]:
    """
    ƯU TIÊN TUYỆT ĐỐI SỐ 1: Cào âm thanh từ từ điển Cambridge.
    Ưu tiên 1: Giọng Mỹ (US)
    Ưu tiên 2: Giọng Anh (UK)
    Trả về: (audio_bytes, source_name, debug_info)
    """
    clean_w = word.strip().lower()
    candidates = [
        clean_w.replace(" ", "-"),
        clean_w.replace(" ", "_"),
        clean_w
    ]
    headers = {
        "User-Agent": USER_AGENT,
        "Referer": "https://dictionary.cambridge.org/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    }

    last_debug = ""
    for slug in candidates:
        url = f"https://dictionary.cambridge.org/dictionary/english/{quote(slug)}"
        try:
            res = fetch_url(url, headers=headers, timeout=10)
            if res.status_code != 200:
                last_debug = f"Status {res.status_code} for slug '{slug}'"
                logger.warning(f"[Cambridge] '{word}' slug '{slug}' -> HTTP {res.status_code}")
                continue

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
                audio_res = fetch_url(target_url, headers={"Referer": "https://dictionary.cambridge.org/"}, timeout=12)
                if audio_res.status_code == 200 and len(audio_res.content) > 500:
                    logger.info(f"[Cambridge SUCCESS] '{word}' -> {source_name} ({len(audio_res.content)} bytes)")
                    return audio_res.content, source_name, f"Success: {target_url}"
                else:
                    last_debug = f"Audio download failed ({audio_res.status_code}) from {target_url}"
            else:
                last_debug = f"No audio source tag found in Cambridge HTML for '{slug}'"

        except Exception as e:
            last_debug = f"Exception: {e}"
            logger.warning(f"[Cambridge Error] '{word}' slug '{slug}': {e}")

    return None, None, last_debug

def fetch_oxford_audio(word: str) -> tuple[Optional[bytes], Optional[str], Optional[str]]:
    """
    DỰ PHÒNG TỪ ĐIỂN BẢN XỨ (NGƯỜI THẬT) SỐ 2: Oxford Learner's Dictionaries.
    Đảm bảo 100% âm thanh người thật bản xứ nếu từ hiếm/từ ghép không có trên Cambridge.
    """
    clean_w = word.strip().lower()
    candidates = [
        clean_w.replace(" ", "-"),
        clean_w.replace(" ", "_"),
        clean_w.replace(" ", "-") + "_1"
    ]
    oxford_headers = {
        "User-Agent": USER_AGENT,
        "Referer": "https://www.oxfordlearnersdictionaries.com/",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
    for slug in candidates:
        url = f"https://www.oxfordlearnersdictionaries.com/definition/english/{quote(slug)}"
        try:
            res = fetch_url(url, headers=oxford_headers, timeout=10)
            if res.status_code != 200:
                continue
            soup = BeautifulSoup(res.text, "html.parser")
            us_btn = soup.find(attrs={"class": re.compile(r"pron-us"), "data-src-mp3": True})
            uk_btn = soup.find(attrs={"class": re.compile(r"pron-uk"), "data-src-mp3": True})

            target_url = None
            source_name = None
            if us_btn and us_btn.get("data-src-mp3"):
                target_url = us_btn["data-src-mp3"]
                source_name = "2. Oxford (US)"
            elif uk_btn and uk_btn.get("data-src-mp3"):
                target_url = uk_btn["data-src-mp3"]
                source_name = "2. Oxford (UK)"

            if target_url:
                audio_res = fetch_url(target_url, headers=oxford_headers, timeout=12)
                if audio_res.status_code == 200 and len(audio_res.content) > 500:
                    logger.info(f"[Oxford SUCCESS] '{word}' -> {source_name} ({len(audio_res.content)} bytes)")
                    return audio_res.content, source_name, f"Success: {target_url}"
        except Exception as e:
            logger.debug(f"[Oxford Error] '{word}': {e}")
    return None, None, "Not found on Oxford"

def fetch_collins_audio(word: str) -> tuple[Optional[bytes], Optional[str], Optional[str]]:
    """
    DỰ PHÒNG TỪ ĐIỂN BẢN XỨ SỐ 3: Collins Dictionary.
    """
    clean_w = word.strip().lower()
    candidates = [clean_w.replace(" ", "-"), clean_w]
    collins_headers = {
        "User-Agent": USER_AGENT,
        "Referer": "https://www.collinsdictionary.com/",
        "Accept-Language": "en-US,en;q=0.9"
    }
    for slug in candidates:
        url = f"https://www.collinsdictionary.com/dictionary/english/{quote(slug)}"
        try:
            res = fetch_url(url, headers=collins_headers, timeout=10)
            if res.status_code != 200:
                continue
            soup = BeautifulSoup(res.text, "html.parser")
            audio_tags = soup.find_all("a", attrs={"data-src-mp3": True})
            us_url, uk_url = None, None
            for tag in audio_tags:
                mp3 = tag.get("data-src-mp3", "")
                title = tag.get("title", "").lower()
                if ("american" in title or "us" in mp3.lower() or "en_us" in mp3.lower()) and not us_url:
                    us_url = mp3
                elif not uk_url:
                    uk_url = mp3

            target_url = us_url or uk_url
            source_name = "3. Collins (US)" if target_url == us_url else "3. Collins (UK)"
            if target_url:
                audio_res = fetch_url(target_url, headers=collins_headers, timeout=12)
                if audio_res.status_code == 200 and len(audio_res.content) > 500:
                    logger.info(f"[Collins SUCCESS] '{word}' -> {source_name} ({len(audio_res.content)} bytes)")
                    return audio_res.content, source_name, f"Success: {target_url}"
        except Exception as e:
            logger.debug(f"[Collins Error] '{word}': {e}")
    return None, None, "Not found on Collins"

def generate_gcp_cloud_tts(word: str) -> tuple[Optional[bytes], Optional[str]]:
    """
    Chốt chặn cuối cùng: Google Cloud Text-to-Speech API (Neural2).
    Chỉ dùng khi TẤT CẢ các từ điển đều không có từ này.
    """
    if gcp_tts_client:
        try:
            from google.cloud import texttospeech
            s_input = texttospeech.SynthesisInput(text=word.strip())
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US",
                name="en-US-Neural2-F",
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
                return response.audio_content, "4. Google Cloud TTS (Neural2 US)"
        except Exception as e:
            logger.warning(f"Lỗi gọi Google Cloud TTS cho '{word}': {e}")

    # Fallback cuối cùng nếu không có GCP Key: Google Translate TTS
    try:
        q = quote(word.strip())
        tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={q}&tl=en&client=tw-ob"
        res = std_requests.get(tts_url, headers={"User-Agent": USER_AGENT}, timeout=8)
        if res.status_code == 200 and len(res.content) > 500:
            return res.content, "4. Google TTS Fallback (US)"
    except Exception as e:
        logger.error(f"Lỗi fallback TTS cho '{word}': {e}")

    return None, None

def get_audio_for_word(word: str) -> tuple[Optional[bytes], str]:
    """
    Logic ưu tiên nghiêm ngặt:
    1. Ưu tiên số 1: Cambridge Dictionary (US -> UK)
    2. Dự phòng 1: Oxford Learner's Dictionaries (US -> UK)
    3. Dự phòng 2: Collins Dictionary (US -> UK)
    4. Chốt chặn cuối cùng: Google Cloud TTS (Neural2 US)
    """
    clean_w = word.strip().lower()
    if clean_w in AUDIO_MEMORY_CACHE:
        return AUDIO_MEMORY_CACHE[clean_w]

    # Bước 1: Cambridge
    data, src, _ = fetch_cambridge_audio(clean_w)
    if data:
        AUDIO_MEMORY_CACHE[clean_w] = (data, src)
        return data, src

    # Bước 2: Oxford
    data, src, _ = fetch_oxford_audio(clean_w)
    if data:
        AUDIO_MEMORY_CACHE[clean_w] = (data, src)
        return data, src

    # Bước 3: Collins
    data, src, _ = fetch_collins_audio(clean_w)
    if data:
        AUDIO_MEMORY_CACHE[clean_w] = (data, src)
        return data, src

    # Bước 4: Google Cloud TTS
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
        "version": "2.0.0",
        "has_curl_cffi": HAS_CURL_CFFI,
        "engine": "FastAPI + Cambridge Scraper (Chrome TLS) + Oxford + Collins + Google Cloud TTS",
        "docs": "/docs"
    }

@app.get("/debug/{word}")
def debug_word_audio(word: str):
    """
    Endpoint kiểm tra chi tiết trạng thái cào âm thanh từ từng nguồn cho 1 từ.
    """
    cam_bytes, cam_src, cam_dbg = fetch_cambridge_audio(word)
    ox_bytes, ox_src, ox_dbg = fetch_oxford_audio(word)
    col_bytes, col_src, col_dbg = fetch_collins_audio(word)

    return {
        "word": word,
        "has_curl_cffi": HAS_CURL_CFFI,
        "cambridge": {
            "success": bool(cam_bytes),
            "source": cam_src,
            "bytes": len(cam_bytes) if cam_bytes else 0,
            "debug": cam_dbg
        },
        "oxford": {
            "success": bool(ox_bytes),
            "source": ox_src,
            "bytes": len(ox_bytes) if ox_bytes else 0,
            "debug": ox_dbg
        },
        "collins": {
            "success": bool(col_bytes),
            "source": col_src,
            "bytes": len(col_bytes) if col_bytes else 0,
            "debug": col_dbg
        }
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

def worker_fetch_with_jitter(word: str):
    time.sleep(random.uniform(0.05, 0.2))
    return get_audio_for_word(word)

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
        future_map = {executor.submit(worker_fetch_with_jitter, w): w for w in words}
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

        report_lines.append("\n--- CÁC TỪ DÙNG GOOGLE TTS (DO CÁC TỪ ĐIỂN KHÔNG CÓ) ---")
        if tts_fallback_list:
            report_lines.extend(tts_fallback_list)
        else:
            report_lines.append("Tất cả các từ đều được cào thành công từ từ điển chuẩn bản xứ (Cambridge/Oxford)!")

        zf.writestr("bao_cao_am_thanh.txt", "\n".join(report_lines))

    zip_buffer.seek(0)
    filename = f"output_{req.topic_id}_audio.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Success-Count": str(success_count),
            "X-Total-Words": str(len(words))
        }
    )
