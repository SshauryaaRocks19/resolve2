"""
Central configuration for the Prioritisation Engine.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
SYLLABUS_KB_DIR = BASE_DIR / "syllabus_kb"
DATA_DIR = PROJECT_ROOT / "data"
PAPERS_DIR = DATA_DIR / "papers"
OUTPUT_DIR = DATA_DIR / "output"
DB_PATH = DATA_DIR / "prioritisation.db"

# ─── Supported Exams ─────────────────────────────────────────────────────────
SUPPORTED_EXAMS = ["jee_main", "neet", "cbse"]

EXAM_SUBJECTS = {
    "jee_main": ["physics", "chemistry", "maths"],
    "neet": ["physics", "chemistry", "biology"],
    "cbse": ["physics", "chemistry", "maths", "biology"],
}

# ─── Analysis Settings ───────────────────────────────────────────────────────
YEAR_RANGE_START = 2020
YEAR_RANGE_END = 2025

# Priority scoring weights (must sum to 1.0)
PRIORITY_WEIGHTS = {
    "frequency": 0.30,
    "marks_weightage": 0.25,
    "recency": 0.25,
    "trend": 0.20,
}

# ─── OCR / Extraction Settings ──────────────────────────────────────────────
TESSERACT_CMD = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
OCR_DPI = 300
OCR_LANG = "eng"

# ─── LLM / Classification Settings ──────────────────────────────────────────
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "google")  # "huggingface", "openai", "google"
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.0-flash")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")

# Classification confidence threshold (0-1)
CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.60

# ─── Database ────────────────────────────────────────────────────────────────
DB_ECHO = False  # Set True for SQL debug logging

# ─── Revision Tool Settings ─────────────────────────────────────────────────
REVISION_OUTPUT_DIR = OUTPUT_DIR / "revision"
