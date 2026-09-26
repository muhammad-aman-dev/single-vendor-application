"use client";

import Link from "next/link";
import { Mail, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/forgot-password")
  ) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();

    // Newsletter subscription logic can be added here later.

    setEmail("");
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 pt-16 pb-10 border-t border-neutral-800/80 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* TRUST FEATURES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-neutral-800/80 text-center md:text-left">

          <div className="flex flex-col md:flex-row items-center gap-4 group p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 hover:border-neutral-700 transition-all duration-300">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 group-hover:border-neutral-700 group-hover:text-white transition-colors shadow-lg shadow-black/40">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white font-sans">
                100% Authentic
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Guaranteed genuine timepieces
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 group p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 hover:border-neutral-700 transition-all duration-300">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 group-hover:border-neutral-700 group-hover:text-white transition-colors shadow-lg shadow-black/40">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white font-sans">
                Insured Shipping
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Express global dispatch
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 group p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 hover:border-neutral-700 transition-all duration-300">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 group-hover:border-neutral-700 group-hover:text-white transition-colors shadow-lg shadow-black/40">
              <RefreshCw className="w-5 h-5 stroke-[1.75]" />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white font-sans">
                2-Year Warranty
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Comprehensive movement coverage
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 group p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 hover:border-neutral-700 transition-all duration-300">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 group-hover:border-neutral-700 group-hover:text-white transition-colors shadow-lg shadow-black/40">
              <Mail className="w-5 h-5 stroke-[1.75]" />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white font-sans">
                Expert Support
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Dedicated horology advisors
              </p>
            </div>
          </div>
        </div>

        {/* MAIN FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-16 border-b border-neutral-800/80">

          {/* NEWSLETTER */}
          <div className="md:col-span-5 space-y-5">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-widest text-white">
              Rebel Watches
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm font-normal">
              Subscribe to receive private updates on rare arrivals, limited
              releases, and exclusive horological editorial content.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex max-w-md pt-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL ADDRESS"
                className="bg-neutral-900/60 text-xs text-white placeholder:text-neutral-600 px-4 py-3.5 border border-neutral-800/80 focus:outline-none focus:border-neutral-500 grow rounded-l-xl transition-colors tracking-wider uppercase font-sans min-w-0"
                required
              />

              <button
                type="submit"
                className="shimmer-button bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] px-6 py-3.5 rounded-r-xl active:scale-95 transition-all duration-300 font-sans shrink-0 shadow-lg shadow-black/40"
              >
                Join
              </button>
            </form>
          </div>

          {/* FOOTER LINKS */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">

            {/* COLLECTIONS */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-5 font-sans">
                Collections
              </h4>

              <ul className="space-y-3 text-xs text-neutral-400 font-medium">

                <li>
                  <Link
                    href="/collections/featured-articles"
                    className="hover:text-white transition-colors"
                  >
                    Featured Watches
                  </Link>
                </li>

                <li>
                  <Link
                    href="/collections/men-articles"
                    className="hover:text-white transition-colors"
                  >
                    Men's Watches
                  </Link>
                </li>

                <li>
                  <Link
                    href="/collections/women-articles"
                    className="hover:text-white transition-colors"
                  >
                    Women's Watches
                  </Link>
                </li>

                <li>
                  <Link
                    href="/products"
                    className="hover:text-white transition-colors"
                  >
                    All Timepieces
                  </Link>
                </li>

              </ul>
            </div>

            {/* REBEL */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-5 font-sans">
                Rebel
              </h4>

              <ul className="space-y-3 text-xs text-neutral-400 font-medium">

                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Rebel Watches
                  </Link>
                </li>

                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Concierge
                  </Link>
                </li>

                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    Our Story
                  </Link>
                </li>

                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    Authenticity
                  </Link>
                </li>

              </ul>
            </div>

            {/* CLIENT CARE */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-5 font-sans">
                Client Care
              </h4>

              <ul className="space-y-3 text-xs text-neutral-400 font-medium">

                <li className="text-neutral-500">
                  Secure Shopping
                </li>

                <li className="text-neutral-500">
                  Insured Delivery
                </li>

                <li className="text-neutral-500">
                  2-Year Warranty
                </li>

                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Expert Support
                  </Link>
                </li>

              </ul>
            </div>

          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-sans">

          <p>
            © {new Date().getFullYear()} Rebel Watches. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/about"
              className="hover:text-neutral-300 transition-colors"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="hover:text-neutral-300 transition-colors"
            >
              Contact
            </Link>

            <Link
              href="/sitemap.xml"
              className="hover:text-neutral-300 transition-colors"
            >
              Sitemap
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
