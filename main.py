"""
Kelvid Backend — standalone FastAPI API for text-to-video via Hugging Face.
No frontend bundled. Pair with kelvid-frontend (VITE_API_URL -> this server).

Run dev:  python -m uvicorn main:app --host 127.0.0.1 --port 8000
Run prod: python -m uvicorn main:app --host 0.0.0.0 --port 8000
"""
import json
import logging
import os
import shutil
import threading
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()

# ---------------- config ----------------
HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
HF_PROVIDER = os.getenv("HF_PROVIDER", "fal-ai").strip()
DEFAULT_MODEL = os.getenv("HF_MODEL", "Wan-AI/Wan2.2-TI2V-5B").strip()
APP_VERSION = "3.1.0"
MAX_CONCURRENT_JOBS = int(os.getenv("MAX_CONCURRENT_JOBS", "2"))
MAX_QUEUE = int(os.getenv("MAX_QUEUE", "20"))
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "20"))
_raw_cors = os.getenv("CORS_ORIGINS", "*").strip()
CORS_ORIGINS = ["*"] if _raw_cors == "*" else [o.strip() for o in _raw_cors.split(",") if o.strip()]
API_KEY = os.getenv("KELVID_API_KEY", "").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip()

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)
META_FILE = OUTPUT_DIR / "gallery.json"
JOBS_FILE = OUTPUT_DIR / "jobs.json"

RECOMMENDED_MODELS = [
    {"id": "Wan-AI/Wan2.2-TI2V-5B", "label": "Wan 2.2 TI2V 5B — balanced quality", "provider": "fal-ai"},
    {"id": "tencent/HunyuanVideo", "label": "HunyuanVideo — high consistency", "provider": "fal-ai"},
    {"id": "Lightricks/LTX-Video-0.9.8-13B-distilled", "label": "LTX-Video 13B — fastest", "provider": "fal-ai"},
]

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("kelvid")


def _read_json(path: Path, default):
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        log.warning("read %s failed: %s", path.name, e)
    return default


def _write_json(path: Path, data) -> None:
    try:
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
        tmp.replace(path)
    except Exception as e:
        log.warning("write %s failed: %s", path.name, e)


def load_gallery():
    items = _read_json(META_FILE, [])
    return items if isinstance(items, list) else []


def save_gallery(items) -> None:
    _write_json(META_FILE, items[:200])


jobs: Dict[str, Dict[str, Any]] = {}
jobs_lock = threading.Lock()
job_semaphore = threading.Semaphore(MAX_CONCURRENT_JOBS)
_hits: Dict[str, deque] = defaultdict(deque)


def _persist_jobs() -> None:
    with jobs_lock:
        snapshot = dict(jobs)
    _write_json(JOBS_FILE, snapshot)


def _restore_jobs() -> None:
    data = _read_json(JOBS_FILE, {})
    if isinstance(data, dict):
        for jid, job in data.items():
            if isinstance(job, dict) and job.get("status") in ("queued", "running"):
                job["status"] = "queued"
                job["note"] = "re-queued after restart"
                jobs[jid] = job
            elif isinstance(job, dict):
                jobs[jid] = job


_restore_jobs()


def _rate_ok(ip: str) -> bool:
    now = time.time()
    window = _hits[ip]
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= RATE_LIMIT_PER_MIN:
        return False
    window.append(now)
    return True


def _check_auth(request: Request) -> None:
    if API_KEY and request.headers.get("X-API-Key", "") != API_KEY:
        raise HTTPException(401, "Invalid or missing X-API-Key.")


def _save_video_bytes(video_bytes, out_path: Path) -> None:
    if isinstance(video_bytes, (bytes, bytearray)):
        out_path.write_bytes(bytes(video_bytes))
    elif isinstance(video_bytes, str) and os.path.exists(video_bytes):
        shutil.copy(video_bytes, out_path)
    elif hasattr(video_bytes, "read"):
        out_path.write_bytes(video_bytes.read())
    else:
        out_path.write_bytes(bytes(video_bytes))

app = FastAPI(title="Kelvid API", version=APP_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kelvid-frontend-ten.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/videos", StaticFiles(directory=str(OUTPUT_DIR)), name="videos")


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=2000)
    model: Optional[str] = None
    provider: Optional[str] = None
    negative_prompt: Optional[str] = None
    num_frames: Optional[int] = Field(default=None, ge=8, le=200)
    num_inference_steps: Optional[int] = Field(default=None, ge=1, le=100)
    guidance_scale: Optional[float] = Field(default=None, ge=1.0, le=20.0)
    seed: Optional[int] = None


