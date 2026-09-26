"use client";

import { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  SearchX,
  SlidersHorizontal,
  X
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import axiosInstance from "@/lib/axiosInstance";

export default function CatalogClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [seed, setSeed] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    const savedSeed = sessionStorage.getItem("catalogSeed");

    if (savedSeed) {
      setSeed(savedSeed);
    } else {
      const newSeed = Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem("catalogSeed", newSeed);
      setSeed(newSeed);
    }
  }, []);

  useEffect(() => {
    if (!seed) return;
    fetchProducts();
  }, [page, minPrice, maxPrice, seed]);

  async function fetchProducts() {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "24");
      params.set("seed", seed);

      if (minPrice) {
        params.set("minPrice", minPrice);
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }

      const { data } = await axiosInstance.get(
        `/general/catalog?${params.toString()}`
      );

      if (data.success) {
        setProducts(data.products || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch catalog:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function handleMinPrice(value) {
    setMinPrice(value);
    setPage(1);
  }

  function handleMaxPrice(value) {
    setMaxPrice(value);
    setPage(1);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setPage(1);

    const newSeed = Math.random().toString(36).substring(2, 12);
    sessionStorage.setItem("catalogSeed", newSeed);
    setSeed(newSeed);
  }

  function goToPage(newPage) {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    setPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getPageNumbers() {
    const total = pagination.totalPages;
    const current = pagination.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }

    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, "...", current - 1, current, current + 1, "...", total];
  }

  const hasActiveFilters = minPrice !== "" || maxPrice !== "";

  return (
    <div className="w-full bg-[#0a0a0a] text-neutral-100 min-h-screen selection:bg-white selection:text-black">
      {/* Compact Modern Header */}
      <section className="border-b border-neutral-800/80 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-2">
              <span>Rebel Watches</span>
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
              <span className="text-neutral-400">Catalog</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Shop All Watches
            </h1>
          </div>

          <div className="text-xs text-neutral-400 font-medium pb-1">
            Showing <span className="text-white font-semibold">{pagination.totalProducts}</span> authenticated timepieces
          </div>
        </div>
      </section>

      {/* Sleek Modern Filter Bar */}
      <section className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Price Filter Inputs */}
            <div className="flex items-center gap-2.5 flex-1 max-w-xl">
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 flex-1 focus-within:border-neutral-600 transition-colors">
                <span className="text-neutral-500 text-xs font-mono mr-2 select-none">Min</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => handleMinPrice(e.target.value)}
                  placeholder="Rs. 0"
                  className="w-full bg-transparent text-xs text-white placeholder:text-neutral-600 outline-none"
                />
              </div>

              <span className="text-neutral-600 text-xs">—</span>

              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 flex-1 focus-within:border-neutral-600 transition-colors">
                <span className="text-neutral-500 text-xs font-mono mr-2 select-none">Max</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => handleMaxPrice(e.target.value)}
                  placeholder="Rs. 10M"
                  className="w-full bg-transparent text-xs text-white placeholder:text-neutral-600 outline-none"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                  title="Clear filters"
                >
                  <X size={13} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>

            {/* Page info indicator */}
            {pagination.totalPages > 0 && (
              <div className="text-[11px] font-mono text-neutral-500 px-2">
                Page <span className="text-neutral-300">{pagination.currentPage}</span> of {pagination.totalPages}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Main Catalog Grid Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-[500px]">
        {loading ? (
          <CatalogSkeleton />
        ) : products.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.productId}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pagination Container */}
      {!loading && pagination.totalPages > 1 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-900/40 border border-neutral-800/80 p-2 rounded-2xl w-fit mx-auto backdrop-blur-md shadow-lg">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => goToPage(pagination.currentPage - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-25 disabled:pointer-events-none transition-all"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNumber, index) => {
                if (pageNumber === "...") {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="w-7 text-center text-neutral-600 font-mono text-xs select-none"
                    >
                      ...
                    </span>
                  );
                }

                const active = pageNumber === pagination.currentPage;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? "bg-neutral-100 text-black shadow-md scale-105"
                        : "border border-neutral-800/80 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => goToPage(pagination.currentPage + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-25 disabled:pointer-events-none transition-all"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl overflow-hidden animate-pulse shadow-sm"
        >
          <div className="aspect-square bg-neutral-800/50 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent" />
          </div>

          <div className="p-4 space-y-3">
            <div className="h-2.5 w-16 bg-neutral-800/80 rounded-full" />
            <div className="h-4 w-4/5 bg-neutral-800/80 rounded-lg" />

            <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between">
              <div className="h-4 w-20 bg-neutral-800/80 rounded-lg" />
              <div className="h-7 w-7 rounded-xl bg-neutral-800/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="py-20 px-4 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-5 shadow-inner">
        <SearchX size={24} strokeWidth={1.5} />
      </div>

      <h2 className="font-serif text-xl text-white font-bold tracking-tight">
        No watches found
      </h2>

      <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-light">
        No watches match this price range. Try clearing your filter criteria.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex items-center gap-2 bg-neutral-100 hover:bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
      >
        <RotateCcw size={13} />
        <span>Clear Price Filter</span>
      </button>
    </div>
  );
}