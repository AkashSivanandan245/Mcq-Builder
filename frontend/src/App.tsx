import { useState } from "react";
import { generateQuiz } from "./api";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import UploadScreen from "./components/UploadScreen";
import type { AppState, Question } from "./types";

export default function App() {
  const [state, setState] = useState<AppState>("upload");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (file: File, numQuestions: number) => {
    setLoading(true);
    setError(null);
    try {
      const qs = await generateQuiz(file, numQuestions);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      setCurrent(0);
      setState("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
  };

  const handleRetry = () => {
    setAnswers(new Array(questions.length).fill(null));
    setCurrent(0);
    setState("quiz");
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setError(null);
    setState("upload");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {state === "upload" && (
        <UploadScreen onGenerate={handleGenerate} loading={loading} error={error} />
      )}
      {state === "quiz" && (
        <QuizScreen
          questions={questions}
          current={current}
          answers={answers}
          onSelect={handleSelect}
          onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
          onNext={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
          onSubmit={() => setState("results")}
        />
      )}
      {state === "results" && (
        <ResultsScreen
          questions={questions}
          answers={answers}
          onRetry={handleRetry}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  );
}
