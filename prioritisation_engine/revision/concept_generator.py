"""
Conceptual Revision Tool — generates structured, concept-focused study notes.

PURE TEMPLATE approach — extracts everything from the syllabus Knowledge Base.
No API calls. No rate limits. Instant output. Works offline.

The KB already contains rich data per chapter:
  - Subtopics with detailed aliases (including formulas like F=ma, v=u+at)
  - Related chapters for cross-topic connections
  - Difficulty tiers
  - Parent units for grouping

Usage:
    gen = ConceptGenerator(exam="jee_main", subject="physics")
    plan = gen.generate_for_chapters(["Kinematics"])
    print(plan.to_markdown())
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from ..syllabus_kb import load_syllabus

logger = logging.getLogger(__name__)


# ─── Data Classes ────────────────────────────────────────────────────────

@dataclass
class FormulaEntry:
    """A formula extracted from KB aliases."""
    formula: str
    context: str  # which subtopic it belongs to


@dataclass
class SubtopicDetail:
    """A subtopic with its key terms."""
    name: str
    key_terms: List[str]


@dataclass
class ConceptNote:
    """Structured conceptual content for a single chapter."""
    chapter_id: str
    chapter_name: str
    parent_unit: str
    class_level: str
    difficulty: str

    subtopics: List[SubtopicDetail] = field(default_factory=list)
    key_formulas: List[FormulaEntry] = field(default_factory=list)
    key_concepts: List[str] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    connections: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "chapter_id": self.chapter_id,
            "chapter_name": self.chapter_name,
            "parent_unit": self.parent_unit,
            "class_level": self.class_level,
            "difficulty": self.difficulty,
            "subtopics": [{"name": s.name, "key_terms": s.key_terms} for s in self.subtopics],
            "key_formulas": [{"formula": f.formula, "context": f.context} for f in self.key_formulas],
            "key_concepts": self.key_concepts,
            "prerequisites": self.prerequisites,
            "connections": self.connections,
        }

    def to_markdown(self) -> str:
        lines = []
        lines.append(f"## 📖 {self.chapter_name}")
        lines.append(f"**Unit:** {self.parent_unit} | **Class:** {self.class_level} | **Difficulty:** {self.difficulty}")
        lines.append("")

        if self.subtopics:
            lines.append("### Topics to Cover")
            for st in self.subtopics:
                lines.append(f"**{st.name}**")
                if st.key_terms:
                    lines.append(f"  Key terms: {', '.join(st.key_terms)}")
                lines.append("")

        if self.key_formulas:
            lines.append("### Key Formulas & Equations")
            lines.append("| Formula | Used in |")
            lines.append("|---------|---------|")
            for f in self.key_formulas:
                lines.append(f"| `{f.formula}` | {f.context} |")
            lines.append("")

        if self.key_concepts:
            lines.append("### Key Concepts & Terminology")
            for i, c in enumerate(self.key_concepts, 1):
                lines.append(f"{i}. {c}")
            lines.append("")

        if self.prerequisites:
            lines.append("### Prerequisites")
            for p in self.prerequisites:
                lines.append(f"- Study **{p}** before this chapter")
            lines.append("")

        if self.connections:
            lines.append("### Connected Topics")
            for c in self.connections:
                lines.append(f"- 🔗 {c}")
            lines.append("")

        return "\n".join(lines)


@dataclass
class RevisionPlan:
    """Complete revision output for an exam-subject pair."""
    exam: str
    subject: str
    total_chapters: int
    generated_at: str
    concept_notes: List[ConceptNote] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "exam": self.exam,
            "subject": self.subject,
            "total_chapters": self.total_chapters,
            "generated_at": self.generated_at,
            "concept_notes": [n.to_dict() for n in self.concept_notes],
        }

    def to_markdown(self) -> str:
        lines = []
        lines.append(f"# 📚 Conceptual Revision: {self.exam.replace('_', ' ').upper()} — {self.subject.title()}")
        lines.append(f"*Generated on {self.generated_at} | {self.total_chapters} chapters*")
        lines.append("")
        lines.append("---")
        lines.append("")

        for note in self.concept_notes:
            lines.append(note.to_markdown())
            lines.append("---")
            lines.append("")

        return "\n".join(lines)


# ─── Concept Generator ──────────────────────────────────────────────────

class ConceptGenerator:
    """Generates conceptual revision notes purely from the syllabus KB.

    No API calls. No rate limits. Instant output.
    Works for physics, chemistry, maths, biology.
    """

    # Characters that indicate a formula in an alias
    _FORMULA_CHARS = set("=²³/∆Σ½√πωτφλμε∞")

    def __init__(self, exam: str, subject: str):
        self.exam = exam
        self.subject = subject
        self.syllabus = load_syllabus(exam, subject)
        self.chapters = self.syllabus.get("chapters", [])

        if isinstance(self.chapters, str):
            raise ValueError(f"{exam}/{subject} inherits from another KB.")

        # Exact name map
        self._chapter_map: Dict[str, dict] = {
            ch["name"].lower(): ch for ch in self.chapters
        }

        # Alias map — maps aliases & subtopic aliases to chapters
        # So "SHM" → Oscillations, "KTG" → Kinetic Theory of Gases, etc.
        self._alias_map: Dict[str, dict] = {}
        for ch in self.chapters:
            for alias in ch.get("aliases", []):
                self._alias_map[alias.lower()] = ch
            for st in ch.get("subtopics", []):
                for alias in st.get("aliases", []):
                    self._alias_map[alias.lower()] = ch

    def list_chapters(self) -> List[str]:
        return [ch["name"] for ch in self.chapters]

    def list_units(self) -> List[str]:
        units, seen = [], set()
        for ch in self.chapters:
            u = ch.get("parent_unit", "")
            if u and u not in seen:
                units.append(u)
                seen.add(u)
        return units

    def _find_chapter(self, query: str) -> Optional[dict]:
        """Find a chapter by name, alias, or partial match."""
        q = query.lower().strip()

        # 1. Exact chapter name
        if q in self._chapter_map:
            return self._chapter_map[q]

        # 2. Exact alias match (SHM, KTG, EMI, etc.)
        if q in self._alias_map:
            return self._alias_map[q]

        # 3. Partial match on chapter name (e.g., "optics" matches "Optics")
        for name, ch in self._chapter_map.items():
            if q in name or name in q:
                return ch

        # 4. Partial match on aliases
        for alias, ch in self._alias_map.items():
            if q in alias or alias in q:
                return ch

        return None

    def generate_for_chapters(self, chapter_names: List[str]) -> RevisionPlan:
        matched = []
        seen_ids = set()
        for name in chapter_names:
            ch = self._find_chapter(name)
            if ch and ch["id"] not in seen_ids:
                matched.append(ch)
                seen_ids.add(ch["id"])
            elif not ch:
                logger.warning(f"No match for '{name}'.")
                print(f"  [!] No match for '{name}' — skipping.")
        if not matched:
            raise ValueError(f"No matching chapters. Available: {', '.join(self.list_chapters()[:10])}...")
        return self._generate(matched)

    def generate_for_unit(self, unit_name: str) -> RevisionPlan:
        matched = [ch for ch in self.chapters if ch.get("parent_unit", "").lower() == unit_name.lower()]
        if not matched:
            raise ValueError(f"No chapters for unit '{unit_name}'.")
        return self._generate(matched)

    def generate_all(self) -> RevisionPlan:
        return self._generate(self.chapters)

    def _generate(self, chapters: List[dict]) -> RevisionPlan:
        plan = RevisionPlan(
            exam=self.exam,
            subject=self.subject,
            total_chapters=len(chapters),
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
        )

        for i, ch in enumerate(chapters):
            print(f"  [{i+1}/{len(chapters)}] {ch['name']}")
            plan.concept_notes.append(self._build_note(ch))

        print(f"\n  [OK] Generated {len(plan.concept_notes)} concept notes (instant, no API).")
        return plan

    def _build_note(self, chapter: dict) -> ConceptNote:
        """Build a full ConceptNote from KB data."""

        # 1. Subtopics with key terms
        subtopics = []
        for st in chapter.get("subtopics", []):
            # Filter out formula-like aliases, keep conceptual terms
            terms = [a for a in st.get("aliases", []) if not self._is_formula(a)]
            subtopics.append(SubtopicDetail(name=st["name"], key_terms=terms[:6]))

        # 2. Formulas extracted from aliases
        formulas = []
        for st in chapter.get("subtopics", []):
            for alias in st.get("aliases", []):
                if self._is_formula(alias):
                    formulas.append(FormulaEntry(formula=alias, context=st["name"]))

        # 3. Key concepts — chapter-level aliases (broader terms)
        key_concepts = chapter.get("aliases", [])

        # 4. Prerequisites — related chapters from same or lower class
        prerequisites = self._get_prerequisites(chapter)

        # 5. Connections — all related chapters
        connections = self._get_connections(chapter)

        return ConceptNote(
            chapter_id=chapter["id"],
            chapter_name=chapter["name"],
            parent_unit=chapter.get("parent_unit", ""),
            class_level=str(chapter.get("class", "")),
            difficulty=chapter.get("difficulty_tier", "medium").title(),
            subtopics=subtopics,
            key_formulas=formulas[:12],
            key_concepts=key_concepts,
            prerequisites=prerequisites,
            connections=connections,
        )

    def _is_formula(self, text: str) -> bool:
        """Check if an alias looks like a formula."""
        return any(c in self._FORMULA_CHARS for c in text) and len(text) < 30

    def _get_prerequisites(self, chapter: dict) -> List[str]:
        ch_class = chapter.get("class", 12)
        # Handle class being a list (e.g., [11, 12]) or int
        if isinstance(ch_class, list):
            ch_class = min(ch_class) if ch_class else 12
        prereqs = []
        for rid in chapter.get("related_chapters", []):
            for other in self.chapters:
                if other["id"] == rid:
                    other_class = other.get("class", 12)
                    if isinstance(other_class, list):
                        other_class = min(other_class) if other_class else 12
                    if other_class <= ch_class:
                        prereqs.append(other["name"])
        return prereqs

    def _get_connections(self, chapter: dict) -> List[str]:
        names = []
        for rid in chapter.get("related_chapters", []):
            for other in self.chapters:
                if other["id"] == rid:
                    names.append(other["name"])
        return names
