<p align="center">
  <h1 align="center">🎯 reSolve — Exam Prioritisation Engine</h1>
  <p align="center">
    <em>An AI-powered tool that analyses exam papers, classifies questions by syllabus topic, and generates priority-ranked study plans.</em>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/python-3.10+-blue.svg" alt="Python 3.10+">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT">
    <img src="https://img.shields.io/badge/AI-Gemini%20%7C%20Embeddings-orange.svg" alt="AI Powered">
    <img src="https://img.shields.io/badge/exams-JEE%20%7C%20NEET%20%7C%20CBSE-purple.svg" alt="Supported Exams">
  </p>
</p>

---

## 📖 What is reSolve?

**reSolve** is a full-stack exam analytics pipeline designed for Indian competitive exam preparation. It takes a raw exam paper PDF, processes it through an intelligent pipeline, and tells you **which syllabus topics are tested most frequently** — so you can prioritise your study time effectively.

### The Problem

Students preparing for exams like **JEE Main**, **NEET**, and **CBSE** boards often study all topics equally. But exam papers don't test all topics equally — some chapters appear in **every paper**, while others appear rarely. Without data, students waste time on low-frequency topics.

### The Solution

reSolve automates what a teacher does manually:
1. **Extracts** text from past exam papers (PDF → text)
2. **Segments** the text into individual questions
3. **Classifies** each question into syllabus topics using AI
4. **Scores & Ranks** topics by frequency, recency, and marks weightage
5. **Generates** a priority report: *"Focus on Electrostatics, Kinematics, and Organic Chemistry first"*

---

## 🏗️ Architecture

```
                     ┌─────────────────────────────────────────────┐
                     │               reSolve Pipeline              │
                     └─────────────────────────────────────────────┘
                                        │
          ┌─────────────┬───────────────┼───────────────┬──────────────┐
          ▼             ▼               ▼               ▼              ▼
    ┌───────────┐ ┌───────────┐ ┌─────────────┐ ┌───────────┐ ┌────────────┐
    │ Extraction│ │Segmentation│ │Classification│ │  Scoring  │ │  Reporting │
    │  (PDF→Txt)│ │(Txt→Q's)  │ │ (Q→Topics)  │ │(Topics→  │ │ (Scores→   │
    │           │ │           │ │             │ │  Scores)  │ │   Report)  │
    └───────────┘ └───────────┘ └─────────────┘ └───────────┘ └────────────┘
         │             │               │               │              │
    pdfplumber     Regex NLP      Gemini API /     Weighted       JSON / 
    pytesseract                  Sentence-BERT     Scoring       Console
```

### Module Breakdown

| Module | Purpose | Technology |
|--------|---------|------------|
| **Extraction** | Converts PDF exam papers to plain text | `pdfplumber` (digital PDFs), `pytesseract` + OCR (scanned PDFs) |
| **Segmentation** | Splits raw text into individual questions | Regex pattern matching with configurable question formats |
| **Classification** | Maps each question to syllabus topics | Google Gemini API (LLM) or `sentence-transformers` (local embeddings) |
| **Scoring** | Calculates priority scores per topic | Weighted formula: frequency × recency × marks |
| **Database** | Stores papers, questions, and classifications | SQLAlchemy + SQLite |
| **Syllabus KB** | Curated knowledge base of exam topics | JSON files with chapters, topics, aliases, and weightages |

---

## 📂 Project Structure

```
reSolve2/
├── main.py                          # CLI entry point
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variable template
├── LICENSE                          # MIT License
│
├── prioritisation_engine/           # Core engine package
│   ├── __init__.py
│   ├── config.py                    # All configuration & settings
│   │
│   ├── extraction/                  # PDF → Text module
│   │   ├── __init__.py
│   │   └── extractor.py
│   │
│   ├── segmentation/                # Text → Questions module
│   │   ├── __init__.py
│   │   └── segmenter.py
│   │
│   ├── classification/              # Questions → Topics module
│   │   ├── __init__.py
│   │   └── classifier.py
│   │
│   ├── scoring/                     # Topics → Priority Scores module
│   │   ├── __init__.py
│   │   └── scorer.py
│   │
│   ├── database/                    # SQLite persistence layer
│   │   ├── __init__.py
│   │   └── models.py
│   │
│   └── syllabus_kb/                 # Syllabus Knowledge Base
│       ├── __init__.py
│       ├── jee_main/                # JEE Main syllabus
│       │   ├── physics.json
│       │   ├── chemistry.json
│       │   └── maths.json
│       ├── neet/                    # NEET syllabus
│       │   ├── physics.json
│       │   ├── chemistry.json
│       │   └── biology.json
│       └── cbse/                    # CBSE 12th syllabus
│           ├── physics.json
│           ├── chemistry.json
│           ├── maths.json
│           └── biology.json
│
└── data/                            # Runtime data (gitignored)
    ├── output/                      # Pipeline output files
    └── prioritisation.db            # SQLite database
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Tesseract OCR** (only needed for scanned PDFs) — [Install Guide](https://github.com/tesseract-ocr/tesseract)
- A **Google Gemini API key** (free tier works) — [Get one here](https://aistudio.google.com/apikey)

### 1. Clone & Setup

```bash
git clone https://github.com/Kprakash78/Resolve_amd.git
cd Resolve_amd

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Key

```bash
# Copy the template
cp .env.example .env

# Edit .env and add your API key
# LLM_API_KEY=your_google_api_key_here
```

> **Note:** The embedding strategy (`--strategy embedding`) works **completely offline** with no API key needed.

