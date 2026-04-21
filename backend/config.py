from dotenv import load_dotenv
import os

load_dotenv()

# Camera
CAMERA_INDEX = 0
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720
CAPTURE_FPS = 30

# Inspection zone (as fraction of frame 0.0-1.0)
ZONE = {"x1": 0.28, "y1": 0.18, "x2": 0.72, "y2": 0.82}

# Detection
MIN_CONFIDENCE = 0.45
YOLO_MODEL = "yolov8n.pt"

# Zone logic
FAIL_TIMEOUT_SECONDS = 2.0
MIN_DWELL_FOR_PASS = 0.5

# LLM
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_THROTTLE_SECONDS = 3.0

# DB
DB_PATH = "inspections.db"

# Server
HOST = "0.0.0.0"
PORT = 8000

# Frame pipeline
FRAME_QUEUE_SIZE = 2
# Drop stale frames — critical for real-time performance

# MJPEG
MJPEG_QUALITY = 80
# JPEG quality 1-100. 80 = good quality/size tradeoff
