import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from gemini_utils import GeminiError, generate_mcqs
from pdf_utils import PDFError, extract_clean_text

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_COUNTS = {5, 10, 20, 30, 50}

_default_origins = "http://localhost:5173"
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()
]

app = FastAPI(title="MCQ Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/generate-quiz")
async def generate_quiz(file: UploadFile = File(...), num_questions: int = Form(...)):
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    if num_questions not in ALLOWED_COUNTS:
        raise HTTPException(400, "Invalid question count.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(400, "Uploaded file is empty.")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Max size is 20MB.")

    try:
        text = extract_clean_text(file_bytes)
    except PDFError as e:
        raise HTTPException(422, str(e))

    try:
        questions = generate_mcqs(text, num_questions)
    except GeminiError as e:
        raise HTTPException(502, str(e))

    return {"questions": questions}
