import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const WEIGHTS = [25, 20, 15, 10, 5] as const;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Question id required" }, { status: 400 });
  }
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Question id required" }, { status: 400 });
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

  const { error: updateQ } = await supabase
    .from("questions")
    .update({ text })
    .eq("id", id);
  if (updateQ) {
    return NextResponse.json({ error: updateQ.message }, { status: 500 });
  }

  const { error: deleteA } = await supabase
    .from("question_answers")
    .delete()
    .eq("question_id", id);
  if (deleteA) {
    return NextResponse.json({ error: deleteA.message }, { status: 500 });
  }

  const rows = WEIGHTS.map((weight, i) => ({
    question_id: id,
    answer_text: trimmed[i],
    weight,
    sort_order: i + 1,
  }));
  const { data: insertedAnswers, error: insertA } = await supabase
    .from("question_answers")
    .insert(rows)
    .select("id, answer_text, weight, sort_order");
  if (insertA || !insertedAnswers?.length) {
    return NextResponse.json(
      { error: insertA?.message ?? "Failed to update answers" },
      { status: 500 }
    );
  }
  return NextResponse.json({
    id,
    text,
    answers: insertedAnswers,
  });
}
