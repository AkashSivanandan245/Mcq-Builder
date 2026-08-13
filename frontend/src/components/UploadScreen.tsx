import { useRef, useState } from "react";

const COUNT_OPTIONS = [5, 10, 20, 30, 50];

interface Props {
  onGenerate: (file: File, numQuestions: number) => void;
  loading: boolean;
  error: string | null;
}

export default function UploadScreen({ onGenerate, loading, error }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      return;
    }
    setFile(f);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">MCQ Builder</h1>
        <p className="text-slate-500 mt-2">Upload a PDF and generate a multiple-choice quiz from its content.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white hover:border-indigo-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {file ? (
          <div>
            <p className="font-medium text-slate-800">{file.name}</p>
            <p className="text-sm text-slate-500 mt-1">{formatSize(file.size)}</p>
          </div>
        ) : (
          <div>
            <p className="font-medium text-slate-700">Drag & drop your PDF here</p>
            <p className="text-sm text-slate-500 mt-1">or click to browse</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Number of questions</label>
        <div className="flex gap-2 flex-wrap">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumQuestions(n)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                numQuestions === n
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={!file || loading}
        onClick={() => file && onGenerate(file, numQuestions)}
        className="mt-6 w-full rounded-lg bg-indigo-600 text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Generating quiz...
          </>
        ) : (
          "Generate Quiz"
        )}
      </button>
    </div>
  );
}
