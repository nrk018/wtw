import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set("wtw_auth", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
