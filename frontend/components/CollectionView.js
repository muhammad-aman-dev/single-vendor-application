// components/CollectionView.jsx
import Link from "next/link";
import { PackageSearch, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function CollectionView({ type, title, products, pagination }) {
  const hasProducts = products.length > 0;

  return (
    <div className="w-full bg-[#0a0a0a] text-neutral-100 min-h-screen selection:bg-white selection:text-black">
      {/* Header */}
      <section className="border-b border-neutral-800/80 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-2">
                <span>Rebel Watches</span>
                <span className="w-1 h-1 rounded-full bg-neutral-600" />
                <span className="text-neutral-400">Collection</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {title}
              </h1>
            </div>

            {pagination && (
              <div className="text-xs text-neutral-400 font-medium pb-1">
                Found{" "}
                <span className="text-white font-semibold">
                  {pagination.totalProducts}
                </span>{" "}
                timepieces
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-125">
        {hasProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.productId} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState collectionTitle={title} />
        )}
      </section>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-900/40 border border-neutral-800/80 p-2 rounded-2xl w-fit mx-auto backdrop-blur-md shadow-lg">
            <PageLink
              disabled={!pagination.hasPreviousPage}
              type={type}
              page={pagination.currentPage - 1}
              ariaLabel="Previous Page"
            >
              <ChevronLeft size={16} />
            </PageLink>

            <div className="flex items-center gap-1">
              {getPageNumbers(pagination.currentPage, pagination.totalPages).map(
                (pageNumber, index) =>
                  pageNumber === "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="w-7 text-center text-neutral-600 font-mono text-xs select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <PageLink
                      key={pageNumber}
                      type={type}
                      page={pageNumber}
                      active={pageNumber === pagination.currentPage}
                    >
                      {pageNumber}
                    </PageLink>
                  )
              )}
            </div>

            <PageLink
              disabled={!pagination.hasNextPage}
              type={type}
              page={pagination.currentPage + 1}
              ariaLabel="Next Page"
            >
              <ChevronRight size={16} />
            </PageLink>
          </div>
        </section>
      )}
    </div>
  );
}

function PageLink({ type, page, active, disabled, ariaLabel, children }) {
  if (disabled) {
    return (
      <span
        aria-hidden="true"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-700 opacity-25"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`/collections/${type}?page=${page}`}
      aria-label={ariaLabel}
      scroll
      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
        active
          ? "bg-neutral-100 text-black shadow-md scale-105"
          : "border border-neutral-800/80 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/50"
      }`}
    >
      {children}
    </Link>
  );
}

function EmptyState({ collectionTitle }) {
  return (
    <div className="py-20 px-4 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-5 shadow-inner">
        <PackageSearch size={24} strokeWidth={1.5} />
      </div>
      <h2 className="font-serif text-xl text-white font-bold tracking-tight">
        No timepieces found
      </h2>
      <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-light">
        We couldn't find any timepieces in the {collectionTitle.toLowerCase()}.
        Try exploring another collection.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex items-center gap-2 bg-neutral-100 hover:bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
      >
        Browse Full Products
      </Link>
    </div>
  );
}