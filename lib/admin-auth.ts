import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("wtw_auth")?.value;
  const session = await getSession(token);
  if (!session || session.mode !== "admin") {
    return null;
  }
  return session;
}
