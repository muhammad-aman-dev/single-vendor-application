export default function Loading() {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-200">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          {/* Breadcrumb */}
          <div className="mb-8 h-4 w-64 animate-pulse rounded bg-white/10" />
  
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square animate-pulse rounded-3xl bg-white/[0.05]" />
  
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-2xl bg-white/[0.05]"
                  />
                ))}
              </div>
            </div>
  
            {/* Product information */}
            <div className="lg:pt-4">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
  
              <div className="mt-5 h-12 w-4/5 animate-pulse rounded bg-white/10" />
  
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
              </div>
  
              <div className="my-8 h-px bg-white/10" />
  
              <div className="h-10 w-40 animate-pulse rounded bg-white/10" />
  
              <div className="mt-8 space-y-6">
                <div>
                  <div className="mb-3 h-4 w-20 animate-pulse rounded bg-white/10" />
  
                  <div className="flex gap-2">
                    <div className="h-11 w-20 animate-pulse rounded-xl bg-white/[0.06]" />
                    <div className="h-11 w-20 animate-pulse rounded-xl bg-white/[0.06]" />
                    <div className="h-11 w-20 animate-pulse rounded-xl bg-white/[0.06]" />
                  </div>
                </div>
  
                <div className="h-14 animate-pulse rounded-2xl bg-white/10" />
  
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-24 animate-pulse rounded-2xl bg-white/[0.05]" />
                  <div className="h-24 animate-pulse rounded-2xl bg-white/[0.05]" />
                  <div className="h-24 animate-pulse rounded-2xl bg-white/[0.05]" />
                </div>
              </div>
            </div>
          </div>
  
          {/* Lower content */}
          <div className="mt-20 border-t border-white/10 pt-12">
            <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
  
            <div className="mt-6 max-w-3xl space-y-3">
              <div className="h-4 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-4 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </main>
    );
  }