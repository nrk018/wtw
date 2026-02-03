import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("wtw_auth")?.value;
  const session = await getSession(token);
  if (!session) {
    return NextResponse.json({ mode: null }, { status: 200 });
  }
  return NextResponse.json({ mode: session.mode });
}
