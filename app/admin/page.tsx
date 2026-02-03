import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AdminQuestionBank from "./AdminQuestionBank";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("wtw_auth")?.value;
  const session = await getSession(token);
  if (!session || session.mode !== "admin") {
    redirect("/admin/login");
  }

  let questions: { id: string; question_number: number; text: string }[] = [];
  let answersByQuestion: Record<string, { id: string; answer_text: string; weight: number; sort_order: number }[]> = {};
  try {
    const { data: q } = await supabase
      .from("questions")
      .select("id, question_number, text")
      .order("question_number", { ascending: true });
    questions = q ?? [];
    if (questions.length) {
      const { data: ans } = await supabase
        .from("question_answers")
        .select("id, question_id, answer_text, weight, sort_order")
        .in("question_id", questions.map((r) => r.id))
        .order("sort_order", { ascending: true });
      for (const a of ans ?? []) {
        if (!answersByQuestion[a.question_id]) answersByQuestion[a.question_id] = [];
        answersByQuestion[a.question_id].push(a);
      }
    }
  } catch {
    // Supabase not configured or tables missing
  }

  return (
    <main className="min-h-screen bg-dark p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Admin – Question Bank</h1>
        <div className="flex items-center gap-4">
          <a
            href="/api/admin/questions/pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-mario bg-accent text-white border-4 border-white/20 text-sm py-2 px-4"
          >
            Download PDF
          </a>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-muted hover:text-white transition-colors text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <AdminQuestionBank
        initialQuestions={questions}
        initialAnswersByQuestion={answersByQuestion}
      />
    </main>
  );
}
