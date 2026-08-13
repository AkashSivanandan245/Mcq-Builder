import type { Question } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function generateQuiz(file: File, numQuestions: number): Promise<Question[]> {
  const form = new FormData();
  form.append("file", file);
  form.append("num_questions", String(numQuestions));

  const res = await fetch(`${API_BASE}/api/generate-quiz`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Request failed (${res.status})`);
  }

  const data = await res.json();
  return data.questions as Question[];
}
