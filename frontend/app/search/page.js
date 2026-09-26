import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeletonShell />}>
      <SearchClient />
    </Suspense>
  );
}

function SearchSkeletonShell() {
  return (
    <div className="w-full bg-[#0a0a0a] text-neutral-100 min-h-screen px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto animate-pulse space-y-8">
        <div className="h-8 w-48 bg-neutral-900 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl h-80" />
          ))}
        </div>
      </div>
    </div>
  );
}