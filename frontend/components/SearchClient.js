"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  SearchX,
  ArrowLeft,
} from "lucide-react";

import ProductCard from "@/components/ProductCard";
import axiosInstance from "@/lib/axiosInstance";

const DEFAULT_PAGINATION = {
  currentPage: 1,
  totalPages: 0,
  totalProducts: 0,
  perPage: 24,
  hasNextPage: false,
  hasPreviousPage: false,
};

export default function SearchClient() {
  const searchParams = useSearchParams();

  const query = searchParams.get("query")?.trim() || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState(
    DEFAULT_PAGINATION
  );

  /*
   * Reset pagination whenever search query changes.
   */
  useEffect(() => {
    setPage(1);
  }, [query]);

  /*
   * Fetch search results.
   */
  useEffect(() => {
    if (!query) {
      setProducts([]);
      setPagination(DEFAULT_PAGINATION);
      setLoading(false);
      return;
    }

    fetchSearchResults();
  }, [query, page]);

  async function fetchSearchResults() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("query", query);
      params.set("page", page.toString());
      params.set("limit", "24");

      const { data } = await axiosInstance.get(
        `/general/search?${params.toString()}`
      );

      if (!data.success) {
        setProducts([]);
        setPagination(DEFAULT_PAGINATION);
        return;
      }

      setProducts(data.products || []);

      setPagination(
        data.pagination || DEFAULT_PAGINATION
      );
    } catch (error) {
      console.error(
        "Failed to fetch search results:",
        error
      );

      setProducts([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }

  function goToPage(newPage) {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages
    ) {
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
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    if (current <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        total,
      ];
    }

    if (current >= total - 3) {
      return [
        1,
        "...",
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1,
      "...",
      current - 1,
      current,
      current + 1,
      "...",
      total,
    ];
  }

  return (
    <div className="w-full bg-[#0a0a0a] text-neutral-100 min-h-screen selection:bg-white selection:text-black">

      {/* Header */}
      <section className="border-b border-neutral-800/80 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-2">
                <span>Rebel Watches</span>

                <span className="w-1 h-1 rounded-full bg-neutral-600" />

                <span className="text-neutral-400">
                  Search
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Results for &ldquo;
                <span className="text-neutral-300">
                  {query}
                </span>
                &rdquo;
              </h1>
            </div>

            {!loading && (
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

        {loading ? (
          <SearchSkeleton />
        ) : products.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={
                  product._id ||
                  product.productId
                }
                product={product}
              />
            ))}
          </div>
        )}

      </section>

      {/* Pagination */}
      {!loading &&
        pagination.totalPages > 1 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">

            <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-900/40 border border-neutral-800/80 p-2 rounded-2xl w-fit mx-auto backdrop-blur-md shadow-lg">

              {/* Previous */}
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  goToPage(
                    pagination.currentPage - 1
                  )
                }
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-25 disabled:pointer-events-none transition-all"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Numbers */}
              <div className="flex items-center gap-1">

                {getPageNumbers().map(
                  (pageNumber, index) => {

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

                    const active =
                      pageNumber ===
                      pagination.currentPage;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() =>
                          goToPage(pageNumber)
                        }
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? "bg-neutral-100 text-black shadow-md scale-105"
                            : "border border-neutral-800/80 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}

              </div>

              {/* Next */}
              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  goToPage(
                    pagination.currentPage + 1
                  )
                }
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

/*
|--------------------------------------------------------------------------
| Loading Skeleton
|--------------------------------------------------------------------------
*/

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

      {Array.from({ length: 8 }).map(
        (_, index) => (
          <div
            key={index}
            className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl overflow-hidden animate-pulse shadow-sm"
          >
            <div className="aspect-square bg-neutral-800/50 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-neutral-700/20 to-transparent" />
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
        )
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState({ query }) {
  return (
    <div className="py-20 px-4 text-center max-w-sm mx-auto">

      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-5 shadow-inner">
        <SearchX
          size={24}
          strokeWidth={1.5}
        />
      </div>

      <h2 className="font-serif text-xl text-white font-bold tracking-tight">
        {query
          ? "No matches found"
          : "Search for a timepiece"}
      </h2>

      <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-light">
        {query
          ? `We couldn't find any timepieces matching "${query}". Try checking your spelling or search terms.`
          : "Enter a product name, category, or keyword to search our collection."}
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