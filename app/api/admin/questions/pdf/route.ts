import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, question_number, text")
    .order("question_number", { ascending: true });
  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }
  const questionsList = questions ?? [];
  const { data: answers } = questionsList.length
    ? await supabase
        .from("question_answers")
        .select("question_id, answer_text, weight, sort_order")
        .in("question_id", questionsList.map((q) => q.id))
        .order("sort_order", { ascending: true })
    : { data: [] };
  const byQid: Record<string, { answer_text: string; weight: number }[]> = {};
  for (const a of answers ?? []) {
    if (!byQid[a.question_id]) byQid[a.question_id] = [];
    byQid[a.question_id].push({ answer_text: a.answer_text, weight: a.weight });
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 20;
  let y = 20;
  const lineHeight = 6;
  const titleHeight = 10;

  doc.setFontSize(18);
  doc.text("What's the Word – Question Bank", 105, y, { align: "center" });
  y += titleHeight;

  if (questionsList.length === 0) {
    doc.setFontSize(12);
    doc.text("No questions in the bank yet.", 105, y, { align: "center" });
  } else {
    for (const q of questionsList) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`Question ${q.question_number}`, margin, y);
      y += lineHeight;
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(q.text, 170);
      doc.text(lines, margin, y);
      y += lines.length * lineHeight + 2;
      const ansList = byQid[q.id] ?? [];
      for (const a of ansList) {
        doc.setFontSize(10);
        doc.text(`  • ${a.answer_text} (${a.weight} pts)`, margin, y);
        y += lineHeight;
      }
      y += 4;
    }
  }

  const pdf = doc.output("arraybuffer");
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="whats-the-word-questions.pdf"',
      "Content-Length": String(pdf.byteLength),
    },
  });
}
