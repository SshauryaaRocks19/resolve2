"""
Topic Classification Engine — maps questions to syllabus topics.

Supports two strategies:
  1. LLM-based classification (via HuggingFace / OpenAI / Google API)
  2. Embedding similarity (via sentence-transformers, for offline/low-cost use)

The LLM strategy is recommended for accuracy; the embedding strategy is
recommended once you have enough labelled data to validate.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from ..segmentation.segmenter import Question
from ..syllabus_kb import load_syllabus, get_all_topic_names, get_all_aliases

logger = logging.getLogger(__name__)


@dataclass
class TopicMatch:
    """A single topic classification result."""
    topic_id: str
    topic_name: str
    chapter_name: str
    confidence: float  # 0.0 to 1.0
    is_primary: bool = True  # Is this the main topic (vs secondary topic)?


@dataclass
class ClassificationResult:
    """Classification result for a single question."""
    question_number: int
    question_text: str
    topics: List[TopicMatch] = field(default_factory=list)
    raw_llm_response: Optional[str] = None

    @property
    def primary_topic(self) -> Optional[TopicMatch]:
        primaries = [t for t in self.topics if t.is_primary]
        return primaries[0] if primaries else (self.topics[0] if self.topics else None)

    @property
    def topic_names(self) -> List[str]:
        return [t.chapter_name for t in self.topics]


class TopicClassifier:
    """Classifies questions into syllabus topics.

    Usage:
        classifier = TopicClassifier(exam="jee_main", subject="physics")
        result = classifier.classify(question)
    """

    def __init__(self, exam: str, subject: str, strategy: str = "llm"):
        """
        Args:
            exam: One of 'jee_main', 'neet', 'cbse'.
            subject: One of 'physics', 'chemistry', 'maths', 'biology'.
            strategy: Classification strategy — 'llm' or 'embedding'.
        """
        self.exam = exam
        self.subject = subject
        self.strategy = strategy

        # Load syllabus data
        self.syllabus = load_syllabus(exam, subject)
        self.topic_names = get_all_topic_names(exam, subject)
        self.alias_map = get_all_aliases(exam, subject)

        # Build chapter lookup
        self.chapters: Dict[str, dict] = {}
        for ch in self.syllabus.get("chapters", []):
            self.chapters[ch["id"]] = ch

        logger.info(
            f"TopicClassifier initialised: {exam}/{subject} "
            f"({len(self.chapters)} chapters, {len(self.topic_names)} topics, "
            f"{len(self.alias_map)} aliases, strategy={strategy})"
        )

    def classify(self, question: Question) -> ClassificationResult:
        """Classify a single question into one or more syllabus topics.

        Args:
            question: A segmented Question object.

        Returns:
            ClassificationResult with matched topics.
        """
        if self.strategy == "llm":
            return self._classify_with_llm(question)
        elif self.strategy == "embedding":
            return self._classify_with_embeddings(question)
        else:
            raise ValueError(f"Unknown classification strategy: {self.strategy}")

    def classify_batch(self, questions: List[Question]) -> List[ClassificationResult]:
        """Classify a batch of questions."""
        results = []
        for q in questions:
            try:
                result = self.classify(q)
                results.append(result)
            except Exception as e:
                logger.error(f"Classification failed for Q{q.question_number}: {e}")
                results.append(ClassificationResult(
                    question_number=q.question_number,
                    question_text=q.text,
                ))
        return results

    # ─── LLM-based Classification ─────────────────────────────────────────

    def _classify_with_llm(self, question: Question) -> ClassificationResult:
        """Use an LLM API to classify the question."""
        from ..config import LLM_PROVIDER, LLM_MODEL, LLM_API_KEY, CLASSIFICATION_CONFIDENCE_THRESHOLD

        # Build the prompt
        prompt = self._build_classification_prompt(question)

        # Call the appropriate LLM provider
        if LLM_PROVIDER == "huggingface":
            raw_response = self._call_huggingface(prompt, LLM_MODEL, LLM_API_KEY)
        elif LLM_PROVIDER == "openai":
            raw_response = self._call_openai(prompt, LLM_MODEL, LLM_API_KEY)
        elif LLM_PROVIDER == "google":
            raw_response = self._call_google(prompt, LLM_MODEL, LLM_API_KEY)
        else:
            raise ValueError(f"Unknown LLM provider: {LLM_PROVIDER}")

        # Parse the response
        topics = self._parse_llm_response(raw_response, CLASSIFICATION_CONFIDENCE_THRESHOLD)

        return ClassificationResult(
            question_number=question.question_number,
            question_text=question.text,
            topics=topics,
            raw_llm_response=raw_response,
        )

    def _build_classification_prompt(self, question: Question) -> str:
        """Build a structured prompt for the LLM."""
        # Get chapter names for the prompt
        chapter_list = "\n".join(
            f"  - {ch['name']} (ID: {ch['id']})"
            for ch in self.syllabus.get("chapters", [])
        )

        prompt = f"""You are a {self.subject} subject expert for the {self.exam.upper().replace('_', ' ')} exam.

