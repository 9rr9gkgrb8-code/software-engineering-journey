"""Local progress persistence for Forge."""

import json
import os
import tempfile
import threading
from pathlib import Path

PROGRESS_FILE = Path(__file__).with_name("forge_progress.json")
PROGRESS_LOCK = threading.RLock()


def load_progress() -> dict:
    with PROGRESS_LOCK:
        if not PROGRESS_FILE.exists():
            return {"completed_missions": []}
        try:
            data = json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {"completed_missions": []}
        completed = data.get("completed_missions", []) if isinstance(data, dict) else []
        if not isinstance(completed, list) or not all(isinstance(item, str) for item in completed):
            return {"completed_missions": []}
        return {"completed_missions": list(dict.fromkeys(completed))}


def mark_complete(mission_id: str) -> dict:
    with PROGRESS_LOCK:
        result = load_progress()
        if mission_id not in result["completed_missions"]:
            result["completed_missions"].append(mission_id)
        PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
        handle, temporary_name = tempfile.mkstemp(dir=PROGRESS_FILE.parent, prefix="forge-progress-", suffix=".tmp")
        try:
            with os.fdopen(handle, "w", encoding="utf-8") as file:
                json.dump(result, file, indent=2)
            os.replace(temporary_name, PROGRESS_FILE)
        finally:
            if os.path.exists(temporary_name):
                os.unlink(temporary_name)
        return result
