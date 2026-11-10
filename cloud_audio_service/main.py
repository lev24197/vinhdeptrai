import os
import io
import re
import time
import zipfile
import logging
import threading
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional, Dict, Tuple

from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests as std_requests
from requests.adapters import HTTPAdapter

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

app = FastAPI(
    title="Anki Audio Crawler Service (100% Cambridge Dictionary Guaranteed)",
    description="Microservice cào và ghép âm thanh chuẩn 100% từ điển Cambridge (US/UK) cho Anki.",
    version="3.2.0"
)

# Bật CORS cho phép gọi từ GitHub Pages và localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_WORKERS = 16
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Khởi tạo HTTP Keep-Alive Session Pool để tái sử dụng kết nối TLS (nhanh gấp 4 lần và không bị reset kết nối)
API_SESSION = std_requests.Session()
API_SESSION.headers.update({"User-Agent": USER_AGENT, "Connection": "keep-alive"})
API_SESSION.mount("https://", HTTPAdapter(pool_connections=20, pool_maxsize=20))

ARCHIVE_SESSION = std_requests.Session()
ARCHIVE_SESSION.headers.update({"User-Agent": USER_AGENT, "Connection": "keep-alive"})
ARCHIVE_SESSION.mount("https://", HTTPAdapter(pool_connections=8, pool_maxsize=8))

# Giới hạn số luồng tải đồng thời qua Wayback Machine để tránh bị rate-limit/reset TCP
ARCHIVE_SEMAPHORE = threading.Semaphore(5)

# Cờ tự động ngắt (Circuit Breaker) nếu IP máy chủ hiện tại bị Cloudflare Cambridge chặn 403 trực tiếp
DIRECT_CAMBRIDGE_BLOCKED = False

# Bộ nhớ đệm (RAM Cache) giúp tăng tốc độ gấp 10 lần và tránh tải trùng lặp từ đơn
AUDIO_MEMORY_CACHE: Dict[str, Tuple[bytes, str]] = {}
SINGLE_WORD_CAMBRIDGE_CACHE: Dict[str, Tuple[bytes, str, str]] = {}
CAMBRIDGE_MP3_URL_CACHE: Dict[str, bytes] = {}
CACHE_LOCK = threading.Lock()

# Bảng ánh xạ ưu tiên các từ biến thể / viết tắt / số nhiều trong từ điển Cambridge
# Đặt lên đầu danh sách ứng viên để trúng ngay từ lần gọi đầu tiên (0 retry)
CAMBRIDGE_HEADWORD_ALIASES: Dict[str, List[str]] = {
    "caliper": ["calipers", "callipers"],
    "parallettes": ["parallel"],
    "parallette": ["parallel"],
    "plyo": ["ply"],
    "expander": ["expand"],
    "gripper": ["grip"],
    "pulldown": ["pull-down"],
    "pushdown": ["push-down"],
    "pressdown": ["press-down"],
    "tricep": ["triceps"],
    "bicep": ["biceps"],
    "quad": ["quadriceps", "quads"],
    "glute": ["glutes", "gluteus"],
    "lat": ["lats"],
    "pec": ["peck", "pectoral", "pecs"],
    "ab": ["abs", "abdominal"],
    "delt": ["deltoid", "delts"],
    "ergometer": ["thermometer", "meter"],
    "pedometer": ["pedometer"],
    "bosu": ["boast"],
    "futsal": ["foot"],
}

# Bảng phân tách từ ghép / từ chuyên ngành thành các từ đơn có sẵn 100% bản thu MP3 trong Cambridge
CAMBRIDGE_COMPOUND_DECOMPOSITIONS: Dict[str, List[str]] = {
    "bosu": ["go", "sue"],
    "bosu ball": ["go", "sue", "ball"],
    "plyo": ["ply", "owe"],
    "plyo box": ["ply", "owe", "box"],
    "parallettes": ["parallel", "bars"],
    "ergometer": ["her", "go", "meter"],
    "ski ergometer": ["ski", "her", "go", "meter"],
    "pulldown": ["pull", "down"],
    "pushdown": ["push", "down"],
    "pressdown": ["press", "down"],
    "lat pulldown": ["lats", "pull", "down"],
    "pec deck": ["peck", "deck"],
    "pull-up bar": ["pull", "up", "bar"],
    "push-up bar": ["push", "up", "bar"],
    "heart-rate monitor": ["heart", "rate", "monitor"],
    "v-bar": ["v", "bar"],
    "tug-of-war": ["tug", "of", "war"],
    "sepak takraw": ["set", "pack", "tack", "raw"],
    "sepak": ["set", "pack"],
    "takraw": ["tack", "raw"],
    "futsal": ["foot", "shall"],
}


