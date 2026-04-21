import cv2
import numpy as np
import torch
import time
from ultralytics import YOLO
from config import YOLO_MODEL, MIN_CONFIDENCE, ZONE, FRAME_WIDTH, FRAME_HEIGHT

DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"


class Detector:
    def __init__(self):
        self.model = YOLO(YOLO_MODEL)
        self.model.to(DEVICE)
        # Warm up model with a dummy frame
        dummy = np.zeros((FRAME_HEIGHT, FRAME_WIDTH, 3), dtype=np.uint8)
        self.model(dummy, verbose=False)

    def process_frame(self, frame_bgr: np.ndarray) -> dict:
        t0 = time.perf_counter()
        results = self.model(frame_bgr, verbose=False, conf=MIN_CONFIDENCE)[0]
        inference_ms = (time.perf_counter() - t0) * 1000

        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls = self.model.names[int(box.cls[0])]
            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2
            detections.append(
                {
                    "class": cls,
                    "confidence": round(conf, 4),
                    "bbox": [round(x1), round(y1), round(x2), round(y2)],
                    "centroid": [round(cx), round(cy)],
                }
            )

        annotated = frame_bgr.copy()
        self._draw_zone(annotated)
        self._draw_detections(annotated, detections)

        return {
            "detections": detections,
            "inference_ms": round(inference_ms, 2),
            "annotated_frame": annotated,
        }

    def _draw_zone(self, frame: np.ndarray):
        h, w = frame.shape[:2]
        x1 = int(ZONE["x1"] * w)
        y1 = int(ZONE["y1"] * h)
        x2 = int(ZONE["x2"] * w)
        y2 = int(ZONE["y2"] * h)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 1)

    def _draw_detections(self, frame: np.ndarray, detections: list):
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            label = f"{det['class']} {det['confidence']:.0%}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 136), 2)
            cv2.putText(
                frame,
                label,
                (x1, y1 - 8),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (0, 255, 136),
                2,
            )
