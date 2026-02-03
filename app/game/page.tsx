import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

export default async function GameDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("wtw_auth")?.value;
  const session = await getSession(token);
  if (!session || session.mode !== "game") {
    redirect("/game/login");
  }

  return (
    <main className="min-h-screen bg-dark p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Game</h1>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-muted hover:text-white transition-colors text-sm"
          >
            Logout
          </button>
        </form>
      </header>
      <p className="text-muted">New match / Resume and tournament flow will go here.</p>
    </main>
  );
}
