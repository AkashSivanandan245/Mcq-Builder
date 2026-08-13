# MCQ Builder

Upload a PDF, generate a multiple-choice quiz from its content using Gemini, take the quiz, and review scored results with explanations.

## Structure

```
backend/    FastAPI + PyMuPDF + Gemini
frontend/   React + TypeScript + Vite + Tailwind
```

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set `GEMINI_API_KEY=your_key`.

Run:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Opens at http://localhost:5173, calling the API at http://localhost:8000.

## Deployment (free tier)

**Backend → Render**
1. New → Blueprint → connect this repo (root `render.yaml` is auto-detected), or New → Web Service with root dir `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`.
2. Set env vars: `GEMINI_API_KEY` (your key), `ALLOWED_ORIGINS` (your Vercel URL, added after step below — comma-separate multiple origins).
3. Free plan spins down when idle; first request after idle takes ~30-50s to wake up.

**Frontend → Vercel**
1. New Project → import this repo → set root directory to `frontend`.
2. Framework preset: Vite (auto-detected). Build command `npm run build`, output `dist`.
3. Env var: `VITE_API_BASE` = your Render backend URL (e.g. `https://mcq-builder-api.onrender.com`).
4. Deploy, then go back to Render and set `ALLOWED_ORIGINS` to the resulting Vercel URL (e.g. `https://mcq-builder.vercel.app`), redeploy backend.

## Notes

- One Gemini call generates all requested questions in a single structured-JSON response.
- PDF text is cleaned (headers/footers/dedup) and capped/sampled before sending, to control token usage.
- Scoring is computed client-side from the stored answer key — no AI call after submission.
- Handles empty, corrupted, password-protected, and scanned (image-only) PDFs with clear errors.
