import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const WEIGHTS = [25, 20, 15, 10, 5] as const;

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, question_number, text, created_at")
    .order("question_number", { ascending: true });
  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }
  if (!questions?.length) {
    return NextResponse.json({ questions: [], answersByQuestion: {} });
  }
  const { data: answers, error: aErr } = await supabase
    .from("question_answers")
    .select("id, question_id, answer_text, weight, sort_order")
    .in("question_id", questions.map((q) => q.id))
    .order("sort_order", { ascending: true });
  if (aErr) {
    return NextResponse.json({ error: aErr.message }, { status: 500 });
  }
  const answersByQuestion: Record<string, typeof answers> = {};
  for (const a of answers ?? []) {
    if (!answersByQuestion[a.question_id]) answersByQuestion[a.question_id] = [];
    answersByQuestion[a.question_id].push(a);
  }
  return NextResponse.json({ questions, answersByQuestion });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const text = body?.text?.trim();
  const answersInput: string[] = body?.answers;
  if (!text || !Array.isArray(answersInput) || answersInput.length !== 5) {
    return NextResponse.json(
      { error: "Question text and exactly 5 answers required" },
      { status: 400 }
    );
  }
  const trimmed = answersInput.map((a: unknown) => String(a ?? "").trim());
  if (trimmed.some((a) => !a)) {
    return NextResponse.json(
      { error: "All 5 answers must be non-empty" },
      { status: 400 }
    );
  }

  const { data: nextNumRow } = await supabase
    .from("questions")
    .select("question_number")
    .order("question_number", { ascending: false })
    .limit(1)
    .single();
  const nextNumber = (nextNumRow?.question_number ?? 0) + 1;

  const { data: question, error: insertQ } = await supabase
    .from("questions")
    .insert({ question_number: nextNumber, text: text })
    .select("id")
    .single();
  if (insertQ || !question) {
    return NextResponse.json(
      { error: insertQ?.message ?? "Failed to create question" },
      { status: 500 }
    );
  }

  const rows = WEIGHTS.map((weight, i) => ({
    question_id: question.id,
    answer_text: trimmed[i],
    weight,
    sort_order: i + 1,
  }));
  const { data: insertedAnswers, error: insertA } = await supabase
    .from("question_answers")
    .insert(rows)
    .select("id, answer_text, weight, sort_order");
  if (insertA || !insertedAnswers?.length) {
    await supabase.from("questions").delete().eq("id", question.id);
    return NextResponse.json(
      { error: insertA?.message ?? "Failed to create answers" },
      { status: 500 }
    );
  }
  return NextResponse.json({
    id: question.id,
    question_number: nextNumber,
    text,
    answers: insertedAnswers,
  });
}
