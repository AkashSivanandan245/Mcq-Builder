import json
import os
import re

import google.generativeai as genai

MODEL_NAME = "gemini-flash-latest"


class GeminiError(Exception):
    pass


def _get_model():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise GeminiError("Server missing GEMINI_API_KEY.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(MODEL_NAME)


PROMPT_TEMPLATE = """You generate multiple-choice quiz questions strictly from the SOURCE TEXT below. Do not use outside knowledge. Do not repeat similar questions.

Return ONLY valid JSON, no markdown fences, matching exactly this shape:
{{"questions":[{{"q":"question text","a":["opt A","opt B","opt C","opt D"],"c":0,"e":"short explanation of correct answer"}}]}}

Rules:
- Generate exactly {n} questions.
- Each question has exactly 4 options.
- "c" is the 0-based index (0-3) of the correct option.
- "e" is a 1-2 sentence explanation citing the source text, used to explain the correct answer.
- Questions must be answerable only from SOURCE TEXT.
- No duplicate or near-duplicate questions.
- No markdown, no extra keys, no commentary outside the JSON.

SOURCE TEXT:
{text}
"""


def generate_mcqs(text: str, n: int) -> list[dict]:
    model = _get_model()
    prompt = PROMPT_TEMPLATE.format(n=n, text=text)

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,
                "response_mime_type": "application/json",
            },
        )
    except Exception as e:
        raise GeminiError(f"Gemini request failed: {e}")

    raw = response.text if hasattr(response, "text") else None
    if not raw:
        raise GeminiError("Empty response from Gemini.")

    questions = _parse_and_validate(raw, n)
    return questions


def _parse_and_validate(raw: str, n: int) -> list[dict]:
    raw = raw.strip()
    # strip stray markdown fences if present
    raw = re.sub(r"^```(?:json)?", "", raw.strip())
    raw = re.sub(r"```$", "", raw.strip())

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise GeminiError("Gemini returned invalid JSON.")

    questions = data.get("questions") if isinstance(data, dict) else None
    if not isinstance(questions, list) or not questions:
        raise GeminiError("Gemini response missing questions array.")

    valid = []
    seen = set()
    for item in questions:
        if not isinstance(item, dict):
            continue
        q = item.get("q")
        a = item.get("a")
        c = item.get("c")
        e = item.get("e", "")
        if not isinstance(q, str) or not q.strip():
            continue
        if not isinstance(a, list) or len(a) != 4:
            continue
        if not all(isinstance(opt, str) and opt.strip() for opt in a):
            continue
        if not isinstance(c, int) or c < 0 or c > 3:
            continue
        key = q.strip().lower()
        if key in seen:
            continue
        seen.add(key)
        valid.append({
            "q": q.strip(),
            "a": [opt.strip() for opt in a],
            "c": c,
            "e": (e or "").strip() or "See source material.",
        })

    if len(valid) < n:
        raise GeminiError(
            f"Only {len(valid)} valid questions could be generated (requested {n})."
        )

    return valid[:n]