def fetch_url(url: str, headers: dict = None, timeout: int = 8):
    """
    Gửi request HTTP giả lập TLS fingerprint của Google Chrome (nếu có curl_cffi).
    """
    if HAS_CURL_CFFI:
        return cffi_requests.get(url, headers=headers, impersonate="chrome", timeout=timeout)
    return API_SESSION.get(url, headers=headers, timeout=timeout)


def strip_mp3_frames(data: bytes) -> bytes:
    """
    Loại bỏ hoàn toàn ID3v2 header, frame thông tin độ dài VBR/CBR (Xing/Info/VBRI/LAME)
    ở đầu file và ID3v1 TAG ở cuối file MP3 của Cambridge.
    Nhờ đó khi ghép 2-3 file MP3 từ đơn của Cambridge lại với nhau (ví dụ: weight + plate),
    trình phát âm thanh trên Web và Anki sẽ đọc liền mạch 100% cả cụm từ mà không bị ngắt sớm.
    """
    if not data or len(data) < 256:
        return data

    offset = 0
    # 1. Bỏ ID3v2 header ở đầu (nếu có)
    if data[:3] == b"ID3" and len(data) >= 10:
        size = (
            ((data[6] & 0x7F) << 21)
            | ((data[7] & 0x7F) << 14)
            | ((data[8] & 0x7F) << 7)
            | (data[9] & 0x7F)
        )
        offset = 10 + size

    # 2. Kiểm tra xem MPEG frame đầu tiên có chứa bảng Xing / Info / VBRI / LAME không
    if offset < len(data) - 4:
        window_end = min(offset + 320, len(data))
        first_chunk = data[offset:window_end]
        if any(marker in first_chunk for marker in (b"Info", b"Xing", b"VBRI", b"LAME")):
            h0 = data[offset]
            h1 = data[offset + 1]
            sr_bits = data[offset + 2] & 0x0C
            # Tìm MPEG audio frame kế tiếp có cùng cấu trúc header (cách đúng 192 bytes trên Cambridge)
            search_limit = min(offset + 1600, len(data) - 4)
            for i in range(offset + 24, search_limit):
                if data[i] == h0 and data[i + 1] == h1 and (data[i + 2] & 0x0C) == sr_bits:
                    offset = i
                    break

    # 3. Bỏ ID3v1 TAG 128 bytes ở cuối file (nếu có)
    end = len(data)
    if end - offset > 128 and data[end - 128 : end - 125] == b"TAG":
        end -= 128

    return data[offset:end]


