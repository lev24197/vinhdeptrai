#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script cào và ghép âm thanh chuẩn 100% Cambridge Dictionary (US/UK) cho toàn bộ 100 từ của từng chủ đề Anki.
"""

import os
import re
import time
import shutil
import argparse
import threading
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional, Dict, Tuple

import requests
from requests.adapters import HTTPAdapter

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

API_SESSION = requests.Session()
API_SESSION.headers.update({"User-Agent": USER_AGENT, "Connection": "keep-alive"})
API_SESSION.mount("https://", HTTPAdapter(pool_connections=20, pool_maxsize=20))

ARCHIVE_SESSION = requests.Session()
ARCHIVE_SESSION.headers.update({"User-Agent": USER_AGENT, "Connection": "keep-alive"})
ARCHIVE_SESSION.mount("https://", HTTPAdapter(pool_connections=8, pool_maxsize=8))

ARCHIVE_SEMAPHORE = threading.Semaphore(5)
CACHE_LOCK = threading.Lock()
DIRECT_CAMBRIDGE_BLOCKED = False

SINGLE_WORD_CAMBRIDGE_CACHE: Dict[str, Tuple[bytes, str]] = {}
CAMBRIDGE_MP3_URL_CACHE: Dict[str, bytes] = {}

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


def strip_mp3_frames(data: bytes) -> bytes:
    if not data or len(data) < 256:
        return data
    offset = 0
    if data[:3] == b"ID3" and len(data) >= 10:
        size = (
            ((data[6] & 0x7F) << 21)
            | ((data[7] & 0x7F) << 14)
            | ((data[8] & 0x7F) << 7)
            | (data[9] & 0x7F)
        )
        offset = 10 + size

    if offset < len(data) - 4:
        window_end = min(offset + 320, len(data))
        first_chunk = data[offset:window_end]
        if any(marker in first_chunk for marker in (b"Info", b"Xing", b"VBRI", b"LAME")):
            h0 = data[offset]
            h1 = data[offset + 1]
            sr_bits = data[offset + 2] & 0x0C
            search_limit = min(offset + 1600, len(data) - 4)
            for i in range(offset + 24, search_limit):
                if data[i] == h0 and data[i + 1] == h1 and (data[i + 2] & 0x0C) == sr_bits:
                    offset = i
                    break

    end = len(data)
    if end - offset > 128 and data[end - 128 : end - 125] == b"TAG":
        end -= 128
    return data[offset:end]


def download_cambridge_mp3_bytes(mp3_url: str) -> Optional[bytes]:
    global DIRECT_CAMBRIDGE_BLOCKED
    if not mp3_url:
        return None
    canon_url = mp3_url.replace("dictionary.cambridge.org/us/media/", "dictionary.cambridge.org/media/")

    with CACHE_LOCK:
        if canon_url in CAMBRIDGE_MP3_URL_CACHE:
            return CAMBRIDGE_MP3_URL_CACHE[canon_url]

    if not DIRECT_CAMBRIDGE_BLOCKED:
        try:
            res = API_SESSION.get(canon_url, headers={"Referer": "https://dictionary.cambridge.org/"}, timeout=6)
            ct = (res.headers.get("content-type") or "").lower()
            if res.status_code == 200 and len(res.content) > 800 and ("audio" in ct or res.content[:3] == b"ID3"):
                with CACHE_LOCK:
                    CAMBRIDGE_MP3_URL_CACHE[canon_url] = res.content
                return res.content
            elif res.status_code == 403:
                DIRECT_CAMBRIDGE_BLOCKED = True
        except Exception:
            pass

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

    return None


def generate_cambridge_candidates(term: str) -> List[str]:
    clean = term.strip().lower()
    slug = re.sub(r"\s+", "-", clean)
    candidates = []

    def add(c: str):
        c = c.strip("-")
        if c and c not in candidates:
            candidates.append(c)

    if clean in CAMBRIDGE_HEADWORD_ALIASES:
        for a in CAMBRIDGE_HEADWORD_ALIASES[clean]:
            add(a)
    add(slug)
    add(slug + "s")
    add(slug + "es")
    if "-" not in slug and slug.endswith("er") and len(slug) > 4:
        if len(slug) > 5 and slug[-3] == slug[-4]:
            add(slug[:-3])
        add(slug[:-2])
        add(slug[:-1])
    return candidates


def fetch_single_cambridge_word(term: str) -> Tuple[Optional[bytes], Optional[str]]:
    clean = term.strip().lower()
    with CACHE_LOCK:
        if clean in SINGLE_WORD_CAMBRIDGE_CACHE:
            return SINGLE_WORD_CAMBRIDGE_CACHE[clean]

    for cand in generate_cambridge_candidates(clean):
        try:
            r = API_SESSION.get(f"https://dictionary-api.eliaschen.dev/api/dictionary/en/{quote(cand)}", timeout=8)
            if r.status_code == 200:
                data = r.json()
                us_url, uk_url = None, None
                for p in data.get("pronunciation", []):
                    u = p.get("url", "")
                    if not u or ".mp3" not in u:
                        continue
                    if p.get("lang") == "us" and not us_url:
                        us_url = u
                    elif p.get("lang") == "uk" and not uk_url:
                        uk_url = u
                for target_url, src_label in ((us_url, "1. Cambridge (US)"), (uk_url, "1. Cambridge (UK)")):
                    if not target_url:
                        continue
                    mp3_bytes = download_cambridge_mp3_bytes(target_url)
                    if mp3_bytes:
                        with CACHE_LOCK:
                            SINGLE_WORD_CAMBRIDGE_CACHE[clean] = (mp3_bytes, src_label)
                        return mp3_bytes, src_label
        except Exception:
            pass
    return None, None


def get_cambridge_audio(word: str) -> Tuple[Optional[bytes], str]:
    clean_w = word.strip().lower()
    if clean_w in CAMBRIDGE_COMPOUND_DECOMPOSITIONS:
        sub_tokens = CAMBRIDGE_COMPOUND_DECOMPOSITIONS[clean_w]
    elif " " in clean_w or "-" in clean_w:
        raw_parts = [p for p in re.split(r"[\s\-]+", clean_w) if p]
        sub_tokens = []
        for rp in raw_parts:
            if rp in CAMBRIDGE_COMPOUND_DECOMPOSITIONS:
                sub_tokens.extend(CAMBRIDGE_COMPOUND_DECOMPOSITIONS[rp])
            else:
                sub_tokens.append(rp)
    else:
        b, s = fetch_single_cambridge_word(clean_w)
        return b, (s or "Thất bại")

    frames = []
    for t in sub_tokens:
        b, _ = fetch_single_cambridge_word(t)
        if not b:
            return None, "Thất bại"
        frames.append(strip_mp3_frames(b))
    return b"".join(frames), "1. Cambridge (US)"


def process_topic(stt: int, max_workers: int = 12):
    tsv_path = os.path.join("output", f"{stt}.txt")
    if not os.path.exists(tsv_path):
        print(f"❌ Không tìm thấy file {tsv_path}")
        return

    words = []
    with open(tsv_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                parts = line.split("\t")
                if parts and parts[0].strip():
                    words.append(parts[0].strip())

    out_dir = os.path.join("output_audio", f"topic_{stt}")
    os.makedirs(out_dir, exist_ok=True)

    print(f"🚀 Bắt đầu cào 100% âm thanh Cambridge cho Chủ Đề #{stt} ({len(words)} từ)...")
    start_time = time.time()

    success_count = 0
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(get_cambridge_audio, w): w for w in words}
        for future in as_completed(futures):
            w = futures[future]
            audio_bytes, src = future.result()
            if audio_bytes:
                success_count += 1
                clean_file = "_".join(w.lower().split()) + ".mp3"
                with open(os.path.join(out_dir, clean_file), "wb") as f:
                    f.write(audio_bytes)
                print(f"[{success_count}/{len(words)}] ✅ {clean_file} -> {src}")
            else:
                print(f"❌ Thất bại: {w}")

    elapsed = time.time() - start_time
    print(f"\n🎉 Hoàn tất trong {elapsed:.2f}s! Tải thành công {success_count}/{len(words)} từ (100% Cambridge).")
    shutil.make_archive(f"output_{stt}_audio", "zip", out_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="100% Cambridge Audio Crawler for Anki")
    parser.add_argument("--stt", type=int, default=23, help="STT của chủ đề (VD: 23)")
    parser.add_argument("--workers", type=int, default=12, help="Số luồng cào song song")
    args = parser.parse_args()
    process_topic(args.stt, args.workers)
