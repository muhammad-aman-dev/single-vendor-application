'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, ArrowRight, ShoppingBag } from "lucide-react";
import HeaderActions from "./HeaderActions";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const itemCount = useSelector((state) => state.cart?.itemCount || 0);

  const headerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
  };

  if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/admin") || pathname.startsWith("/forgot-password")) {
    return null;
  }

  return (
    <header ref={headerRef} className="w-full bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/80 sticky top-0 z-50 text-white shadow-2xl shadow-black/80">
      <div className="bg-neutral-900/40 hidden md:block border-b border-neutral-800/60 py-2 px-4 text-neutral-400 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-sans">
          <span className="flex items-center gap-2 text-neutral-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 inline-block animate-pulse shadow-sm shadow-neutral-400/80" />
            Nationwide delivery
          </span>
          <span className="text-neutral-300 font-semibold">Certified Authentic</span>
        </div>
      </div>

      {/* Reduced horizontal padding slightly on mobile (px-3 instead of px-4) to prevent overflow */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between relative gap-2">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
          className="lg:hidden text-neutral-300 hover:text-white p-2 rounded-xl border border-neutral-800/80 bg-neutral-900/50 focus:outline-none transition-all duration-300 active:scale-95 z-50 shrink-0"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center group py-1 relative shrink-0">
          {!logoError ? (
            /* Reduced mobile logo width from w-32 to w-28 to save space */
            <div className="relative w-28 sm:w-48 h-12 sm:h-20 flex items-center justify-center">
              <Image
                src="/Logo-Rebel-Watches.png"
                alt="Rebel Watches Emblem and Logo"
                fill
                priority
                sizes="(max-width: 640px) 112px, 160px"
                className="object-contain object-center sm:object-left contrast-125 brightness-125 scale-105 sm:scale-110 transition-transform duration-500 group-hover:scale-115 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-xl sm:text-3xl tracking-widest font-extrabold text-white uppercase leading-none group-hover:text-neutral-300 transition-colors">
                Rebel
              </h1>
              <span className="text-[8px] sm:text-[10px] tracking-[0.3em] text-neutral-400 uppercase block mt-0.5 font-sans">
                — Watches —
              </span>
            </div>
          )}
        </Link>

        <nav className="hidden lg:flex items-center space-x-10 text-[11px] tracking-[0.25em] font-bold uppercase font-sans text-neutral-300">
          <Link href="/" className="hover:text-white transition-colors py-1 nav-link">Home</Link>
          <Link href="/products" className="hover:text-white transition-colors py-1 nav-link">Products</Link>
          <Link href="/collections" className="hover:text-white transition-colors py-1 nav-link">Collections</Link>
          <Link href="/about" className="hover:text-white transition-colors py-1 nav-link">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors py-1 nav-link">Contact</Link>
        </nav>

        {/* Tightened button spacing on mobile (space-x-2 instead of space-x-3) */}
        <div className="flex items-center space-x-2 sm:space-x-5 shrink-0">
          <button 
            type="button" 
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search Products" 
            className="p-2 sm:p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/40 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all duration-300 active:scale-95"
          >
            <Search className="w-4 h-4 stroke-2" />
          </button>

          <HeaderActions />
          
          <Link 
            href="/cart" 
            aria-label="Shopping Cart" 
            className="p-2 sm:p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/40 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all duration-300 relative group active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 stroke-2" />
            <span className="absolute -top-2 -right-2 bg-neutral-100 text-neutral-950 text-[10px] sm:text-xs min-w-4 sm:min-w-5 h-4 sm:h-5 px-1 rounded-full flex items-center justify-center font-sans font-black shadow-lg shadow-black/60 ring-2 ring-neutral-950">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-neutral-950/95 backdrop-blur-2xl border-b border-neutral-800/80 shadow-2xl transition-all duration-300 ease-in-out z-40 ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="px-6 py-8 space-y-3 text-xs tracking-[0.25em] font-bold uppercase font-sans text-neutral-200">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3.5 border-b border-neutral-900/80 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3.5 border-b border-neutral-900/80 hover:text-white transition-colors"
          >
            Products
          </Link>
          <Link
            href="/collections"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3.5 border-b border-neutral-900/80 hover:text-white transition-colors"
          >
            Collections
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3.5 border-b border-neutral-900/80 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3.5 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-xl z-50 flex flex-col justify-start">
          <div className="bg-neutral-950/90 border-b border-neutral-800/80 w-full p-6 sm:p-12 shadow-2xl shadow-black">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  Search Timepieces
                </span>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-xl border border-neutral-800/80 bg-neutral-900/40 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH BY Name or Keyword..."
                  className="w-full bg-transparent border-b-2 border-neutral-700 py-4 pr-12 text-base sm:text-xl font-serif tracking-widest uppercase text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-300 transition-colors"
                />
                <button 
                  type="submit" 
                  className="absolute right-0 p-2 text-neutral-300 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setIsSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
