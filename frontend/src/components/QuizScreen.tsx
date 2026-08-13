import type { Question } from "../types";

interface Props {
  questions: Question[];
  current: number;
  answers: (number | null)[];
  onSelect: (optionIndex: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function QuizScreen({ questions, current, answers, onSelect, onPrev, onNext, onSubmit }: Props) {
  const question = questions[current];
  const selected = answers[current];
  const isLast = current === questions.length - 1;
  const answeredCount = answers.filter((a) => a !== null).length;
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-5">{question.q}</h2>
        <div className="flex flex-col gap-3">
          {question.a.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`text-left px-4 py-3 rounded-lg border transition-colors flex items-start gap-3 ${
                selected === idx
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
            >
              <span
                className={`flex-shrink-0 h-6 w-6 rounded-full border text-xs font-semibold flex items-center justify-center ${
                  selected === idx ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-300 text-slate-500"
                }`}
              >
                {letters[idx]}
              </span>
              <span className="text-slate-800">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrev}
          disabled={current === 0}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-400"
        >
          Previous
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
