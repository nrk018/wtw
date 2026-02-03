import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("wtw_auth")?.value;
  const session = await getSession(token);
  const path = request.nextUrl.pathname;

  // Admin routes: require admin session
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!session || session.mode !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Game routes: require game session
  if (path.startsWith("/game") && !path.startsWith("/game/login")) {
    if (!session || session.mode !== "game") {
      return NextResponse.redirect(new URL("/game/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/game/:path*"],
};