Given the following question from a {self.exam.upper().replace('_', ' ')} {self.subject} paper, classify it into ONE OR MORE topics from the syllabus below.

SYLLABUS TOPICS:
{chapter_list}

QUESTION:
\"\"\"{question.text}\"\"\"

INSTRUCTIONS:
1. Identify ALL topics this question tests (often 1-3 topics).
2. Mark the MOST RELEVANT topic as primary.
3. Assign a confidence score (0.0-1.0) to each topic.
4. Respond ONLY in this exact JSON format, nothing else:

{{
  "topics": [
    {{"topic_id": "...", "topic_name": "...", "confidence": 0.95, "is_primary": true}},
    {{"topic_id": "...", "topic_name": "...", "confidence": 0.70, "is_primary": false}}
  ]
}}"""
        return prompt

    def _call_huggingface(self, prompt: str, model: str, api_key: str) -> str:
        """Call HuggingFace Inference API."""
        import requests

        if not api_key:
            raise ValueError("HuggingFace API key not set. Set LLM_API_KEY env var.")

        headers = {"Authorization": f"Bearer {api_key}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.1,
                "return_full_text": False,
            },
        }

        response = requests.post(
            f"https://api-inference.huggingface.co/models/{model}",
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "")
        return str(result)

    def _call_openai(self, prompt: str, model: str, api_key: str) -> str:
        """Call OpenAI API."""
        import requests

        if not api_key:
            raise ValueError("OpenAI API key not set. Set LLM_API_KEY env var.")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 500,
        }

        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

        result = response.json()
        return result["choices"][0]["message"]["content"]

    def _call_google(self, prompt: str, model: str, api_key: str) -> str:
        """Call Google Gemini API with retry logic for rate limits."""
        import requests
        import time

        if not api_key:
            raise ValueError("Google API key not set. Set LLM_API_KEY env var.")

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 500},
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        max_retries = 5
        for attempt in range(max_retries):
            response = requests.post(url, json=payload, timeout=30)

            if response.status_code == 429:
                wait_time = 2 ** (attempt + 2)  # 4, 8, 16, 32, 64 seconds
                logger.warning(f"Rate limited (429). Retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue

            response.raise_for_status()
            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"]

        raise RuntimeError(f"Google API rate limit exceeded after {max_retries} retries")

    def _parse_llm_response(self, raw_response: str, threshold: float) -> List[TopicMatch]:
        """Parse the JSON response from the LLM."""
        topics: List[TopicMatch] = []

        try:
            # Try to find JSON in the response
            json_start = raw_response.find("{")
            json_end = raw_response.rfind("}") + 1
            if json_start == -1 or json_end == 0:
                logger.warning(f"No JSON found in LLM response: {raw_response[:200]}")
                return topics

            json_str = raw_response[json_start:json_end]
            data = json.loads(json_str)

            for t in data.get("topics", []):
                confidence = float(t.get("confidence", 0))
                if confidence >= threshold:
                    topic_id = t.get("topic_id", "")
                    topic_name = t.get("topic_name", "")

                    # Resolve to chapter name if possible
                    chapter_name = topic_name
                    if topic_id in self.chapters:
                        chapter_name = self.chapters[topic_id]["name"]

                    topics.append(TopicMatch(
                        topic_id=topic_id,
                        topic_name=topic_name,
                        chapter_name=chapter_name,
                        confidence=confidence,
                        is_primary=t.get("is_primary", False),
                    ))

        except (json.JSONDecodeError, KeyError, IndexError) as e:
            logger.warning(f"Failed to parse LLM response: {e}")

        return topics

    # ─── Embedding-based Classification ───────────────────────────────────

    def _classify_with_embeddings(self, question: Question) -> ClassificationResult:
        """Use sentence embeddings + cosine similarity for classification."""
        # Lazy-load the model on first call
        if not hasattr(self, "_embedding_model"):
            try:
                from sentence_transformers import SentenceTransformer, util as st_util
                import torch as _torch
            except ImportError:
                raise ImportError(
                    "sentence-transformers is required for embedding classification. "
                    "Install with: pip install sentence-transformers"
                )

            self._st_util = st_util
            self._torch = _torch
            self._embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

            # Pre-compute topic embeddings
            topic_texts = []
            topic_ids = []
            for ch in self.syllabus.get("chapters", []):
                # Combine name + aliases for richer embedding
                combined = ch["name"] + ". " + ", ".join(ch.get("aliases", []))
                topic_texts.append(combined)
                topic_ids.append(ch["id"])
            self._topic_embeddings = self._embedding_model.encode(
                topic_texts, convert_to_tensor=True
            )
            self._topic_ids = topic_ids
            self._topic_texts = topic_texts

        # Encode the question
        q_embedding = self._embedding_model.encode(
            question.text, convert_to_tensor=True
        )

        # Compute cosine similarities
        similarities = self._st_util.cos_sim(q_embedding, self._topic_embeddings)[0]

        # Embedding cosine similarity scores are typically 0.15-0.50 for this model
        EMBEDDING_THRESHOLD = 0.25

        # Get top-K topics
        topics: List[TopicMatch] = []
        top_k = min(3, len(self._topic_ids))
        top_indices = self._torch.topk(similarities, k=top_k).indices.tolist()

        for rank, idx in enumerate(top_indices):
            score = float(similarities[idx])
            chapter = self.chapters[self._topic_ids[idx]]

            # Always include top-1 match; for rank 2-3 apply threshold
            if rank == 0 or score >= EMBEDDING_THRESHOLD:
                topics.append(TopicMatch(
                    topic_id=self._topic_ids[idx],
                    topic_name=chapter["name"],
                    chapter_name=chapter["name"],
                    confidence=score,
                    is_primary=(rank == 0),
                ))

            if rank == 0:
                logger.debug(
                    f"Q{question.question_number} top match: "
                    f"{chapter['name']} (score={score:.3f})"
                )

        return ClassificationResult(
            question_number=question.question_number,
            question_text=question.text,
            topics=topics,
        )


# ─── Standalone alias-matching fallback ──────────────────────────────────

def classify_by_alias_matching(
    question_text: str,
    exam: str,
    subject: str,
) -> List[Tuple[str, int]]:
    """Simple keyword/alias matching fallback.

    Returns a list of (chapter_name, match_count) sorted by count descending.
    Not recommended as primary classifier but useful as a baseline.
    """
    alias_map = get_all_aliases(exam, subject)
    text_lower = question_text.lower()

    chapter_hits: Dict[str, int] = {}
    for alias, canonical_chapter in alias_map.items():
        if alias in text_lower:
            chapter_hits[canonical_chapter] = chapter_hits.get(canonical_chapter, 0) + 1

    return sorted(chapter_hits.items(), key=lambda x: -x[1])
