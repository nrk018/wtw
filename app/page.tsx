import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Mario-style background blocks */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-accent/30 rounded-t-[2rem]" />
        <div className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-xl rotate-12" />
        <div className="absolute top-32 right-16 w-12 h-12 bg-primary/20 rounded-lg -rotate-6" />
        <div className="absolute bottom-32 left-20 w-14 h-14 bg-accent/20 rounded-xl rotate-6" />
        <div className="absolute bottom-24 right-24 w-10 h-10 bg-primary/15 rounded-lg" />
      </div>

      <div className="relative z-10 text-center">
        {/* Title - Mario style big centered text */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white drop-shadow-lg mb-4 tracking-tight">
          What&apos;s the Word
        </h1>
        <p className="text-muted text-lg sm:text-xl mb-12">
          Pick a mode to get started
        </p>

        {/* Two buttons - Mario style */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/admin/login"
            className="btn-mario bg-primary text-white border-4 border-white/20 min-w-[200px] text-center"
          >
            Admin Login
          </Link>
          <Link
            href="/game/login"
            className="btn-mario bg-primary text-white border-4 border-white/20 min-w-[200px] text-center"
          >
            Game Login
          </Link>
        </div>
      </div>
    </main>
  );
}
