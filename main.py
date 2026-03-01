"""
Main CLI / entry point for the Prioritisation Engine.

Provides a simple command-line interface to:
  - Extract text from a PDF
  - Segment questions
  - Classify topics
  - Generate priority report
  - Initialize the database
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("prioritisation_engine")


def _safe_print(text: str):
    """Print text safely on Windows consoles that may not support full Unicode."""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode("ascii", errors="replace").decode("ascii"))


def _ensure_parent(path: Path):
    """Ensure the parent directory of a file path exists."""
    path.parent.mkdir(parents=True, exist_ok=True)


def cmd_init_db(args):
    """Initialize the database and seed default data."""
    from prioritisation_engine.database.models import init_db, get_session, seed_exams, seed_topics_from_kb

    init_db()
    session = get_session()
    seed_exams(session)
    seed_topics_from_kb(session)
    session.close()
    print("[OK] Database initialised and seeded successfully.")


def cmd_extract(args):
    """Extract text from a PDF file."""
    from prioritisation_engine.extraction.extractor import extract_text_from_pdf

    result = extract_text_from_pdf(args.pdf_path, ocr_fallback=not args.no_ocr)

    if args.output:
        output_path = Path(args.output)
        _ensure_parent(output_path)
        output_path.write_text(result.full_text, encoding="utf-8")
        print(f"[OK] Extracted text saved to {output_path}")
    else:
        print(f"\n{'='*60}")
        print(f"Source: {result.source_path}")
        print(f"Pages: {result.total_pages} ({result.digital_page_count} digital, {result.ocr_page_count} OCR)")
        if result.warnings:
            print(f"Warnings: {', '.join(result.warnings)}")
        print(f"{'='*60}\n")
        print(result.full_text[:2000])
        if len(result.full_text) > 2000:
            print(f"\n... (truncated, total {len(result.full_text)} chars)")


def cmd_segment(args):
    """Segment extracted text into questions."""
    from prioritisation_engine.segmentation.segmenter import segment_questions

    text = Path(args.input).read_text(encoding="utf-8")
    result = segment_questions(text, exam_type=args.exam)

    print(f"\n[SEGMENT] Segmented {result.total_questions} questions")
    if result.sections:
        print(f"   Sections: {', '.join(result.sections)}")
    print()

    for q in result.questions:
        marks_str = f" [{q.marks}M]" if q.marks else ""
        type_str = f" ({q.question_type})" if q.question_type else ""
        section_str = f" [{q.section}]" if q.section else ""
        or_str = " [has OR]" if q.has_or_alternative else ""
        _safe_print(f"  Q{q.question_number}{section_str}{type_str}{marks_str}{or_str}")
        _safe_print(f"    {q.text[:120]}{'...' if len(q.text) > 120 else ''}")
        print()

    if args.output:
        output_data = {
            "total_questions": result.total_questions,
            "sections": result.sections,
            "questions": [
                {
                    "number": q.question_number,
                    "section": q.section,
                    "type": q.question_type,
                    "marks": q.marks,
                    "text": q.text,
                    "has_or": q.has_or_alternative,
                }
                for q in result.questions
            ],
        }
        output_path = Path(args.output)
        _ensure_parent(output_path)
        output_path.write_text(json.dumps(output_data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[OK] Segmentation saved to {args.output}")


def cmd_classify(args):
    """Classify segmented questions into topics."""
    from prioritisation_engine.classification.classifier import TopicClassifier
    from prioritisation_engine.segmentation.segmenter import Question

    # Load segmented questions
    data = json.loads(Path(args.input).read_text(encoding="utf-8"))

    classifier = TopicClassifier(
        exam=args.exam,
        subject=args.subject,
        strategy=args.strategy,
    )

    results = []
    total_q = len(data.get("questions", []))
    for i, q_data in enumerate(data.get("questions", [])):
        question = Question(
            question_number=q_data["number"],
            text=q_data["text"],
            section=q_data.get("section"),
            marks=q_data.get("marks"),
            question_type=q_data.get("type"),
        )

        try:
            result = classifier.classify(question)
        except Exception as e:
            logger.warning(f"Classification failed for Q{question.question_number}: {e}")
            # Fallback to alias matching
            from prioritisation_engine.classification.classifier import classify_by_alias_matching, ClassificationResult
            alias_hits = classify_by_alias_matching(question.text, args.exam, args.subject)
            result = ClassificationResult(
                question_number=question.question_number,
                question_text=question.text,
            )

        results.append(result)

        # Print result
        topics_str = ", ".join(
            f"{t.chapter_name} ({t.confidence:.0%})" for t in result.topics
        )
        _safe_print(f"  [{i+1}/{total_q}] Q{result.question_number}: {topics_str or 'No topics detected'}")

        # Rate limiting for free tier APIs (15 RPM = 1 every 4s)
        if i < total_q - 1 and args.strategy == "llm":
            import time
            time.sleep(4)

    if args.output:
        output_data = [
            {
                "question_number": r.question_number,
                "topics": [
                    {
                        "topic_id": t.topic_id,
                        "topic_name": t.topic_name,
                        "chapter": t.chapter_name,
                        "confidence": t.confidence,
                        "is_primary": t.is_primary,
                    }
                    for t in r.topics
                ],
            }
            for r in results
        ]
        output_path = Path(args.output)
        _ensure_parent(output_path)
        output_path.write_text(json.dumps(output_data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\n[OK] Classification saved to {args.output}")


def cmd_report(args):
    """Generate a priority report from a classification file."""
    from prioritisation_engine.scoring.scorer import PriorityScorer

    data = json.loads(Path(args.input).read_text(encoding="utf-8"))

    scorer = PriorityScorer(exam=args.exam, subject=args.subject)

    # Assume input is classification output with year info
    year = args.year or 2024
    questions_with_topics = []
    for item in data:
        topics = item.get("topics", [])
        marks = item.get("marks")
        questions_with_topics.append((item["question_number"], topics, marks))

    scorer.add_paper(year=year, questions_with_topics=questions_with_topics)
    report = scorer.compute()

    print(f"\n[REPORT] Priority Report: {report.exam} {report.subject}")
    print(f"   Papers: {report.total_papers} | Questions: {report.total_questions}")
    print(f"   Period: {report.year_range[0]}-{report.year_range[1]}")
    print()

    for tp in report.top_n(15):
        bar = "#" * int(tp.priority_score * 20)
        print(f"  #{tp.rank:2d}  {tp.topic_name:40s}  {tp.priority_score:.3f}  {bar}")

    if args.output:
        report_dict = report.to_dict()
        output_path = Path(args.output)
        _ensure_parent(output_path)
        output_path.write_text(json.dumps(report_dict, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\n[OK] Report saved to {args.output}")


def cmd_syllabus(args):
    """List syllabus topics for an exam-subject pair."""
    from prioritisation_engine.syllabus_kb import load_syllabus

    syllabus = load_syllabus(args.exam, args.subject)
    chapters = syllabus.get("chapters", [])

    if isinstance(chapters, str):
        print(f"[INFO] {args.exam}/{args.subject} inherits from another KB.")
        print(f"   {chapters}")
        return

    print(f"\n[SYLLABUS] {syllabus.get('exam', args.exam)} -- {syllabus.get('subject', args.subject)}")
    print(f"   {len(chapters)} chapters\n")

    for ch in chapters:
        aliases = ", ".join(ch.get("aliases", [])[:3])
        subtopics = len(ch.get("subtopics", []))
        print(f"  [{ch['id']}] {ch['name']}")
        print(f"         Unit: {ch.get('parent_unit', 'N/A')} | Class: {ch.get('class', 'N/A')} | Subtopics: {subtopics}")
        if aliases:
            print(f"         Aliases: {aliases}")
        print()


def cmd_revise(args):
    """Generate conceptual revision notes based on priority report."""
    from prioritisation_engine.revision.concept_generator import ConceptGenerator

    # Load the priority report
    data = json.loads(Path(args.input).read_text(encoding="utf-8"))

    exam = args.exam or data.get("exam", "")
    subject = args.subject or data.get("subject", "")

    if not exam or not subject:
        print("[ERROR] Could not determine exam/subject. Specify with -e and -s flags.")
        return

    gen = ConceptGenerator(exam=exam, subject=subject)

    # User-specified chapters override auto-selection
    if args.chapters:
        unique_chapters = args.chapters
        print(f"\n[REVISE] User-selected {len(unique_chapters)} topics:")
        for i, name in enumerate(unique_chapters, 1):
            print(f"  {i}. {name}")
    else:
        # Auto-select top-N from priority report
        topic_priorities = data.get("topic_priorities", [])
        if not topic_priorities:
            print("[ERROR] No topic priorities found. Use --chapters to pick manually.")
            return

        top_topics = topic_priorities[:args.top]
        chapter_names = [t.get("topic", t.get("chapter_name", "")) for t in top_topics]

        seen = set()
        unique_chapters = []
        for name in chapter_names:
            if name.lower() not in seen:
                unique_chapters.append(name)
                seen.add(name.lower())

        print(f"\n[REVISE] Auto-selected top {len(unique_chapters)} priority topics:")
        for i, name in enumerate(unique_chapters, 1):
            matching = next((t for t in top_topics if t.get("topic", t.get("chapter_name", "")) == name), {})
            score = matching.get("priority_score", 0)
            print(f"  {i}. {name} (priority: {score:.3f})")

    print()
    plan = gen.generate_for_chapters(unique_chapters)

    # Display output
    output_format = getattr(args, 'format', 'markdown')
    if output_format == 'json':
        output_text = json.dumps(plan.to_dict(), indent=2, ensure_ascii=False)
    else:
        output_text = plan.to_markdown()

    _safe_print(output_text)

    # Save to file if requested
    if args.output:
        output_path = Path(args.output)
        _ensure_parent(output_path)
        output_path.write_text(output_text, encoding="utf-8")
        print(f"\n[OK] Revision notes saved to {args.output}")


def main():
    parser = argparse.ArgumentParser(
        prog="prioritisation-engine",
        description="Prioritisation Engine -- Topic priority analysis for Indian competitive exams",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # init-db
    p_init = subparsers.add_parser("init-db", help="Initialize database and seed data")
    p_init.set_defaults(func=cmd_init_db)

    # extract
    p_extract = subparsers.add_parser("extract", help="Extract text from a PDF")
    p_extract.add_argument("pdf_path", help="Path to the PDF file")
    p_extract.add_argument("-o", "--output", help="Save to file instead of stdout")
    p_extract.add_argument("--no-ocr", action="store_true", help="Disable OCR fallback")
    p_extract.set_defaults(func=cmd_extract)

    # segment
    p_segment = subparsers.add_parser("segment", help="Segment text into questions")
    p_segment.add_argument("input", help="Path to extracted text file")
    p_segment.add_argument("-e", "--exam", default="auto", help="Exam type hint")
    p_segment.add_argument("-o", "--output", help="Save to JSON file")
    p_segment.set_defaults(func=cmd_segment)

    # classify
    p_classify = subparsers.add_parser("classify", help="Classify questions into topics")
    p_classify.add_argument("input", help="Path to segmented JSON")
    p_classify.add_argument("-e", "--exam", required=True, help="Exam (jee_main/neet/cbse)")
    p_classify.add_argument("-s", "--subject", required=True, help="Subject")
    p_classify.add_argument("--strategy", default="llm", choices=["llm", "embedding"], help="Classification strategy")
    p_classify.add_argument("-o", "--output", help="Save to JSON file")
    p_classify.set_defaults(func=cmd_classify)

    # report
    p_report = subparsers.add_parser("report", help="Generate priority report")
    p_report.add_argument("input", help="Path to classification JSON")
    p_report.add_argument("-e", "--exam", required=True, help="Exam")
    p_report.add_argument("-s", "--subject", required=True, help="Subject")
    p_report.add_argument("-y", "--year", type=int, help="Paper year (default: 2024)")
    p_report.add_argument("-o", "--output", help="Save report to JSON")
    p_report.set_defaults(func=cmd_report)

    # syllabus
    p_syllabus = subparsers.add_parser("syllabus", help="Browse syllabus topics")
    p_syllabus.add_argument("-e", "--exam", required=True, help="Exam")
    p_syllabus.add_argument("-s", "--subject", required=True, help="Subject")
    p_syllabus.set_defaults(func=cmd_syllabus)

    # revise
    p_revise = subparsers.add_parser("revise", help="Generate conceptual revision notes from priority report")
    p_revise.add_argument("input", help="Path to priority report JSON (output of 'report' command)")
    p_revise.add_argument("-e", "--exam", default="", help="Exam (auto-detected from report if omitted)")
    p_revise.add_argument("-s", "--subject", default="", help="Subject (auto-detected from report if omitted)")
    p_revise.add_argument("--top", type=int, default=5, help="Number of top-priority topics to revise (default: 5)")
    p_revise.add_argument("--chapters", nargs="+", help="Manually pick chapters (overrides auto-selection)")
    p_revise.add_argument("--format", choices=["markdown", "json"], default="markdown", help="Output format")
    p_revise.add_argument("-o", "--output", help="Save to file")
    p_revise.set_defaults(func=cmd_revise)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
