import os
import shutil
import yt_dlp
from backend.config.constants import DOWNLOAD_DIR
from backend.shared.file_utils import ensure_directory

def _get_ffmpeg_path() -> str | None:
    path = shutil.which("ffmpeg")
    if path:
        return path
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None

def download_youtube_audio(url: str) -> str:
    ensure_directory(DOWNLOAD_DIR)
    output_path = os.path.join(DOWNLOAD_DIR, "%(id)s.%(ext)s")
    
    ffmpeg_exe = _get_ffmpeg_path()

    if ffmpeg_exe:
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": output_path,
            "ffmpeg_location": ffmpeg_exe,
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "wav",
                    "preferredquality": "192",
                }
            ],
            "quiet": True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                base, _ = os.path.splitext(filename)
                wav_file = base + ".wav"
                if os.path.exists(wav_file):
                    return wav_file
                return filename
        except Exception:
            pass

    # Direct audio download fallback if FFmpeg postprocessing fails
    ydl_opts_direct = {
        "format": "bestaudio[ext=m4a]/bestaudio/best",
        "outtmpl": output_path,
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts_direct) as ydl:
        info = ydl.extract_info(url, download=True)
        return ydl.prepare_filename(info)
