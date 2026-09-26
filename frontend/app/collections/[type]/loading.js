export default function Loading() {
  return (
    <main className="w-full min-h-screen bg-[#0a0a0a] text-neutral-100 px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-neutral-900 rounded-xl" />

        <div className="h-8 w-64 bg-neutral-900 rounded-xl" />

        <div className="h-4 w-full max-w-2xl bg-neutral-900 rounded-xl" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-80 rounded-2xl border border-neutral-800/80 bg-neutral-900/40"
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}
