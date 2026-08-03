import os

def cleanup_files(file_paths: list):
    for path in file_paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except Exception as e:
            print(f"Failed to remove temporary file {path}: {e}")