def _run_job(job_id: str, req_dict: dict):
    acquired = job_semaphore.acquire(blocking=True, timeout=3600)
    if not acquired:
        with jobs_lock:
            jobs[job_id].update(status="failed", error="Queue timeout", finished_at=datetime.now().isoformat())
        _persist_jobs()
        return
    try:
        with jobs_lock:
            jobs[job_id]["status"] = "running"
            jobs[job_id]["started_at"] = datetime.now().isoformat()
        _persist_jobs()
        log.info("job %s started model=%s", job_id, req_dict["model"])
        from huggingface_hub import InferenceClient
        client = InferenceClient(provider=req_dict["provider"], api_key=HF_TOKEN)
        kwargs = {}
        for k in ("negative_prompt", "num_frames", "num_inference_steps", "guidance_scale", "seed"):
            if req_dict.get(k) is not None:
                kwargs[k] = req_dict[k]
        t0 = time.time()
        video_bytes = client.text_to_video(req_dict["prompt"], model=req_dict["model"], **kwargs)
        elapsed = round(time.time() - t0, 1)
        filename = f"{uuid.uuid4().hex}.mp4"
        out_path = OUTPUT_DIR / filename
        _save_video_bytes(video_bytes, out_path)
        url = f"/videos/{filename}"
        with jobs_lock:
            jobs[job_id].update(status="done", url=url, filename=filename,
                                elapsed_s=elapsed, finished_at=datetime.now().isoformat())
        gallery = load_gallery()
        gallery.insert(0, {"filename": filename, "url": url, "prompt": req_dict["prompt"],
                           "model": req_dict["model"], "provider": req_dict["provider"],
                           "created_at": datetime.now().isoformat()})
        save_gallery(gallery)
        log.info("job %s done in %ss", job_id, elapsed)
    except Exception as e:
        log.exception("job %s failed", job_id)
        with jobs_lock:
            jobs[job_id].update(status="failed", error=str(e)[:2000], finished_at=datetime.now().isoformat())
    finally:
        job_semaphore.release()
        _persist_jobs()

@app.get("/api/health")
def health():
    with jobs_lock:
        active = sum(1 for j in jobs.values() if j.get("status") in ("queued", "running"))
    return {"status": "ok", "app": "kelvid", "version": APP_VERSION,
            "token_configured": bool(HF_TOKEN), "active_jobs": active,
            "max_concurrent": MAX_CONCURRENT_JOBS}


@app.get("/api/models")
def list_models():
    return {"default": DEFAULT_MODEL, "provider": HF_PROVIDER, "models": RECOMMENDED_MODELS}


@app.get("/api/gallery")
def gallery():
    items = load_gallery()
    base = FRONTEND_URL.rstrip("/") if FRONTEND_URL else ""
    if base:
        items = [dict(g, url=base + g["url"]) if str(g.get("url", "")).startswith("/videos/") else g for g in items]
    return {"items": items}


@app.delete("/api/gallery/{filename}")
def delete_item(filename: str, request: Request):
    _check_auth(request)
    safe = Path(filename).name
    if not safe.endswith(".mp4"):
        raise HTTPException(400, "Invalid filename.")
    target = OUTPUT_DIR / safe
    if target.exists():
        try:
            target.unlink()
        except Exception as e:
            raise HTTPException(500, f"Delete failed: {e}")
    gallery = [g for g in load_gallery() if g.get("filename") != safe]
    save_gallery(gallery)
    return {"deleted": safe}


@app.post("/api/generate")
def generate(req: GenerateRequest, request: Request):
    """Queue a job, return job_id immediately. Poll /api/jobs/{id}."""
    _check_auth(request)
    ip = request.client.host if request.client else "unknown"
    if not _rate_ok(ip):
        raise HTTPException(429, "Rate limit exceeded. Slow down and retry.")
    if not HF_TOKEN:
        raise HTTPException(500, "HF_TOKEN not set in .env")
    if not req.prompt.strip():
        raise HTTPException(400, "Prompt is empty.")
    with jobs_lock:
        pending = sum(1 for j in jobs.values() if j.get("status") in ("queued", "running"))
    if pending >= MAX_QUEUE:
        raise HTTPException(503, f"Queue full ({pending}/{MAX_QUEUE}). Try again shortly.")
    model = (req.model or DEFAULT_MODEL).strip()
    provider = (req.provider or HF_PROVIDER).strip()
    job_id = uuid.uuid4().hex[:12]
    req_dict = req.model_dump()
    req_dict["model"] = model
    req_dict["provider"] = provider
    with jobs_lock:
        jobs[job_id] = {"job_id": job_id, "status": "queued", "prompt": req.prompt,
                        "model": model, "provider": provider,
                        "created_at": datetime.now().isoformat()}
    _persist_jobs()
    threading.Thread(target=_run_job, args=(job_id, req_dict), daemon=True).start()
    log.info("job %s queued ip=%s model=%s", job_id, ip, model)
    return {"job_id": job_id, "status": "queued", "model": model, "provider": provider,
            "position": pending + 1}


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found (server restarted?)")
    job = dict(job)
    base = FRONTEND_URL.rstrip("/") if FRONTEND_URL else ""
    if base and str(job.get("url", "")).startswith("/videos/"):
        job["url"] = base + job["url"]
    return job


@app.get("/api/jobs")
def all_jobs():
    with jobs_lock:
        items = sorted(jobs.values(), key=lambda j: j.get("created_at", ""), reverse=True)[:50]
    return {"jobs": items}


@app.post("/api/jobs/{job_id}/retry")
def retry_job(job_id: str, request: Request):
    _check_auth(request)
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            raise HTTPException(404, "Job not found.")
        if job.get("status") != "failed":
            raise HTTPException(400, "Only failed jobs can be retried.")
        req_dict = {"prompt": job["prompt"], "model": job["model"], "provider": job["provider"],
                    "negative_prompt": None, "num_frames": None, "num_inference_steps": None,
                    "guidance_scale": None, "seed": None}
        job.update(status="queued", error=None, created_at=datetime.now().isoformat())
    _persist_jobs()
    threading.Thread(target=_run_job, args=(job_id, req_dict), daemon=True).start()
    return {"job_id": job_id, "status": "queued"}


@app.get("/")
def root():
    return {"app": "kelvid", "version": APP_VERSION, "docs": "/docs", "health": "/api/health"}