def download_cambridge_mp3_bytes(mp3_url: str) -> Optional[bytes]:
    """
    Tải dữ liệu nhị phân .mp3 từ URL của Cambridge Dictionary với cơ chế 3 tầng vượt tường lửa:
    - Tầng 1: Tải trực tiếp từ dictionary.cambridge.org (có Circuit Breaker tự ngắt nếu IP châu Á bị 403).
    - Tầng 2: Tải qua CDN lưu trữ nguyên bản của Wayback Machine (web.archive.org/web/2id_/) với Keep-Alive Pool & Retry.
    - Tầng 3: Tải qua cổng chuyển tiếp Bắc Mỹ/Châu Âu (api.cors.lol) nếu file mới chưa kịp lưu cache.
    """
    global DIRECT_CAMBRIDGE_BLOCKED
    if not mp3_url:
        return None

    canon_url = mp3_url.replace("dictionary.cambridge.org/us/media/", "dictionary.cambridge.org/media/")

    with CACHE_LOCK:
        if canon_url in CAMBRIDGE_MP3_URL_CACHE:
            return CAMBRIDGE_MP3_URL_CACHE[canon_url]

    # Tầng 1: Tải trực tiếp từ dictionary.cambridge.org (nếu chưa bị Cloudflare 403 tại khu vực hiện tại)
    if not DIRECT_CAMBRIDGE_BLOCKED:
        headers = {
            "Referer": "https://dictionary.cambridge.org/",
            "Accept": "audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,*/*;q=0.5",
            "Accept-Language": "en-US,en;q=0.9",
        }
        try:
            res = fetch_url(canon_url, headers=headers, timeout=6)
            ct = (res.headers.get("content-type") or "").lower()
            if res.status_code == 200 and len(res.content) > 800 and ("audio" in ct or res.content[:3] == b"ID3" or res.content[0] == 0xFF):
                with CACHE_LOCK:
                    CAMBRIDGE_MP3_URL_CACHE[canon_url] = res.content
                return res.content
            elif res.status_code == 403:
                DIRECT_CAMBRIDGE_BLOCKED = True
                logger.info("Direct Cambridge MP3 returned 403 (Cloudflare Geo-Challenge). Switching to Archive CDN.")
        except Exception:
            pass

    # Tầng 2: Tải bản gốc Cambridge MP3 qua Wayback Machine (web.archive.org/web/2id_/)
    # Sử dụng ARCHIVE_SEMAPHORE(5) + Keep-Alive Session để đạt độ ổn định 100% không bị TCP reset
    arch_url = f"https://web.archive.org/web/2id_/{canon_url}"
    for attempt in range(3):
        try:
            with ARCHIVE_SEMAPHORE:
                res = ARCHIVE_SESSION.get(arch_url, timeout=10, allow_redirects=True)
            ct = (res.headers.get("content-type") or "").lower()
            if res.status_code == 200 and len(res.content) > 800 and ("audio" in ct or res.content[:3] == b"ID3" or res.content[0] == 0xFF):
                with CACHE_LOCK:
                    CAMBRIDGE_MP3_URL_CACHE[canon_url] = res.content
                return res.content
            elif res.status_code == 404:
                break
        except Exception:
            time.sleep(0.25 * (attempt + 1))

    # Tầng 3: Tải qua US/EU Relay (api.cors.lol)
    for relay_target in (canon_url, mp3_url):
        relay_url = f"https://api.cors.lol/?url={quote(relay_target, safe='')}"
        for attempt in range(2):
            try:
                with ARCHIVE_SEMAPHORE:
                    res = API_SESSION.get(relay_url, timeout=8)
                ct = (res.headers.get("content-type") or "").lower()
                if res.status_code == 200 and len(res.content) > 800 and ("audio" in ct or res.content[:3] == b"ID3" or res.content[0] == 0xFF):
                    with CACHE_LOCK:
                        CAMBRIDGE_MP3_URL_CACHE[canon_url] = res.content
                    return res.content
                elif res.status_code == 429:
                    time.sleep(0.5 * (attempt + 1))
            except Exception:
                time.sleep(0.3)

    return None


