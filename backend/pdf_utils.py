import re
from collections import Counter

import fitz  # PyMuPDF

MAX_CHARS = 18000  # cap sent to Gemini to control token usage


class PDFError(Exception):
    pass


def extract_clean_text(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise PDFError("Could not open PDF. The file may be corrupted.")

    if doc.is_encrypted:
        if not doc.authenticate(""):
            raise PDFError("This PDF is password-protected. Please upload an unlocked PDF.")

    page_texts = []
    for page in doc:
        text = page.get_text("text")
        if text:
            page_texts.append(text)
    doc.close()

    if not page_texts:
        raise PDFError("No extractable text found. The PDF may be scanned/image-only.")

    # Detect repeated headers/footers: lines that appear on many pages
    line_counts = Counter()
    per_page_lines = []
    for text in page_texts:
        lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
        per_page_lines.append(lines)
        for ln in set(lines):
            if len(ln) < 80:
                line_counts[ln] += 1

    n_pages = len(page_texts)
    repeated = {
        ln for ln, cnt in line_counts.items()
        if n_pages > 2 and cnt >= max(3, int(n_pages * 0.6))
    }

    cleaned_lines = []
    seen_recent = []
    for lines in per_page_lines:
        for ln in lines:
            if ln in repeated:
                continue
            cleaned_lines.append(ln)

    cleaned = "\n".join(cleaned_lines)
    # collapse whitespace
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{2,}", "\n", cleaned)

    # dedupe consecutive duplicate paragraphs
    paras = cleaned.split("\n")
    deduped = []
    prev = None
    for p in paras:
        if p == prev:
            continue
        deduped.append(p)
        prev = p
    cleaned = "\n".join(deduped).strip()

    if len(cleaned) < 200:
        raise PDFError("Not enough readable text extracted from this PDF.")

    if len(cleaned) > MAX_CHARS:
        # Chunk selection: take evenly spaced slices across the doc to
        # keep coverage without sending everything (token efficiency).
        cleaned = _select_representative_slices(cleaned, MAX_CHARS)

    return cleaned


def _select_representative_slices(text: str, max_chars: int, n_slices: int = 6) -> str:
    slice_size = max_chars // n_slices
    length = len(text)
    if length <= max_chars:
        return text
    step = length / n_slices
    parts = []
    for i in range(n_slices):
        start = int(i * step)
        end = min(start + slice_size, length)
        parts.append(text[start:end])
    return "\n...\n".join(parts)
