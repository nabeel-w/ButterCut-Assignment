import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()  # loads .env if present


class Settings:
    PROJECT_NAME: str = "Video Editor Backend"
    API_V1_PREFIX: str = "/api/v1"

    BACKEND_CORS_ORIGINS: list[str] = [
        "*"  # relax for assignment; tighten in production
    ]

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@db:5432/video_editor",
    )

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/data/uploads")
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "/app/data/outputs")

    # NEW: where your overlay assets (images, clips) live
    ASSETS_DIR: str = os.getenv("ASSETS_DIR", "/app/assets")

    # Max parallel ffmpeg jobs
    MAX_WORKERS: int = int(os.getenv("MAX_WORKERS", "2"))


@lru_cache
def get_settings():
    return Settings()
