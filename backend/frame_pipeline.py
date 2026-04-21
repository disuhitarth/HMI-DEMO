from __future__ import annotations
import asyncio
import cv2
import time
import numpy as np
from collections import deque
from config import (
    CAMERA_INDEX,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    CAPTURE_FPS,
    FRAME_QUEUE_SIZE,
    MJPEG_QUALITY,
)


class FramePipeline:
    """
    Producer/consumer pipeline.
    Producer: OpenCV capture runs in thread (blocking I/O)
    Consumer: inference runs in asyncio event loop
    Queue maxsize=2 drops stale frames automatically
    """

    def __init__(self):
        self.cap: cv2.VideoCapture | None = None
        self.queue: asyncio.Queue = asyncio.Queue(maxsize=FRAME_QUEUE_SIZE)
        self._running = False
        self._fps_times: deque = deque(maxlen=30)
        self.fps: float = 0.0
        self._latest_annotated: np.ndarray | None = None

    def open_camera(self) -> bool:
        self.cap = cv2.VideoCapture(CAMERA_INDEX)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
        self.cap.set(cv2.CAP_PROP_FPS, CAPTURE_FPS)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        # CAP_PROP_BUFFERSIZE=1 prevents internal buffer buildup
        return self.cap.isOpened()

    def release_camera(self):
        if self.cap:
            self.cap.release()
            self.cap = None

    async def start_capture(self):
        self._running = True
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._capture_loop)

    def _capture_loop(self):
        """Runs in thread pool. Reads frames and puts in queue."""
        while self._running:
            if not self.cap or not self.cap.isOpened():
                break
            ret, frame = self.cap.read()
            if not ret:
                continue
            # Non-blocking put — drop frame if queue full (keeps newest)
            try:
                self.queue.put_nowait(frame)
            except asyncio.QueueFull:
                pass

    def stop(self):
        self._running = False

    def compute_fps(self):
        now = time.perf_counter()
        self._fps_times.append(now)
        if len(self._fps_times) >= 2:
            elapsed = self._fps_times[-1] - self._fps_times[0]
            self.fps = round(len(self._fps_times) / elapsed, 1)

    def encode_jpeg(self, frame: np.ndarray) -> bytes:
        _, buf = cv2.imencode(
            ".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, MJPEG_QUALITY]
        )
        return buf.tobytes()
