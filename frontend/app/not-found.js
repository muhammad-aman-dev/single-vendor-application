import Link from "next/link";
import { Compass, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="w-full min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting effects matching your theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neutral-800/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-8">
        {/* Subtitle / Category Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800/80 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-neutral-400 animate-spin-slow" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            Error 404
          </span>
        </div>

        {/* Main Heading */}
        <div className="space-y-3">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Time <span className="text-neutral-400">Misplaced</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            The horological piece or page you are looking for has either been moved, archived, or does not exist in our collection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold tracking-[0.2em] uppercase px-7 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-black/50 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-neutral-900/60 hover:bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-800 text-xs font-bold tracking-[0.2em] uppercase px-7 py-4 rounded-xl transition-all duration-300 shadow-lg active:scale-95"
          >
            <Search className="w-4 h-4 text-neutral-400" />
            <span>Browse Catalog</span>
          </Link>
        </div>

        {/* Subtle Footer Brand Note */}
        <div className="pt-8 border-t border-neutral-900">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600 block">
            Rebel Watches — Precision Horology
          </span>
        </div>
      </div>
    </main>
  );
}