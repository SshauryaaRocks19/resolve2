"""
Syllabus Knowledge Base loader.

Loads and indexes the syllabus JSON files for fast topic lookup.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional


_KB_DIR = Path(__file__).resolve().parent


def load_syllabus(exam: str, subject: str) -> dict:
    """Load a single syllabus JSON file.

    Args:
        exam: One of 'jee_main', 'neet', 'cbse'.
        subject: One of 'physics', 'chemistry', 'maths', 'biology'.

    Returns:
        Parsed syllabus dict.

    Raises:
        FileNotFoundError: If the syllabus file does not exist.
    """
    path = _KB_DIR / exam / f"{subject}.json"
    if not path.exists():
        raise FileNotFoundError(f"Syllabus not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_all_syllabi() -> Dict[str, Dict[str, dict]]:
    """Load every available syllabus file.

    Returns:
        Nested dict  {exam: {subject: syllabus_data}}.
    """
    result: Dict[str, Dict[str, dict]] = {}
    for exam_dir in sorted(_KB_DIR.iterdir()):
        if not exam_dir.is_dir() or exam_dir.name.startswith("_"):
            continue
        exam_name = exam_dir.name
        result[exam_name] = {}
        for json_file in sorted(exam_dir.glob("*.json")):
            subject_name = json_file.stem
            with open(json_file, "r", encoding="utf-8") as f:
                result[exam_name][subject_name] = json.load(f)
    return result


def get_all_topic_names(exam: str, subject: str) -> List[str]:
    """Return a flat list of all chapter + subtopic names for an exam-subject pair.

    Useful for building prompts or embedding indices.
    """
    syllabus = load_syllabus(exam, subject)
    names: List[str] = []
    for chapter in syllabus.get("chapters", []):
        names.append(chapter["name"])
        for st in chapter.get("subtopics", []):
            names.append(st["name"])
    return names


def get_all_aliases(exam: str, subject: str) -> Dict[str, str]:
    """Return a mapping of every alias → canonical chapter/topic name.

    Useful for synonym resolution during classification.
    """
    syllabus = load_syllabus(exam, subject)
    alias_map: Dict[str, str] = {}
    for chapter in syllabus.get("chapters", []):
        canonical = chapter["name"]
        alias_map[canonical.lower()] = canonical
        for alias in chapter.get("aliases", []):
            alias_map[alias.lower()] = canonical
        for st in chapter.get("subtopics", []):
            sub_canonical = st["name"]
            alias_map[sub_canonical.lower()] = canonical
            for alias in st.get("aliases", []):
                alias_map[alias.lower()] = canonical
    return alias_map


def search_topics(query: str, exam: str, subject: str) -> List[dict]:
    """Search for topics matching a query string (case-insensitive substring match).

    Returns a list of matching chapter dicts.
    """
    syllabus = load_syllabus(exam, subject)
    query_lower = query.lower()
    matches: List[dict] = []
    for chapter in syllabus.get("chapters", []):
        # Check chapter name and aliases
        if query_lower in chapter["name"].lower():
            matches.append(chapter)
            continue
        if any(query_lower in a.lower() for a in chapter.get("aliases", [])):
            matches.append(chapter)
            continue
        # Check subtopics
        for st in chapter.get("subtopics", []):
            if query_lower in st["name"].lower() or any(
                query_lower in a.lower() for a in st.get("aliases", [])
            ):
                matches.append(chapter)
                break
    return matches
