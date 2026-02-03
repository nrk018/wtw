import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";

const GAME_HASH = process.env.GAME_PASSWORD_HASH;

export async function POST(request: NextRequest) {
  if (!GAME_HASH) {
    return NextResponse.json(
      { error: "Game auth not configured" },
      { status: 500 }
    );
  }
  const body = await request.json();
  const password = body?.password?.trim();
  if (!password) {
    return NextResponse.json(
      { error: "Password required" },
      { status: 400 }
    );
  }
  const valid = verifyPassword(password, GAME_HASH);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = await createSession("game");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("wtw_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
