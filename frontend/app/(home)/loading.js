function Skeleton({ className = "" }) {
    return (
      <div
        className={`bg-neutral-800/80 animate-pulse rounded ${className}`}
      />
    );
  }
  
  function ProductSkeleton() {
    return (
      <div className="space-y-3">
        {/* Product image */}
        <Skeleton className="aspect-square w-full rounded-xl" />
  
        {/* Product name */}
        <Skeleton className="h-4 w-3/4" />
  
        {/* Product subtitle */}
        <Skeleton className="h-3 w-1/2" />
  
        {/* Price */}
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }
  
  function ProductSectionSkeleton() {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-neutral-900/80">
        {/* Section heading */}
        <div className="mb-8 pb-4 border-b border-neutral-900 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-56" />
          </div>
  
          <Skeleton className="h-4 w-32" />
        </div>
  
        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }
  
  function AboutSkeleton() {
    return (
      <section className="w-full bg-neutral-900/40 border-y border-neutral-800/80 my-16 sm:my-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Image */}
            <div className="md:col-span-6">
              <Skeleton className="w-full h-80 sm:h-105 md:h-120 rounded-3xl" />
            </div>
  
            {/* Content */}
            <div className="md:col-span-6 space-y-7">
              <div className="space-y-3">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-10 w-3/4" />
              </div>
  
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
  
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
  
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  export default function Loading() {
    return (
      <main className="w-full min-h-screen bg-neutral-950 text-neutral-200">
        {/* =========================
            HERO
        ========================== */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-16 md:py-16">
          <div className="relative md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
            {/* Hero image */}
            <div className="w-full md:col-span-7 md:order-2">
              <Skeleton className="w-full aspect-[4/3] md:aspect-[16/10] rounded-3xl" />
            </div>
  
            {/* Hero text */}
            <div className="mt-8 md:mt-0 p-2 sm:p-4 md:p-0 md:order-1 md:col-span-5">
              <Skeleton className="h-3 w-36 mb-4" />
  
              <Skeleton className="h-10 sm:h-14 w-full max-w-md mb-3" />
              <Skeleton className="h-10 sm:h-14 w-4/5 max-w-md mb-6" />
  
              <div className="space-y-2 mb-8 max-w-md">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
  
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>
        </section>
  
        {/* =========================
            VALUE PROPS
        ========================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 border border-neutral-800 rounded-xl"
              >
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
  
                <div className="space-y-2 min-w-0">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </section>
  
        {/* =========================
            FEATURED
        ========================== */}
        <ProductSectionSkeleton />
  
        {/* =========================
            ABOUT
        ========================== */}
        <AboutSkeleton />
  
        {/* =========================
            LATEST
        ========================== */}
        <ProductSectionSkeleton />
  
        {/* =========================
            SALE
        ========================== */}
        <ProductSectionSkeleton />
      </main>
    );
  }