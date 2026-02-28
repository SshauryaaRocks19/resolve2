"""
Question Segmentation Module -- splits raw extracted text into individual questions.

Handles various question paper formats:
  - Numbered questions (Q.1, Q1, 1., Question 1, etc.)
  - Sub-parts (a, b, c or i, ii, iii)
  - Sections (Section A, Part I, etc.)
  - OR alternatives
"""

from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)


@dataclass
class Question:
    """A single segmented question."""
    question_number: int
    text: str
    section: Optional[str] = None
    sub_parts: List[str] = field(default_factory=list)
    marks: Optional[int] = None
    question_type: Optional[str] = None  # "MCQ", "Subjective", "Numerical", "Assertion-Reason"
    has_or_alternative: bool = False
    or_alternative_text: Optional[str] = None
    raw_start_line: Optional[int] = None
    raw_end_line: Optional[int] = None


@dataclass
class SegmentationResult:
    """Complete segmentation of a paper."""
    total_questions: int
    sections: List[str]
    questions: List[Question]
    warnings: List[str] = field(default_factory=list)

    def get_questions_by_section(self, section: str) -> List[Question]:
        return [q for q in self.questions if q.section == section]


# --- Regex Patterns for Question Detection ---

# Primary question number patterns (matches Q.1, Q1, 1., Question 1, etc.)
QUESTION_PATTERNS = [
    # "Q.1" or "Q1" or "Q 1" with optional delimiter (case-insensitive)
    re.compile(r"^\s*Q\s*\.?\s*(\d+)\s*[\.\)\:]?\s+\S", re.IGNORECASE | re.MULTILINE),
    # "Question 1" or "Question 1." or "Question 1:"
    re.compile(r"^\s*Question\s+(\d+)\s*[\.\)\:]?", re.IGNORECASE | re.MULTILINE),
    # "1." or "1)" at start of line (with at least some text after)
    re.compile(r"^\s*(\d{1,3})\s*[\.\)]\s+\S", re.MULTILINE),
]

# Section header patterns (require standalone line to avoid false matches)
SECTION_PATTERNS = [
    re.compile(r"^\s*(Section\s*[A-E])\s*$", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^\s*(PART\s*[A-EI-V]+)\s*$", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^\s*(SECTION\s+[A-E])\s*[:\-]?\s*$", re.IGNORECASE | re.MULTILINE),
]

# Marks pattern (e.g., "[2 marks]", "[3M]", "(4 marks)", "2x1=2")
MARKS_PATTERNS = [
    re.compile(r"\[(\d+)\s*(?:marks?|M)\]", re.IGNORECASE),
    re.compile(r"\((\d+)\s*(?:marks?|M)\)", re.IGNORECASE),
    re.compile(r"(\d+)\s*(?:marks?|M)\s*$", re.IGNORECASE),
    re.compile(r"(\d+)\s*x\s*\d+\s*=\s*(\d+)", re.IGNORECASE),  # "5x1=5"
]

# OR alternative pattern
OR_PATTERN = re.compile(r"^\s*(?:OR|Or|or)\s*$", re.MULTILINE)

# MCQ option patterns (a), (b), (c), (d) or (1), (2), (3), (4)
MCQ_OPTION_PATTERN = re.compile(
    r"^\s*\(?[abcdABCD1234]\)?\s*[\.\)]\s+",
    re.MULTILINE,
)

# Assertion-Reason pattern
AR_PATTERN = re.compile(
    r"(?:Assertion|Statement\s*[\-]\s*I|Statement\s+1)",
    re.IGNORECASE,
)

# Lines to skip (headers, footers, navigation)
SKIP_PATTERNS = [
    re.compile(r"^\s*Android App", re.IGNORECASE),
    re.compile(r"^\s*iOS App", re.IGNORECASE),
    re.compile(r"^\s*PW Website", re.IGNORECASE),
    re.compile(r"^\s*https?://", re.IGNORECASE),
    re.compile(r"^\s*\d+/\d+$"),  # page numbers like "3/20"
]