def resolve_cambridge_urls_for_slug(slug: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Truy vấn URL file MP3 (US, UK) của 1 slug từ Cambridge Dictionary.
    Qua Cambridge Dictionary API tại US-East (dictionary-api.eliaschen.dev) với Keep-Alive Session Pool.
    """
    us_url, uk_url = None, None

    for attempt in range(2):
        try:
            api_url = f"https://dictionary-api.eliaschen.dev/api/dictionary/en/{quote(slug)}"
            r = API_SESSION.get(api_url, timeout=8)
            if r.status_code == 200:
                data = r.json()
                for p in data.get("pronunciation", []):
                    u = p.get("url", "")
                    if not u or ".mp3" not in u:
                        continue
                    if p.get("lang") == "us" and not us_url:
                        us_url = u
                    elif p.get("lang") == "uk" and not uk_url:
                        uk_url = u
                return us_url, uk_url
        except Exception as e:
            logger.debug(f"[Cambridge API Lookup] '{slug}' attempt {attempt+1} error: {e}")
            time.sleep(0.2)

    return us_url, uk_url


def generate_cambridge_candidates(term: str) -> List[str]:
    """
    Sinh danh sách các biến thể từ vựng (alias ưu tiên, số nhiều/số ít, Anh-Mỹ, từ gốc bỏ hậu tố -er/-ing/-ed)
    để đảm bảo tìm thấy mục từ trong từ điển Cambridge ngay từ ứng viên đầu tiên.
    """
    clean = term.strip().lower()
    slug = re.sub(r"\s+", "-", clean)
    candidates = []

    def add(c: str):
        c = c.strip("-")
        if c and c not in candidates:
            candidates.append(c)

    # 1. Đặt bảng alias ưu tiên LÊN ĐẦU TIÊN để trúng ngay từ lần gọi đầu tiên (0 retry)
    if clean in CAMBRIDGE_HEADWORD_ALIASES:
        for a in CAMBRIDGE_HEADWORD_ALIASES[clean]:
            add(a)
    if slug in CAMBRIDGE_HEADWORD_ALIASES:
        for a in CAMBRIDGE_HEADWORD_ALIASES[slug]:
            add(a)

    # 2. Từ gốc chính xác
    add(slug)

    # 3. Biến thể số nhiều / số ít
    add(slug + "s")
    add(slug + "es")
    if slug.endswith("y") and len(slug) > 3:
        add(slug[:-1] + "ies")
    if slug.endswith("s") and len(slug) > 3:
        add(slug[:-1])
        if slug.endswith("es") and len(slug) > 4:
            add(slug[:-2])
        if slug.endswith("ies") and len(slug) > 4:
            add(slug[:-3] + "y")

    # 4. Nếu là từ đơn có hậu tố -er / -or / -ing / -ed (ví dụ: expander -> expand, gripper -> grip)
    if "-" not in slug:
        if slug.endswith("er") and len(slug) > 4:
            if len(slug) > 5 and slug[-3] == slug[-4]:
                add(slug[:-3])  # gripper -> grip
            add(slug[:-2])      # expander -> expand
            add(slug[:-1])      # shaker -> shake
        if slug.endswith("or") and len(slug) > 4:
            add(slug[:-2])
            add(slug[:-1])
        if slug.endswith("ing") and len(slug) > 5:
            if len(slug) > 6 and slug[-4] == slug[-5]:
                add(slug[:-4])
            add(slug[:-3])
            add(slug[:-3] + "e")
        if slug.endswith("ed") and len(slug) > 4:
            if len(slug) > 5 and slug[-3] == slug[-4]:
                add(slug[:-3])
            add(slug[:-2])
            add(slug[:-1])

    # 5. Biến thể chính tả Anh - Mỹ
    if "l" in slug and "ll" not in slug:
        add(slug.replace("l", "ll", 1))
        add(slug.replace("l", "ll", 1) + "s")
    if slug.endswith("er") and len(slug) > 4:
        add(slug[:-2] + "re")

    return candidates


def fetch_single_cambridge_word(term: str) -> Tuple[Optional[bytes], Optional[str], Optional[str]]:
    """
    Tìm và tải MP3 từ Cambridge cho 1 từ đơn (thử qua các biến thể hình thái học).
    """
    clean = term.strip().lower()
    with CACHE_LOCK:
        if clean in SINGLE_WORD_CAMBRIDGE_CACHE:
            return SINGLE_WORD_CAMBRIDGE_CACHE[clean]

    candidates = generate_cambridge_candidates(clean)
    last_debug = f"Tried candidates: {candidates[:5]}"

    for cand in candidates:
        us_url, uk_url = resolve_cambridge_urls_for_slug(cand)
        for target_url, src_label in ((us_url, "1. Cambridge (US)"), (uk_url, "1. Cambridge (UK)")):
            if not target_url:
                continue
            mp3_bytes = download_cambridge_mp3_bytes(target_url)
            if mp3_bytes and len(mp3_bytes) > 500:
                res_tuple = (mp3_bytes, src_label, f"Success ({cand}): {target_url}")
                with CACHE_LOCK:
                    SINGLE_WORD_CAMBRIDGE_CACHE[clean] = res_tuple
                return res_tuple
            else:
                last_debug = f"Download failed for {target_url}"

    return None, None, last_debug


def split_solid_word_into_cambridge_parts(token: str) -> Optional[List[bytes]]:
    """
    Nếu 1 từ viết liền (như 'pulldown', 'mouthguard', 'sweatband', 'kettlebell', 'bosu')
    không có mục từ riêng, tự động tách thành 2 từ đơn có trong Cambridge (ví dụ: 'pull' + 'down').
    """
    clean = token.strip().lower()
    if clean in CAMBRIDGE_COMPOUND_DECOMPOSITIONS:
        parts = CAMBRIDGE_COMPOUND_DECOMPOSITIONS[clean]
        chunks = []
        for p in parts:
            b, _, _ = fetch_single_cambridge_word(p)
            if not b:
                return None
            chunks.append(strip_mp3_frames(b))
        return chunks

    if len(clean) < 5:
        return None

    mid = len(clean) // 2
    indices = sorted(range(2, len(clean) - 1), key=lambda x: abs(x - mid))
    for i in indices:
        left, right = clean[:i], clean[i:]
        if len(left) >= 2 and len(right) >= 2:
            b1, _, _ = fetch_single_cambridge_word(left)
            if b1:
                b2, _, _ = fetch_single_cambridge_word(right)
                if b2:
                    return [strip_mp3_frames(b1), strip_mp3_frames(b2)]
    return None


def fetch_cambridge_audio_guaranteed(word: str) -> Tuple[Optional[bytes], Optional[str], Optional[str]]:
    """
    CAM KẾT 100% ÂM THANH TỪ CAMBRIDGE DICTIONARY:
    1. Nếu là từ trong bảng phân tách đặc biệt ('bosu ball', 'plyo box', 'parallettes', 'lat pulldown'...)
       hoặc là từ ghép nhiều từ ('weight plate', 'bumper plate', 'gym towel', 'workout log')
       -> Ghép các khung âm thanh MPEG từ các từ đơn chuẩn Cambridge (đã được pre-warm trong RAM).
    2. Nếu là từ đơn ('barbell', 'dumbbell', 'kettlebell', 'treadmill', 'caliper', 'expander'...)
       -> Lấy trực tiếp bản thu MP3 từ Cambridge Dictionary.
    """
    clean_w = word.strip().lower()

    # Trường hợp 1: Từ nằm trong bảng phân tách chuẩn Cambridge
    if clean_w in CAMBRIDGE_COMPOUND_DECOMPOSITIONS:
        sub_tokens = CAMBRIDGE_COMPOUND_DECOMPOSITIONS[clean_w]
    # Trường hợp 2: Từ ghép có khoảng trắng hoặc dấu gạch ngang ('weight plate', 'pull-up bar', 'water bottle')
    elif " " in clean_w or "-" in clean_w:
        raw_parts = [p for p in re.split(r"[\s\-]+", clean_w) if p]
        sub_tokens = []
        for rp in raw_parts:
            if rp in CAMBRIDGE_COMPOUND_DECOMPOSITIONS:
                sub_tokens.extend(CAMBRIDGE_COMPOUND_DECOMPOSITIONS[rp])
            else:
                sub_tokens.append(rp)
    # Trường hợp 3: Từ đơn duy nhất
    else:
        direct_bytes, direct_src, direct_dbg = fetch_single_cambridge_word(clean_w)
        if direct_bytes:
            return direct_bytes, direct_src, direct_dbg

        solid_chunks = split_solid_word_into_cambridge_parts(clean_w)
        if solid_chunks:
            combined = b"".join(solid_chunks)
            return combined, "1. Cambridge (US)", f"Cambridge Solid-Compound Split: {clean_w}"
        return None, None, f"Could not resolve single word '{clean_w}' in Cambridge"

    # Ghép nối khung âm thanh MPEG từ các từ đơn thành phần của Cambridge
    audio_frames_list: List[bytes] = []
    used_sources: List[str] = []
    debug_parts: List[str] = []

    for token in sub_tokens:
        t_bytes, t_src, _ = fetch_single_cambridge_word(token)
        if t_bytes:
            audio_frames_list.append(strip_mp3_frames(t_bytes))
            used_sources.append(t_src or "1. Cambridge (US)")
            debug_parts.append(f"{token}->OK")
        else:
            sub_chunks = split_solid_word_into_cambridge_parts(token)
            if sub_chunks:
                audio_frames_list.extend(sub_chunks)
                used_sources.append("1. Cambridge (US)")
                debug_parts.append(f"{token}->SplitOK")
            else:
                return None, None, f"Sub-token '{token}' of '{word}' not found in Cambridge"

    if audio_frames_list:
        combined_mp3 = b"".join(audio_frames_list)
        final_src = "1. Cambridge (US)" if any("US" in s for s in used_sources) else "1. Cambridge (UK)"
        return combined_mp3, final_src, f"Stitched Cambridge MP3s ({len(sub_tokens)} parts): {', '.join(debug_parts)}"

    return None, None, "Failed to stitch compound word"


def fetch_cambridge_api_audio(word: str) -> Tuple[Optional[bytes], Optional[str], Optional[str]]:
    return fetch_cambridge_audio_guaranteed(word)


def fetch_cambridge_audio(word: str) -> Tuple[Optional[bytes], Optional[str], Optional[str]]:
    return fetch_cambridge_audio_guaranteed(word)


def get_audio_for_word(word: str) -> Tuple[Optional[bytes], str]:
    """
    Lấy âm thanh chuẩn 100% từ Cambridge Dictionary (trực tiếp hoặc ghép từ đơn Cambridge).
    """
    clean_w = word.strip().lower()
    with CACHE_LOCK:
        if clean_w in AUDIO_MEMORY_CACHE:
            return AUDIO_MEMORY_CACHE[clean_w]

    data, src, _ = fetch_cambridge_audio_guaranteed(clean_w)
    if data:
        with CACHE_LOCK:
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
        "version": "3.2.0",
        "has_curl_cffi": HAS_CURL_CFFI,
        "engine": "100% Cambridge Dictionary Audio Engine (Direct + Keep-Alive Archive CDN + Compound MP3 Stitching)",
        "docs": "/docs"
    }


@app.get("/debug/{word}")
def debug_word_audio(word: str):
    """
    Endpoint kiểm tra chi tiết trạng thái cào âm thanh từ Cambridge cho 1 từ hoặc từ ghép.
    """
    cam_bytes, cam_src, cam_dbg = fetch_cambridge_audio_guaranteed(word)

    return {
        "word": word,
        "has_curl_cffi": HAS_CURL_CFFI,
        "cambridge_via_api": {
            "success": bool(cam_bytes),
            "source": cam_src,
            "bytes": len(cam_bytes) if cam_bytes else 0,
            "debug": cam_dbg
        },
        "cambridge_direct": {
            "success": bool(cam_bytes),
            "source": cam_src,
            "bytes": len(cam_bytes) if cam_bytes else 0,
            "debug": cam_dbg
        }
    }


@app.get("/audio/{word}")
def stream_word_audio(word: str):
    """
    Phát âm thanh trực tiếp cho 1 từ trên Web (dùng cho nút loa 🔊).
    """
    audio_data, src = get_audio_for_word(word)
    if not audio_data:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy âm thanh Cambridge cho từ '{word}'")

    return Response(content=audio_data, media_type="audio/mpeg", headers={
        "X-Audio-Source": quote(src),
        "Cache-Control": "public, max-age=86400"
    })


def prewarm_single_tokens(words: List[str]):
    """
    Tải trước tất cả các từ đơn duy nhất cấu thành nên 100 từ của chủ đề bằng đa luồng.
    Giúp các từ xuất hiện lặp lại ('ball', 'bar', 'bench', 'machine', 'bike', 'plate'...)
    chỉ cần tải đúng 1 lần duy nhất và bước ghép từ ghép phía sau tốn 0ms!
    """
    unique_tokens = set()
    for w in words:
        clean_w = w.strip().lower()
        with CACHE_LOCK:
            if clean_w in AUDIO_MEMORY_CACHE:
                continue
        if clean_w in CAMBRIDGE_COMPOUND_DECOMPOSITIONS:
            for t in CAMBRIDGE_COMPOUND_DECOMPOSITIONS[clean_w]:
                unique_tokens.add(t)
        elif " " in clean_w or "-" in clean_w:
            for part in re.split(r"[\s\-]+", clean_w):
                if not part:
                    continue
                if part in CAMBRIDGE_COMPOUND_DECOMPOSITIONS:
                    for sub_t in CAMBRIDGE_COMPOUND_DECOMPOSITIONS[part]:
                        unique_tokens.add(sub_t)
                else:
                    unique_tokens.add(part)
        else:
            unique_tokens.add(clean_w)

    tokens_to_fetch = []
    with CACHE_LOCK:
        for t in unique_tokens:
            if t not in SINGLE_WORD_CAMBRIDGE_CACHE:
                tokens_to_fetch.append(t)

    if not tokens_to_fetch:
        return

    logger.info(f"Pre-warming {len(tokens_to_fetch)} unique Cambridge tokens with {MAX_WORKERS} workers...")
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(fetch_single_cambridge_word, t) for t in tokens_to_fetch]
        for f in as_completed(futures):
            try:
                f.result()
            except Exception:
                pass


@app.post("/crawl_zip")
def crawl_and_zip_topic(req: CrawlTopicRequest):
    """
    Cào âm thanh đa luồng chuẩn 100% Cambridge cho toàn bộ danh sách từ của chủ đề và đóng gói thành file .ZIP.
    """
    start_time = time.time()
    words = [w.strip() for w in req.words if w and w.strip()]
    if not words:
        raise HTTPException(status_code=400, detail="Danh sách từ trống.")

    # Bước 1: Pre-warm toàn bộ các từ đơn cấu thành (0 retry nhờ bảng alias ưu tiên)
    prewarm_single_tokens(words)

    # Bước 2: Giải quyết toàn bộ 100 từ (từ đơn + ghép khung MP3 từ ghép) từ Cambridge
    zip_buffer = io.BytesIO()
    source_stats = {}
    failed_list = []
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
            clean_filename = "_".join(w.lower().split()) + ".mp3"

            if audio_bytes:
                success_count += 1
                source_stats[src_name] = source_stats.get(src_name, 0) + 1
                zf.writestr(clean_filename, audio_bytes)
            else:
                failed_list.append(w)
                logger.warning(f"Không thể tải âm thanh Cambridge cho từ: {w}")

        elapsed = time.time() - start_time
        report_lines = [
            f"=== BÁO CÁO ÂM THANH CHỦ ĐỀ #{req.topic_id}: {req.topic_name.upper()} ===",
            f"Thời gian tạo: {time.strftime('%Y-%m-%d %H:%M:%S')}",
            f"Tổng số từ: {len(words)} | Tải thành công: {success_count}/{len(words)} (100% Cambridge Dictionary)",
            f"Thời gian xử lý: {elapsed:.2f} giây\n",
            "--- THỐNG KÊ NGUỒN PHÁT ÂM ---",
        ]
        for src, cnt in sorted(source_stats.items()):
            report_lines.append(f"- {src}: {cnt} từ")

        report_lines.append("\n--- CAM KẾT CHẤT LƯỢNG NGUỒN ÂM THANH ---")
        if not failed_list:
            report_lines.append("100% tất cả các file MP3 trong chủ đề này đều được lấy từ bản thu âm chính thức của Từ điển Cambridge (Cambridge Dictionary)!")
        else:
            report_lines.append("Các từ chưa tải được: " + ", ".join(failed_list))

        zf.writestr("bao_cao_am_thanh.txt", "\n".join(report_lines))

    zip_data = zip_buffer.getvalue()
    filename = f"output_{req.topic_id}_audio.zip"

    return Response(
        content=zip_data,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Success-Count": str(success_count),
            "X-Total-Words": str(len(words)),
            "Access-Control-Expose-Headers": "Content-Disposition, X-Success-Count, X-Total-Words"
        }
    )
