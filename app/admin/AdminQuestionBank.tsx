"use client";

import { useState } from "react";

const WEIGHTS = [25, 20, 15, 10, 5];

type QuestionRow = { id: string; question_number: number; text: string };
type AnswerRow = { id: string; answer_text: string; weight: number; sort_order: number };

export default function AdminQuestionBank({
  initialQuestions,
  initialAnswersByQuestion,
}: {
  initialQuestions: QuestionRow[];
  initialAnswersByQuestion: Record<string, AnswerRow[]>;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [answersByQuestion, setAnswersByQuestion] = useState(initialAnswersByQuestion);
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editAnswers, setEditAnswers] = useState(["", "", "", "", ""]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!text.trim()) {
      setError("Question text is required");
      return;
    }
    if (answers.some((a) => !a.trim())) {
      setError("All 5 answers are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), answers: answers.map((a) => a.trim()) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add question");
        return;
      }
      setQuestions((prev) => [
        ...prev,
        {
          id: data.id,
          question_number: data.question_number,
          text: data.text,
        },
      ]);
      setAnswersByQuestion((prev) => ({
        ...prev,
        [data.id]: (data.answers ?? []).map((a: AnswerRow, i: number) => ({
          id: a.id ?? `new-${i}`,
          answer_text: a.answer_text,
          weight: a.weight,
          sort_order: a.sort_order ?? i + 1,
        })),
      }));
      setText("");
      setAnswers(["", "", "", "", ""]);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(q: QuestionRow) {
    const ans = answersByQuestion[q.id];
    const sorted = ans ? [...ans].sort((a, b) => a.sort_order - b.sort_order) : [];
    setEditingId(q.id);
    setEditText(q.text);
    setEditAnswers(sorted.length === 5 ? sorted.map((a) => a.answer_text) : ["", "", "", "", ""]);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditError("");
    if (!editText.trim()) {
      setEditError("Question text is required");
      return;
    }
    if (editAnswers.some((a) => !a.trim())) {
      setEditError("All 5 answers are required");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editText.trim(),
          answers: editAnswers.map((a) => a.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update");
        return;
      }
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingId ? { ...q, text: data.text } : q))
      );
      setAnswersByQuestion((prev) => ({
        ...prev,
        [editingId]: (data.answers ?? []).map((a: AnswerRow, i: number) => ({
          id: a.id ?? `edit-${i}`,
          answer_text: a.answer_text,
          weight: a.weight,
          sort_order: a.sort_order ?? i + 1,
        })),
      }));
      setEditingId(null);
    } catch {
      setEditError("Something went wrong");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(q: QuestionRow) {
    if (!confirm(`Delete question #${q.question_number}?\n\n"${q.text}"`)) return;
    try {
      const res = await fetch(`/api/admin/questions/${q.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
      setAnswersByQuestion((prev) => {
        const next = { ...prev };
        delete next[q.id];
        return next;
      });
    } catch {
      alert("Something went wrong");
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Add question</h2>
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <label className="block text-muted text-sm">Question text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-accent/30 border-2 border-primary/50 text-white placeholder:text-muted focus:outline-none focus:border-primary font-mario"
            placeholder="Enter the question..."
            disabled={loading}
          />
          <label className="block text-muted text-sm">5 answers (weights 25, 20, 15, 10, 5)</label>
          <div className="space-y-2">
            {WEIGHTS.map((weight, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-muted w-8">{weight}</span>
                <input
                  type="text"
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-accent/30 border-2 border-primary/50 text-white placeholder:text-muted focus:outline-none focus:border-primary font-mario"
                  placeholder={`Answer ${i + 1}`}
                  disabled={loading}
                />
              </div>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-mario bg-primary text-white border-4 border-white/20 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add question"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Question bank</h2>
        {questions.length === 0 ? (
          <p className="text-muted">No questions yet. Add one above.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q) => (
              <li
                key={q.id}
                className="p-4 rounded-xl bg-accent/20 border border-primary/30"
              >
                {editingId === q.id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <label className="block text-muted text-sm">Question text</label>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 rounded-xl bg-accent/30 border-2 border-primary/50 text-white placeholder:text-muted focus:outline-none focus:border-primary font-mario text-sm"
                      disabled={editLoading}
                    />
                    <label className="block text-muted text-sm">5 answers</label>
                    <div className="space-y-2">
                      {WEIGHTS.map((weight, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-muted w-8 text-sm">{weight}</span>
                          <input
                            type="text"
                            value={editAnswers[i]}
                            onChange={(e) => {
                              const next = [...editAnswers];
                              next[i] = e.target.value;
                              setEditAnswers(next);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-accent/30 border border-primary/50 text-white text-sm font-mario"
                            disabled={editLoading}
                          />
                        </div>
                      ))}
                    </div>
                    {editError && <p className="text-red-400 text-sm">{editError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="btn-mario bg-primary text-white border-2 border-white/20 text-sm py-2 px-4 disabled:opacity-50"
                      >
                        {editLoading ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={editLoading}
                        className="btn-mario bg-muted/30 text-white border-2 border-white/20 text-sm py-2 px-4 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-primary font-bold">#{q.question_number}</span>
                        <span className="text-white ml-2">{q.text}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(q)}
                          className="px-3 py-1.5 rounded-lg bg-primary/80 text-white text-sm font-mario hover:bg-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q)}
                          className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-sm font-mario hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {answersByQuestion[q.id]?.length ? (
                      <ul className="mt-2 ml-4 text-muted text-sm space-y-1">
                        {answersByQuestion[q.id]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((a) => (
                            <li key={a.id}>
                              {a.answer_text} ({a.weight})
                            </li>
                          ))}
                      </ul>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