### 3. Initialise Database

```bash
python main.py init-db
```

This creates a SQLite database and seeds it with the syllabus knowledge base (topics from JEE Main, NEET, and CBSE).

### 4. Run the Pipeline

```bash
# Step 1: Extract text from PDF
python main.py extract your_paper.pdf -o data/output/extracted.txt

# Step 2: Segment into questions
python main.py segment data/output/extracted.txt -e jee_main -o data/output/segmented.json

# Step 3: Classify questions into topics
# Using local embeddings (free, no API key needed):
python main.py classify data/output/segmented.json -e jee_main -s physics --strategy embedding -o data/output/classified.json

# Using Google Gemini (more accurate, needs API key):
python main.py classify data/output/segmented.json -e jee_main -s physics --strategy llm -o data/output/classified.json

# Step 4: Generate priority report
python main.py report data/output/classified.json -o data/output/report.json
```

---

## 🧠 Classification Strategies

reSolve offers two classification approaches:

### 1. LLM-Based (Recommended for accuracy)

Uses Google Gemini API to classify questions with high confidence (80-95%).

```bash
python main.py classify segmented.json -e jee_main -s physics --strategy llm
```

| Pros | Cons |
|------|------|
| High accuracy (80-95% confidence) | Requires API key |
| Understands context and nuance | Rate limited on free tier (15 RPM) |
| Multi-topic detection | Needs internet connection |

### 2. Embedding-Based (Recommended for offline/bulk use)

Uses `sentence-transformers` (all-MiniLM-L6-v2) locally with cosine similarity.

```bash
python main.py classify segmented.json -e jee_main -s physics --strategy embedding
```

| Pros | Cons |
|------|------|
| Completely free & offline | Lower confidence scores (15-50%) |
| No rate limits | Less context-aware |
| Fast batch processing | Single-topic matching |

---

## 📚 Supported Exams & Syllabi

The syllabus knowledge base includes comprehensive topic coverage:

| Exam | Subjects | Chapters | Topics | Aliases |
|------|----------|----------|--------|---------|
| **JEE Main** | Physics, Chemistry, Maths | 60+ | 400+ | 2000+ |
| **NEET** | Physics, Chemistry, Biology | 60+ | 400+ | 2000+ |
| **CBSE 12th** | Physics, Chemistry, Maths, Biology | 65+ | 450+ | 2200+ |

Each syllabus JSON contains:
- **Chapter names** and IDs
- **Sub-topics** within each chapter
- **Keyword aliases** for better matching (e.g., "SHM" → "Oscillations")
- **Weightages** based on historical exam data
- **Key formulas** and concepts

---

## ⚙️ Configuration

All settings are in `prioritisation_engine/config.py`:

```python
# LLM Settings (auto-loaded from .env)
LLM_PROVIDER = "google"         # "google", "openai", or "huggingface"
LLM_MODEL = "gemini-2.0-flash"  # Model name
LLM_API_KEY = ""                # From .env file

# Scoring Weights
SCORING_WEIGHTS = {
    "frequency": 0.40,           # How often a topic appears
    "recency": 0.30,             # Recent papers weighted more
    "marks": 0.30,               # Higher-mark questions weighted more
}

# Classification Threshold
CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.60  # For LLM strategy
# Embedding strategy uses its own threshold of 0.25
```

---

## 📊 CLI Reference

```
usage: main.py [-h] {init-db,extract,segment,classify,report,syllabus} ...

reSolve — Exam Prioritisation Engine

Commands:
  init-db     Initialise the database and seed syllabus topics
  extract     Extract text from a PDF exam paper
  segment     Segment extracted text into individual questions
  classify    Classify questions into syllabus topics
  report      Generate a priority report from classifications
  syllabus    Browse the syllabus knowledge base
```

### Command Examples

```bash
# View syllabus topics
python main.py syllabus --exam jee_main --subject physics

# Extract with OCR fallback for scanned PDFs
python main.py extract scanned_paper.pdf --ocr -o output.txt

# Classify for chemistry
python main.py classify segmented.json -e neet -s chemistry --strategy embedding -o chem.json
```

---

## 🔧 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Language** | Python 3.10+ | Core language |
| **PDF Parsing** | pdfplumber | Digital PDF text extraction |
| **OCR** | pytesseract + Pillow | Scanned PDF text extraction |
| **NLP** | spaCy | Text processing |
| **Embeddings** | sentence-transformers | Local AI classification |
| **LLM** | Google Gemini API | Cloud AI classification |
| **Database** | SQLAlchemy + SQLite | Data persistence |
| **ML** | scikit-learn, PyTorch | Similarity computation |
| **Config** | python-dotenv | Environment management |

---

## 🗺️ Roadmap

- [x] PDF text extraction (digital + OCR)
- [x] Question segmentation with regex patterns
- [x] LLM-based topic classification (Gemini)
- [x] Embedding-based topic classification (offline)
- [x] Syllabus knowledge base (JEE, NEET, CBSE)
- [x] SQLite database with topic seeding
- [ ] Priority scoring and weighted reports
- [ ] Web dashboard for visual analytics
- [ ] Multi-paper trend analysis
- [ ] PDF export of priority reports
- [ ] Support for state board exams

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "Add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Areas for Contribution

- Adding syllabus KBs for more exams (state boards, KVPY, Olympiads)
- Improving segmentation patterns for different paper formats
- Building a web UI dashboard
- Adding more LLM provider integrations

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for students who want to study smarter, not harder.</strong>
</p>
