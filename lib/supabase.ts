import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

export type Question = {
  id: string;
  question_number: number;
  text: string;
  created_at: string;
};

export type QuestionAnswer = {
  id: string;
  question_id: string;
  answer_text: string;
  weight: number;
  sort_order: number;
};

export type QuestionWithAnswers = Question & { answers: QuestionAnswer[] };
