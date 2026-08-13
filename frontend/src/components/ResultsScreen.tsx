import type { Question } from "../types";

interface Props {
  questions: Question[];
  answers: (number | null)[];
  onRetry: () => void;
  onNewQuiz: () => void;
}

const letters = ["A", "B", "C", "D"];

export default function ResultsScreen({ questions, answers, onRetry, onNewQuiz }: Props) {
  const correctCount = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.c ? 1 : 0),
    0
  );
  const percentage = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center mb-6">
        <p className="text-sm text-slate-500 mb-1">Your Score</p>
        <p className="text-4xl font-bold text-slate-900">
          {correctCount} / {questions.length}
        </p>
        <p className={`mt-1 text-lg font-medium ${percentage >= 60 ? "text-emerald-600" : "text-red-600"}`}>
          {percentage}%
        </p>

        <div className="flex gap-3 justify-center mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:border-slate-400"
          >
            Retry Same Quiz
          </button>
          <button
            type="button"
            onClick={onNewQuiz}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Generate New Quiz
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => {
          const selected = answers[i];
          const isCorrect = selected === q.c;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-medium text-slate-900">
                  {i + 1}. {q.q}
                </h3>
                <span
                  className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {q.a.map((option, idx) => {
                  const isSelected = selected === idx;
                  const isAnswer = q.c === idx;
                  let style = "border-slate-200 text-slate-700";
                  if (isAnswer) style = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  else if (isSelected && !isAnswer) style = "border-red-500 bg-red-50 text-red-800";

                  return (
                    <div key={idx} className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${style}`}>
                      <span className="font-semibold">{letters[idx]}.</span>
                      <span>{option}</span>
                      {isSelected && <span className="ml-auto text-xs italic">your answer</span>}
                      {isAnswer && !isSelected && <span className="ml-auto text-xs italic">correct answer</span>}
                    </div>
                  );
                })}
              </div>

              {!isCorrect && (
                <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-slate-700">Explanation: </span>
                  {q.e}
                </div>
              )}
              {selected === null && (
                <div className="mt-3 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  Not answered.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
