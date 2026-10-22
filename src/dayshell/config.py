import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")

def _path(value: str) -> Path:
    p = Path(value)
    return p if p.is_absolute() else ROOT / p


GOOGLE_KEY_PATH = _path(os.environ.get("GOOGLE_KEY_PATH") or "key.json")
SHEET_ID = (os.environ.get("SHEET_ID") or "").strip()
DB_PATH = _path(os.environ.get("DB_PATH") or "dayshell.db")
SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "").strip() or None
SUPABASE_SERVICE_KEY = (os.environ.get("SUPABASE_SERVICE_KEY") or "").strip() or None


def require(*names: str) -> None:
    missing = [n for n in names if not globals().get(n)]
    if missing:
        raise RuntimeError(
            f"Missing in .env: {', '.join(missing)}. "
            "See docs/configuration.md for the full list."
        )