def segment_questions(text: str, exam_type: str = "auto") -> SegmentationResult:
    """Segment raw text into individual questions.

    Args:
        text: The raw text from a question paper.
        exam_type: Hint for paper format. One of "jee_main", "neet", "cbse", or "auto".

    Returns:
        SegmentationResult with parsed questions.
    """
    lines = text.split("\n")
    warnings: List[str] = []

    # Step 1: Detect sections
    sections = _detect_sections(text)

    # Step 2: Find question boundaries
    boundaries = _find_question_boundaries(lines)

    if not boundaries:
        warnings.append("No question boundaries detected. Treating entire text as a single block.")
        return SegmentationResult(
            total_questions=1,
            sections=sections,
            questions=[Question(question_number=1, text=text.strip())],
            warnings=warnings,
        )

    # Step 3: Extract questions from boundaries
    questions: List[Question] = []
    for idx, (start_line, q_num) in enumerate(boundaries):
        # Determine end of this question
        end_line = boundaries[idx + 1][0] - 1 if idx + 1 < len(boundaries) else len(lines) - 1

        # Extract text, filtering out header/footer lines
        q_lines = []
        for line in lines[start_line:end_line + 1]:
            if not any(sp.search(line) for sp in SKIP_PATTERNS):
                q_lines.append(line)
        q_text = "\n".join(q_lines).strip()

        # Determine section
        section = _get_section_for_line(start_line, sections, lines)

        # Detect marks
        marks = _detect_marks(q_text)

        # Detect question type
        q_type = _detect_question_type(q_text, exam_type)

        # Detect OR alternative
        has_or, or_text, main_text = _split_or_alternative(q_text)

        # Extract sub-parts
        sub_parts = _extract_sub_parts(main_text)

        questions.append(Question(
            question_number=q_num,
            text=main_text,
            section=section,
            sub_parts=sub_parts,
            marks=marks,
            question_type=q_type,
            has_or_alternative=has_or,
            or_alternative_text=or_text,
            raw_start_line=start_line,
            raw_end_line=end_line,
        ))

    result = SegmentationResult(
        total_questions=len(questions),
        sections=sections,
        questions=questions,
        warnings=warnings,
    )

    logger.info(f"Segmented {result.total_questions} questions across {len(sections)} sections")
    return result


def _detect_sections(text: str) -> List[str]:
    """Find section headers in the text."""
    found: List[str] = []
    for pattern in SECTION_PATTERNS:
        for match in pattern.finditer(text):
            section_name = match.group(1).strip()
            if section_name not in found:
                found.append(section_name)
    return found


def _find_question_boundaries(lines: List[str]) -> List[Tuple[int, int]]:
    """Find (line_index, question_number) for each question start.

    Returns a sorted list of (line_index, question_number) tuples.
    """
    boundaries: List[Tuple[int, int]] = []

    for line_idx, line in enumerate(lines):
        # Skip header/footer/nav lines
        if any(sp.search(line) for sp in SKIP_PATTERNS):
            continue
        for pattern in QUESTION_PATTERNS:
            match = pattern.match(line)
            if match:
                q_num = int(match.group(1))
                boundaries.append((line_idx, q_num))
                break  # Only match first pattern per line

    # Sort by line index
    boundaries.sort(key=lambda x: x[0])

    # Deduplicate: keep first occurrence of each question number
    seen_q_nums = set()
    deduped: List[Tuple[int, int]] = []
    for line_idx, q_num in boundaries:
        if q_num not in seen_q_nums:
            seen_q_nums.add(q_num)
            deduped.append((line_idx, q_num))

    return deduped


def _get_section_for_line(line_idx: int, sections: List[str], lines: List[str]) -> Optional[str]:
    """Determine which section a given line belongs to."""
    if not sections:
        return None

    current_section = None
    for i in range(line_idx, -1, -1):
        line = lines[i]
        for pattern in SECTION_PATTERNS:
            match = pattern.match(line)
            if match:
                current_section = match.group(1).strip()
                return current_section
    return current_section


def _detect_marks(text: str) -> Optional[int]:
    """Try to extract marks from question text."""
    for pattern in MARKS_PATTERNS:
        match = pattern.search(text)
        if match:
            # For the NxM=total pattern, use the total
            groups = match.groups()
            return int(groups[-1])
    return None


def _detect_question_type(text: str, exam_type: str) -> Optional[str]:
    """Classify the question type."""
    text_lower = text.lower()

    # JEE Main / NEET are mostly MCQ
    if exam_type in ("jee_main", "neet"):
        if "numerical value" in text_lower or "integer type" in text_lower:
            return "Numerical"
        return "MCQ"

    # General detection
    if AR_PATTERN.search(text):
        return "Assertion-Reason"

    if MCQ_OPTION_PATTERN.search(text):
        return "MCQ"

    if any(kw in text_lower for kw in ["find the value", "calculate", "numerical"]):
        return "Numerical"

    return "Subjective"


def _split_or_alternative(text: str) -> Tuple[bool, Optional[str], str]:
    """Split question into main and OR alternative parts.

    Returns (has_or, or_alternative_text, main_text).
    """
    match = OR_PATTERN.search(text)
    if match:
        split_pos = match.start()
        main_text = text[:split_pos].strip()
        or_text = text[match.end():].strip()
        return True, or_text, main_text
    return False, None, text


def _extract_sub_parts(text: str) -> List[str]:
    """Extract sub-parts like (a), (b), (i), (ii) from question text."""
    # Pattern for sub-parts
    sub_pattern = re.compile(
        r"^\s*\(?([a-d]|[ivx]+)\)?\s*[\.\)]\s*(.+?)(?=\s*\(?[a-d]\)|$)",
        re.MULTILINE | re.IGNORECASE | re.DOTALL,
    )
    parts = sub_pattern.findall(text)
    return [part[1].strip() for part in parts if part[1].strip()]
