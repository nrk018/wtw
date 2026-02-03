"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GameLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/game");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="text-muted hover:text-white transition-colors text-sm"
        >
          ← Back
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Game Login
        </h1>
        <p className="text-muted text-center mb-8">
          Enter the game host password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-accent/30 border-2 border-primary/50 text-white placeholder:text-muted focus:outline-none focus:border-primary font-mario"
            autoFocus
            disabled={loading}
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-mario w-full bg-primary text-white border-4 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
