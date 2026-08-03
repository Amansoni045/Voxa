import os
import hashlib
from backend.config.constants import DOWNLOAD_DIR

def ensure_directory(dir_path: str):
    os.makedirs(dir_path, exist_ok=True)

def generate_session_hash(items: list) -> str:
    hash_input = "".join(items).encode("utf-8")
    return hashlib.md5(hash_input).hexdigest()

def get_checkpoint_cache_dir(chunks: list) -> str:
    session_id = generate_session_hash(chunks)
    cache_dir = os.path.join(DOWNLOAD_DIR, ".cache", session_id)
    ensure_directory(cache_dir)
    return cache_dir
