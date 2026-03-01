"""
Text extraction pipeline — converts PDF files (digital or scanned) into raw text.

Supports:
  - Born-digital PDFs via pdfplumber (direct text layer)
  - Scanned PDFs via pytesseract OCR (with image preprocessing)
  - Raw text passthrough
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger(__name__)


@dataclass
class PageText:
    """Text extracted from a single page."""
    page_number: int
    text: str
    source: str  # "digital" or "ocr"
    confidence: Optional[float] = None  # OCR confidence if applicable


@dataclass
class ExtractionResult:
    """Complete text extraction from a document."""
    source_path: str
    total_pages: int
    pages: List[PageText] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        """Concatenated text from all pages."""
        return "\n\n".join(p.text for p in self.pages if p.text.strip())

    @property
    def digital_page_count(self) -> int:
        return sum(1 for p in self.pages if p.source == "digital")

    @property
    def ocr_page_count(self) -> int:
        return sum(1 for p in self.pages if p.source == "ocr")


def extract_text_from_pdf(pdf_path: str | Path, ocr_fallback: bool = True) -> ExtractionResult:
    """Extract text from a PDF file.

    Strategy:
      1. Try pdfplumber first (fast, accurate for digital PDFs).
      2. If a page yields little/no text AND ocr_fallback is True,
         fall back to pytesseract OCR on that page's rendered image.

    Args:
        pdf_path: Path to the PDF file.
        ocr_fallback: Whether to use OCR for pages with no digital text.

    Returns:
        ExtractionResult with page-by-page text.
    """
    import pdfplumber

    pdf_path = Path(pdf_path)
    result = ExtractionResult(source_path=str(pdf_path), total_pages=0)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    try:
        with pdfplumber.open(pdf_path) as pdf:
            result.total_pages = len(pdf.pages)
            for i, page in enumerate(pdf.pages):
                page_num = i + 1
                text = page.extract_text() or ""

                # If digital text is too short, it's likely a scanned page
                if len(text.strip()) < 50 and ocr_fallback:
                    logger.info(f"Page {page_num}: sparse digital text, attempting OCR...")
                    ocr_text = _ocr_page(page, page_num)
                    if ocr_text:
                        result.pages.append(PageText(
                            page_number=page_num,
                            text=ocr_text,
                            source="ocr",
                        ))
                    else:
                        result.warnings.append(f"Page {page_num}: no text extracted (digital or OCR)")
                        result.pages.append(PageText(
                            page_number=page_num,
                            text=text,
                            source="digital",
                        ))
                else:
                    result.pages.append(PageText(
                        page_number=page_num,
                        text=text,
                        source="digital",
                    ))

    except Exception as e:
        logger.error(f"Failed to extract from {pdf_path}: {e}")
        raise

    logger.info(
        f"Extracted {result.total_pages} pages from {pdf_path.name}: "
        f"{result.digital_page_count} digital, {result.ocr_page_count} OCR"
    )
    return result


def _ocr_page(page, page_num: int) -> Optional[str]:
    """Run OCR on a single pdfplumber page.

    Renders the page to an image, preprocesses it, then runs Tesseract.
    """
    try:
        from PIL import Image, ImageFilter, ImageEnhance
        import pytesseract
    except ImportError as e:
        logger.warning(f"OCR dependencies not installed: {e}")
        return None

    from ..config import TESSERACT_CMD, OCR_DPI, OCR_LANG

    try:
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

        # Render page to image
        page_image = page.to_image(resolution=OCR_DPI)
        img = page_image.original  # PIL Image

        # Preprocessing pipeline for better OCR
        img = _preprocess_image(img)

        # Run OCR
        text = pytesseract.image_to_string(img, lang=OCR_LANG)
        return text.strip() if text else None

    except Exception as e:
        logger.warning(f"OCR failed on page {page_num}: {e}")
        return None


def _preprocess_image(img) -> "Image.Image":
    """Preprocess image for better OCR accuracy.

    Steps:
      1. Convert to grayscale
      2. Increase contrast
      3. Apply sharpening
      4. Binarise (threshold)
    """
    from PIL import ImageEnhance, ImageFilter

    # 1. Grayscale
    img = img.convert("L")

    # 2. Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)

    # 3. Sharpen
    img = img.filter(ImageFilter.SHARPEN)

    # 4. Binarise using a threshold
    threshold = 140
    img = img.point(lambda x: 255 if x > threshold else 0, "1")

    return img


def extract_text_from_string(raw_text: str, source_name: str = "raw_input") -> ExtractionResult:
    """Wrap a raw text string into an ExtractionResult for uniform downstream processing.

    Args:
        raw_text: The raw text content.
        source_name: A label for the source.

    Returns:
        ExtractionResult with a single page.
    """
    return ExtractionResult(
        source_path=source_name,
        total_pages=1,
        pages=[PageText(page_number=1, text=raw_text, source="digital")],
    )
