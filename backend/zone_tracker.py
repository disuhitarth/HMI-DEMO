from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timezone
import time
from config import ZONE, FAIL_TIMEOUT_SECONDS, MIN_DWELL_FOR_PASS


class ZoneState(Enum):
    IDLE = "IDLE"
    IN_ZONE = "IN_ZONE"
    EXITED = "EXITED"


@dataclass
class ZoneEvent:
    event: str  # "ENTRY" | "EXIT" | "FAIL" | "NONE"
    object_class: str | None = None
    confidence: float | None = None
    entry_time: str | None = None
    exit_time: str | None = None
    dwell_seconds: float | None = None
    result: str = "IDLE"  # "PASS" | "FAIL" | "IDLE" | "IN_ZONE"


class ZoneTracker:
    def __init__(self):
        self.state: ZoneState = ZoneState.IDLE
        self.entry_time: float | None = None
        self.entry_iso: str | None = None
        self.exit_time: float | None = None
        self.exit_iso: str | None = None
        self.last_seen_time: float = 0
        self.tracked_class: str | None = None
        self.tracked_conf: float | None = None
        self.current_result: str = "IDLE"

    def update(
        self,
        detections: list[dict],
        frame_w: int,
        frame_h: int,
        now: float,
    ) -> ZoneEvent:
        in_zone_detections = [
            d for d in detections
            if self._centroid_in_zone(d["bbox"], frame_w, frame_h)
        ]

        if in_zone_detections:
            best = max(in_zone_detections, key=lambda d: d["confidence"])
            self.last_seen_time = now

            if self.state == ZoneState.IDLE:
                self.state = ZoneState.IN_ZONE
                self.entry_time = now
                self.entry_iso = datetime.now(timezone.utc).isoformat()
                self.tracked_class = best["class"]
                self.tracked_conf = best["confidence"]
                self.current_result = "IN_ZONE"
                return ZoneEvent(
                    event="ENTRY",
                    object_class=self.tracked_class,
                    confidence=self.tracked_conf,
                    entry_time=self.entry_iso,
                    result="IN_ZONE",
                )

            return ZoneEvent(
                event="NONE",
                result="IN_ZONE",
                object_class=self.tracked_class,
                confidence=self.tracked_conf,
                entry_time=self.entry_iso,
            )

        else:
            if self.state == ZoneState.IN_ZONE:
                self.state = ZoneState.EXITED
                self.exit_time = now
                self.exit_iso = datetime.now(timezone.utc).isoformat()
                dwell = self.exit_time - self.entry_time
                result = "PASS" if dwell >= MIN_DWELL_FOR_PASS else "FAIL"
                self.current_result = result
                return ZoneEvent(
                    event="EXIT",
                    object_class=self.tracked_class,
                    confidence=self.tracked_conf,
                    entry_time=self.entry_iso,
                    exit_time=self.exit_iso,
                    dwell_seconds=round(dwell, 3),
                    result=result,
                )

            if self.state == ZoneState.EXITED:
                if self.exit_time and now - self.exit_time > FAIL_TIMEOUT_SECONDS:
                    self.state = ZoneState.IDLE
                    self.current_result = "IDLE"

            if self.state == ZoneState.IDLE and self.last_seen_time > 0:
                if now - self.last_seen_time > FAIL_TIMEOUT_SECONDS:
                    self.current_result = "IDLE"

            return ZoneEvent(event="NONE", result=self.current_result)

    def _centroid_in_zone(self, bbox: list, fw: int, fh: int) -> bool:
        x1, y1, x2, y2 = bbox
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        zx1 = ZONE["x1"] * fw
        zy1 = ZONE["y1"] * fh
        zx2 = ZONE["x2"] * fw
        zy2 = ZONE["y2"] * fh
        return zx1 <= cx <= zx2 and zy1 <= cy <= zy2
