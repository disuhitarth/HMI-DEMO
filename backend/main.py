from __future__ import annotations
import asyncio
import uvloop
import json
import time
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import HOST, PORT
from frame_pipeline import FramePipeline
from detector import Detector
from zone_tracker import ZoneTracker
from llm_enricher import LLMEnricher
from logger import init_db, log_inspection, get_recent_logs, get_session_stats

# Use uvloop for 2-4x faster async event loop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

# --- Global state ---
pipeline = FramePipeline()
detector = Detector()
tracker = ZoneTracker()
enricher = LLMEnricher()

is_running = False
session_start: str | None = None
latest_detection_data: dict = {}
latest_llm_desc: str | None = None
connected_ws_clients: list[WebSocket] = []


# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    pipeline.open_camera()
    asyncio.create_task(inference_loop())
    asyncio.create_task(capture_task())
    yield
    pipeline.stop()
    pipeline.release_camera()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Background capture task ---
async def capture_task():
    await pipeline.start_capture()


# --- Inference loop ---
async def inference_loop():
    global latest_detection_data, latest_llm_desc

    while True:
        if not is_running:
            await asyncio.sleep(0.05)
            continue

        try:
            frame = await asyncio.wait_for(pipeline.queue.get(), timeout=0.1)
        except asyncio.TimeoutError:
            continue

        pipeline.compute_fps()
        now = time.monotonic()
        result = detector.process_frame(frame)
        detections = result["detections"]
        inference_ms = result["inference_ms"]
        annotated = result["annotated_frame"]

        # Zone tracking
        event = tracker.update(detections, frame.shape[1], frame.shape[0], now)

        # Trigger LLM enrichment async on ENTRY
        if event.event == "ENTRY" and detections:
            captured_frame = frame.copy()
            captured_class = event.object_class
            captured_conf = event.confidence

            async def run_llm():
                global latest_llm_desc
                latest_llm_desc = "Analyzing..."
                desc = await enricher.enrich(
                    captured_frame, captured_class, captured_conf
                )
                if desc:
                    latest_llm_desc = desc
                    await broadcast_ws()

            asyncio.create_task(run_llm())

        # Log on EXIT or FAIL
        if event.event in ("EXIT", "FAIL"):
            asyncio.create_task(
                log_inspection(
                    timestamp_in=event.entry_time,
                    timestamp_out=event.exit_time,
                    dwell_seconds=event.dwell_seconds,
                    object_class=event.object_class or "unknown",
                    confidence=event.confidence or 0.0,
                    result=event.result,
                    llm_desc=latest_llm_desc,
                )
            )
            if event.result == "FAIL":
                latest_llm_desc = None

        # Store latest annotated frame for MJPEG
        pipeline._latest_annotated = annotated

        # Build detection JSON (no frame data)
        stats = await get_session_stats(session_start) if session_start else {}
        logs = await get_recent_logs(10)

        from config import ZONE

        latest_detection_data = {
            "fps": pipeline.fps,
            "inference_ms": inference_ms,
            "detections": detections,
            "zone_status": event.result,
            "pass_fail": event.result,
            "current_object": event.object_class,
            "confidence": event.confidence,
            "entry_time": event.entry_time,
            "exit_time": event.exit_time,
            "dwell_seconds": event.dwell_seconds,
            "llm_description": latest_llm_desc,
            "alert": event.result == "FAIL",
            "zone_config": ZONE,
            "camera_info": {
                "name": "MacBook Webcam",
                "resolution": "1280x720",
                "fps_target": 30,
                "status": "CONNECTED" if pipeline.cap else "DISCONNECTED",
            },
            "session_stats": stats,
            "recent_logs": logs,
            "is_running": is_running,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        await broadcast_ws()


# --- MJPEG stream endpoint ---
async def mjpeg_generator():
    boundary = b"--frame"
    while True:
        frame = pipeline._latest_annotated
        if frame is None:
            await asyncio.sleep(0.033)
            continue
        jpeg_bytes = pipeline.encode_jpeg(frame)
        yield (
            boundary
            + b"\r\n"
            b"Content-Type: image/jpeg\r\n"
            b"Content-Length: "
            + str(len(jpeg_bytes)).encode()
            + b"\r\n\r\n"
            + jpeg_bytes
            + b"\r\n"
        )
        await asyncio.sleep(0.033)  # ~30fps cap


@app.get("/video")
async def video_feed():
    return StreamingResponse(
        mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# --- WebSocket endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_ws_clients.append(ws)
    try:
        await ws.send_text(json.dumps(latest_detection_data))
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if ws in connected_ws_clients:
            connected_ws_clients.remove(ws)


async def broadcast_ws():
    if not connected_ws_clients:
        return
    msg = json.dumps(latest_detection_data)
    dead = []
    for ws in connected_ws_clients:
        try:
            await ws.send_text(msg)
        except Exception:
            dead.append(ws)
    for ws in dead:
        if ws in connected_ws_clients:
            connected_ws_clients.remove(ws)


# --- REST endpoints ---
class ControlBody(BaseModel):
    action: str  # "start" | "stop"


@app.post("/control")
async def control(body: ControlBody):
    global is_running, session_start, latest_llm_desc
    if body.action == "start":
        is_running = True
        session_start = datetime.now(timezone.utc).isoformat()
        latest_llm_desc = None
        tracker.__init__()  # Reset tracker state
        return {"status": "started", "session_start": session_start}
    elif body.action == "stop":
        is_running = False
        return {"status": "stopped"}
    return {"error": "unknown action"}

class ZoneBody(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

@app.post("/zone")
async def update_zone(body: ZoneBody):
    from config import ZONE
    ZONE["x1"] = max(0.0, min(1.0, body.x1))
    ZONE["y1"] = max(0.0, min(1.0, body.y1))
    ZONE["x2"] = max(0.0, min(1.0, body.x2))
    ZONE["y2"] = max(0.0, min(1.0, body.y2))
    return ZONE

@app.get("/logs")
async def logs(limit: int = 100):
    return await get_recent_logs(limit)


@app.get("/health")
async def health():
    import torch

    return {
        "status": "ok",
        "camera": pipeline.cap is not None and pipeline.cap.isOpened(),
        "model": True,
        "is_running": is_running,
        "device": "mps" if torch.backends.mps.is_available() else "cpu",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=HOST, port=PORT)
