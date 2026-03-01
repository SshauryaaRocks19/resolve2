"""
Priority Scoring System — computes composite priority scores for topics.

The priority score is a weighted combination of:
  1. Frequency Score — how often a topic appears across papers
  2. Marks Weightage — average marks allocated to the topic
  3. Recency Score — was it asked in recent exams?
  4. Trend Score — is it trending up or down over the years?
"""

from __future__ import annotations

import math
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

from ..config import PRIORITY_WEIGHTS, YEAR_RANGE_START, YEAR_RANGE_END

logger = logging.getLogger(__name__)


@dataclass
class TopicPriority:
    """Computed priority for a single topic."""
    topic_id: str
    topic_name: str
    chapter_name: str
    unit: Optional[str] = None

    # Raw metrics
    total_appearances: int = 0
    papers_appeared_in: int = 0
    total_papers_analysed: int = 0
    avg_marks: float = 0.0
    max_marks: int = 0
    year_wise_frequency: Dict[int, int] = field(default_factory=dict)

    # Normalised scores (0-1)
    frequency_score: float = 0.0
    marks_score: float = 0.0
    recency_score: float = 0.0
    trend_score: float = 0.0

    # Final composite
    priority_score: float = 0.0
    rank: int = 0

    @property
    def frequency_pct(self) -> str:
        if self.total_papers_analysed == 0:
            return "N/A"
        return f"{self.papers_appeared_in}/{self.total_papers_analysed}"

    @property
    def trend_label(self) -> str:
        if self.trend_score > 0.6:
            return "↑ rising"
        elif self.trend_score < 0.4:
            return "↓ declining"
        return "→ stable"


@dataclass
class PriorityReport:
    """Complete priority analysis for an exam-subject pair."""
    exam: str
    subject: str
    year_range: Tuple[int, int]
    total_papers: int
    total_questions: int
    topic_priorities: List[TopicPriority]

    def top_n(self, n: int = 10) -> List[TopicPriority]:
        return sorted(self.topic_priorities, key=lambda t: -t.priority_score)[:n]

    def to_dict(self) -> dict:
        """Convert report to JSON-serialisable dict."""
        return {
            "exam": self.exam,
            "subject": self.subject,
            "analysis_period": f"{self.year_range[0]}-{self.year_range[1]}",
            "papers_analysed": self.total_papers,
            "questions_analysed": self.total_questions,
            "topic_priorities": [
                {
                    "rank": tp.rank,
                    "topic": tp.topic_name,
                    "chapter": tp.chapter_name,
                    "unit": tp.unit,
                    "priority_score": round(tp.priority_score, 3),
                    "frequency": tp.frequency_pct,
                    "avg_marks": round(tp.avg_marks, 1),
                    "trend": tp.trend_label,
                    "year_wise": tp.year_wise_frequency,
                    "scores": {
                        "frequency": round(tp.frequency_score, 3),
                        "marks": round(tp.marks_score, 3),
                        "recency": round(tp.recency_score, 3),
                        "trend": round(tp.trend_score, 3),
                    },
                }
                for tp in sorted(self.topic_priorities, key=lambda t: -t.priority_score)
            ],
        }


