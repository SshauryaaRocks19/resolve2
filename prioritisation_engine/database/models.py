"""
Database models and schema — stores papers, questions, and topic classifications.

Uses SQLAlchemy ORM with SQLite for MVP, easily migratable to PostgreSQL.
"""

from __future__ import annotations

import datetime
import logging
from pathlib import Path
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    create_engine,
    Index,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Session,
    relationship,
    sessionmaker,
)

from ..config import DB_PATH, DB_ECHO

logger = logging.getLogger(__name__)


# ─── Base ─────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


# ─── Models ───────────────────────────────────────────────────────────────

class Exam(Base):
    """An exam type (JEE Main, NEET, CBSE)."""
    __tablename__ = "exams"

    id = Column(String(50), primary_key=True)         # e.g. "jee_main"
    name = Column(String(100), nullable=False)         # e.g. "JEE Main"
    exam_type = Column(String(50), nullable=False)     # "competitive" or "board"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    papers = relationship("Paper", back_populates="exam")


class Paper(Base):
    """A single exam paper."""
    __tablename__ = "papers"

    id = Column(String(100), primary_key=True)         # e.g. "jee_main_2024_jan_shift1"
    exam_id = Column(String(50), ForeignKey("exams.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(String(20))                         # "january", "april", etc.
    shift = Column(String(20))                         # "shift1", "shift2"
    subject = Column(String(50))                       # "physics", "chemistry", etc.
    source_url = Column(Text)
    source_file = Column(Text)                         # Path to original PDF
    total_questions = Column(Integer, default=0)
    is_processed = Column(Boolean, default=False)
    processed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    exam = relationship("Exam", back_populates="papers")
    questions = relationship("Question", back_populates="paper")

    __table_args__ = (
        Index("idx_paper_exam_year", "exam_id", "year"),
    )


class Question(Base):
    """A single question from a paper."""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String(100), ForeignKey("papers.id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    section = Column(String(50))
    text = Column(Text, nullable=False)
    marks = Column(Integer)
    question_type = Column(String(50))                 # "MCQ", "Numerical", "Subjective"
    has_or_alternative = Column(Boolean, default=False)
    or_alternative_text = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    paper = relationship("Paper", back_populates="questions")
    topic_classifications = relationship("QuestionTopic", back_populates="question")

    __table_args__ = (
        Index("idx_question_paper", "paper_id", "question_number"),
    )


class Topic(Base):
    """A syllabus topic (denormalised from KB for query convenience)."""
    __tablename__ = "topics"

    id = Column(String(100), primary_key=True)         # e.g. "jee_phy_012"
    exam = Column(String(50), nullable=False)
    subject = Column(String(50), nullable=False)
    chapter_name = Column(String(200), nullable=False)
    parent_unit = Column(String(200))
    class_level = Column(String(10))                   # "11", "12", "11,12"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    question_topics = relationship("QuestionTopic", back_populates="topic")

    __table_args__ = (
        Index("idx_topic_exam_subject", "exam", "subject"),
    )


class QuestionTopic(Base):
    """Many-to-many link between questions and topics (with confidence)."""
    __tablename__ = "question_topics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    topic_id = Column(String(100), ForeignKey("topics.id"), nullable=False)
    confidence = Column(Float, default=1.0)
    is_primary = Column(Boolean, default=True)
    classification_method = Column(String(50))         # "llm", "embedding", "alias"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    question = relationship("Question", back_populates="topic_classifications")
    topic = relationship("Topic", back_populates="question_topics")

    __table_args__ = (
        Index("idx_qt_question", "question_id"),
        Index("idx_qt_topic", "topic_id"),
    )


# ─── Database Initialization ─────────────────────────────────────────────

_engine = None
_SessionLocal = None


def init_db(db_path: Optional[str] = None) -> sessionmaker:
    """Initialize the database and create all tables.

    Args:
        db_path: Override path for the database file.

    Returns:
        A sessionmaker factory.
    """
    global _engine, _SessionLocal

    path = Path(db_path) if db_path else DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)

    _engine = create_engine(f"sqlite:///{path}", echo=DB_ECHO)
    Base.metadata.create_all(_engine)
    _SessionLocal = sessionmaker(bind=_engine)

    logger.info(f"Database initialized at {path}")
    return _SessionLocal


def get_session() -> Session:
    """Get a new database session."""
    if _SessionLocal is None:
        init_db()
    return _SessionLocal()


def seed_exams(session: Session):
    """Seed the exam table with default exams."""
    defaults = [
        Exam(id="jee_main", name="JEE Main", exam_type="competitive"),
        Exam(id="neet", name="NEET", exam_type="competitive"),
        Exam(id="cbse", name="CBSE Board", exam_type="board"),
    ]
    for exam in defaults:
        existing = session.get(Exam, exam.id)
        if not existing:
            session.add(exam)
    session.commit()
    logger.info("Seeded default exams")


def seed_topics_from_kb(session: Session):
    """Populate the topics table from the syllabus KB JSON files."""
    from ..syllabus_kb import load_all_syllabi

    syllabi = load_all_syllabi()
    count = 0
    for exam_name, subjects in syllabi.items():
        for subject_name, data in subjects.items():
            chapters = data.get("chapters", [])
            if isinstance(chapters, str):
                # Inherited KB files store a note string instead of actual chapters
                continue
            for chapter in chapters:
                topic = Topic(
                    id=chapter["id"],
                    exam=exam_name,
                    subject=subject_name,
                    chapter_name=chapter["name"],
                    parent_unit=chapter.get("parent_unit"),
                    class_level=str(chapter.get("class", "")),
                )
                existing = session.get(Topic, topic.id)
                if not existing:
                    session.add(topic)
                    count += 1
    session.commit()
    logger.info(f"Seeded {count} topics from syllabus KB")
