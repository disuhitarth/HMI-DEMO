from __future__ import annotations
import asyncio
import time
import io
import cv2
import numpy as np
import google.generativeai as genai
from PIL import Image
from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_THROTTLE_SECONDS

genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = (
    "You are a quality control AI on an automotive parts assembly line. "
    "Analyze the image and the detected object. Respond in exactly 2 sentences. "
    "Sentence 1: Describe the object (material, shape, approximate size). "
    "Sentence 2: Note any visible anomaly, damage, or irregularity. "
    "If none found, say 'No visible defects detected.' "
    "Be concise and technical. No markdown."
)


class LLMEnricher:
    def __init__(self):
        self.model = genai.GenerativeModel(GEMINI_MODEL)
        self._last_call: float = 0
        self._lock = asyncio.Lock()

    async def enrich(
        self,
        frame_bgr: np.ndarray,
        object_class: str,
        confidence: float,
    ) -> str | None:
        async with self._lock:
            now = time.monotonic()
            if now - self._last_call < GEMINI_THROTTLE_SECONDS:
                return None  # Throttled
            self._last_call = now

        try:
            rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
            buf = io.BytesIO()
            pil_img.save(buf, format="JPEG", quality=70)
            img_bytes = buf.getvalue()

            prompt = (
                f"Detected object: {object_class} "
                f"(confidence: {confidence:.1%})\n"
                f"{SYSTEM_PROMPT}"
            )

            response = await asyncio.to_thread(
                self.model.generate_content,
                [{"mime_type": "image/jpeg", "data": img_bytes}, prompt],
            )
            return response.text.strip()

        except Exception:
            return "LLM analysis unavailable."
