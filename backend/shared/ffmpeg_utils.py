import os
import shutil

def ensure_ffmpeg_on_path():
    """
    Ensure ffmpeg executable directory is on sys.path and os.environ["PATH"],
    creating a symlink/copy named 'ffmpeg' if imageio_ffmpeg uses a platform-specific filename.
    This guarantees OpenAI Whisper and PyDub subprocesses find 'ffmpeg' on PATH.
    """
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffmpeg_dir = os.path.dirname(ffmpeg_exe)

        # Create 'ffmpeg' symlink or alias if missing in imageio_ffmpeg binaries directory
        target_ffmpeg = os.path.join(ffmpeg_dir, "ffmpeg")
        if not os.path.exists(target_ffmpeg) and os.path.exists(ffmpeg_exe):
            try:
                os.symlink(ffmpeg_exe, target_ffmpeg)
            except Exception:
                shutil.copy2(ffmpeg_exe, target_ffmpeg)

        current_path = os.environ.get("PATH", "")
        if ffmpeg_dir not in current_path.split(os.path.pathsep):
            os.environ["PATH"] = ffmpeg_dir + os.path.pathsep + current_path
    except Exception as e:
        pass

ensure_ffmpeg_on_path()
