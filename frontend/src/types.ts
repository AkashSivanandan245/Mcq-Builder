export interface Question {
  q: string;
  a: string[];
  c: number;
  e: string;
}

export type AppState = "upload" | "quiz" | "results";
