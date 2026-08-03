import os
import shutil
import time
from backend.shared.logger import get_logger

logger = get_logger("voxa.cleanup")

def cleanup_files(file_paths: list):
    """
    Safely delete a list of files or directories.
    Handles exceptions silently to guarantee execution of all items in the list.
    """
    if not file_paths:
        return

    for path in file_paths:
        if not path:
            continue
        try:
            if os.path.isfile(path) or os.path.islink(path):
                os.remove(path)
                logger.debug("Removed temporary file: %s", path)
            elif os.path.isdir(path):
                shutil.rmtree(path, ignore_errors=True)
                logger.debug("Removed temporary directory: %s", path)
        except Exception as e:
            logger.warning("Failed to clean up path %s: %s", path, e)

def purge_old_temporary_files(target_dir: str, max_age_seconds: int = 3600):
    """
    Purge lingering temporary files in target_dir older than max_age_seconds.
    Used for background disk maintenance so the server can run for months.
    """
    if not target_dir or not os.path.exists(target_dir):
        return

    now = time.time()
    count = 0
    for root, dirs, files in os.walk(target_dir):
        for name in files:
            file_path = os.path.join(root, name)
            try:
                if os.path.isfile(file_path):
                    file_age = now - os.path.getmtime(file_path)
                    if file_age > max_age_seconds:
                        os.remove(file_path)
                        count += 1
            except Exception:
                pass

    if count > 0:
        logger.info("Purged %d stale temporary files from %s", count, target_dir)