class PriorityScorer:
    """Computes priority scores from classified question-topic data.

    Usage:
        scorer = PriorityScorer(exam="jee_main", subject="physics")
        scorer.add_paper(year=2024, shift="shift1", questions_with_topics=...)
        report = scorer.compute()
    """

    def __init__(
        self,
        exam: str,
        subject: str,
        weights: Optional[Dict[str, float]] = None,
    ):
        self.exam = exam
        self.subject = subject
        self.weights = weights or PRIORITY_WEIGHTS

        # Accumulators
        self._paper_count = 0
        self._question_count = 0
        self._topic_data: Dict[str, _TopicAccumulator] = defaultdict(_TopicAccumulator)

    def add_paper(
        self,
        year: int,
        questions_with_topics: List[Tuple[int, List[dict], Optional[int]]],
        paper_id: Optional[str] = None,
    ):
        """Register a paper's classified questions.

        Args:
            year: Year of the paper.
            questions_with_topics: List of (question_number, topic_matches, marks).
                Each topic_match is a dict with keys: topic_id, topic_name, chapter_name, confidence.
            paper_id: Optional identifier for the paper.
        """
        self._paper_count += 1
        topics_in_this_paper: set = set()

        for q_num, topic_matches, marks in questions_with_topics:
            self._question_count += 1
            for tm in topic_matches:
                tid = tm.get("topic_id", tm.get("chapter_name", "unknown"))
                acc = self._topic_data[tid]
                acc.topic_id = tid
                acc.topic_name = tm.get("topic_name", tid)
                acc.chapter_name = tm.get("chapter_name", tid)
                acc.unit = tm.get("unit")
                acc.total_appearances += 1
                if marks:
                    acc.marks_list.append(marks)
                acc.year_appearances.append(year)
                topics_in_this_paper.add(tid)

        # Track distinct papers per topic
        for tid in topics_in_this_paper:
            self._topic_data[tid].distinct_papers += 1

    def compute(self) -> PriorityReport:
        """Compute priority scores for all accumulated topic data.

        Returns:
            PriorityReport with ranked topics.
        """
        current_year = YEAR_RANGE_END
        topic_priorities: List[TopicPriority] = []

        # Compute raw scores for each topic
        for tid, acc in self._topic_data.items():
            tp = TopicPriority(
                topic_id=acc.topic_id,
                topic_name=acc.topic_name,
                chapter_name=acc.chapter_name,
                unit=acc.unit,
                total_appearances=acc.total_appearances,
                papers_appeared_in=acc.distinct_papers,
                total_papers_analysed=self._paper_count,
                avg_marks=sum(acc.marks_list) / len(acc.marks_list) if acc.marks_list else 0,
                max_marks=max(acc.marks_list) if acc.marks_list else 0,
                year_wise_frequency=_year_frequency(acc.year_appearances),
            )
            topic_priorities.append(tp)

        if not topic_priorities:
            return PriorityReport(
                exam=self.exam,
                subject=self.subject,
                year_range=(YEAR_RANGE_START, YEAR_RANGE_END),
                total_papers=self._paper_count,
                total_questions=self._question_count,
                topic_priorities=[],
            )

        # Normalise each score component
        _normalise_frequency(topic_priorities, self._paper_count)
        _normalise_marks(topic_priorities)
        _compute_recency(topic_priorities, current_year)
        _compute_trend(topic_priorities)

        # Composite score
        w = self.weights
        for tp in topic_priorities:
            tp.priority_score = (
                w["frequency"] * tp.frequency_score
                + w["marks_weightage"] * tp.marks_score
                + w["recency"] * tp.recency_score
                + w["trend"] * tp.trend_score
            )

        # Rank
        topic_priorities.sort(key=lambda t: -t.priority_score)
        for rank, tp in enumerate(topic_priorities, 1):
            tp.rank = rank

        report = PriorityReport(
            exam=self.exam,
            subject=self.subject,
            year_range=(YEAR_RANGE_START, YEAR_RANGE_END),
            total_papers=self._paper_count,
            total_questions=self._question_count,
            topic_priorities=topic_priorities,
        )

        logger.info(
            f"Priority report: {self.exam}/{self.subject} — "
            f"{len(topic_priorities)} topics ranked from {self._paper_count} papers"
        )
        return report


# ─── Internal Helpers ─────────────────────────────────────────────────────

class _TopicAccumulator:
    """Internal accumulator for raw topic data."""
    def __init__(self):
        self.topic_id: str = ""
        self.topic_name: str = ""
        self.chapter_name: str = ""
        self.unit: Optional[str] = None
        self.total_appearances: int = 0
        self.distinct_papers: int = 0
        self.marks_list: List[int] = []
        self.year_appearances: List[int] = []


def _year_frequency(years: List[int]) -> Dict[int, int]:
    """Convert a list of year appearances to a frequency dict."""
    freq: Dict[int, int] = {}
    for y in years:
        freq[y] = freq.get(y, 0) + 1
    return dict(sorted(freq.items()))


def _normalise_frequency(topics: List[TopicPriority], total_papers: int):
    """Normalise frequency score: papers_appeared_in / total_papers."""
    if total_papers == 0:
        return
    for tp in topics:
        tp.frequency_score = tp.papers_appeared_in / total_papers


def _normalise_marks(topics: List[TopicPriority]):
    """Normalise marks score relative to max observed marks."""
    max_avg = max((tp.avg_marks for tp in topics), default=1)
    if max_avg == 0:
        return
    for tp in topics:
        tp.marks_score = tp.avg_marks / max_avg


def _compute_recency(topics: List[TopicPriority], current_year: int):
    """Compute recency score using exponential decay.

    Score = Σ (1/2^(current_year - year)) for each year the topic appeared.
    Normalised to max possible score.
    """
    for tp in topics:
        if not tp.year_wise_frequency:
            tp.recency_score = 0.0
            continue

        raw = sum(
            1.0 / (2 ** (current_year - year))
            for year in tp.year_wise_frequency
        )
        # Max possible = all years present
        max_possible = sum(
            1.0 / (2 ** (current_year - y))
            for y in range(YEAR_RANGE_START, current_year + 1)
        )
        tp.recency_score = min(raw / max_possible, 1.0) if max_possible > 0 else 0.0


def _compute_trend(topics: List[TopicPriority]):
    """Compute trend score using simple linear regression on year vs frequency.

    Positive slope = rising trend (score > 0.5)
    Negative slope = declining trend (score < 0.5)
    Zero slope = stable (score = 0.5)
    """
    for tp in topics:
        years = sorted(tp.year_wise_frequency.keys())
        if len(years) < 2:
            tp.trend_score = 0.5  # Neutral
            continue

        # Simple linear regression: y = mx + b
        n = len(years)
        freqs = [tp.year_wise_frequency[y] for y in years]

        x_mean = sum(years) / n
        y_mean = sum(freqs) / n

        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(years, freqs))
        denominator = sum((x - x_mean) ** 2 for x in years)

        if denominator == 0:
            tp.trend_score = 0.5
            continue

        slope = numerator / denominator

        # Normalise slope to 0-1 range using sigmoid-like mapping
        # slope > 0 → score > 0.5 (rising)
        # slope < 0 → score < 0.5 (declining)
        tp.trend_score = 1.0 / (1.0 + math.exp(-slope * 2))
