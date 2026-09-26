import Link from "next/link";
import { ShieldCheck, Clock, Award, Compass, Sparkles, CheckCircle2 } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rebelwatches.com";

export const metadata = {
  title: "About Rebel Watches | Curated Luxury & Precision Timepieces",
  description: "Discover the story behind Rebel Watches. We curate the finest handcrafted luxury, automatic, and classic wristpieces for those who define their own time.",
  keywords: "about rebel watches, luxury watch brand, handcrafted timepieces, automatic watches story, premium wristwatches",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About Rebel Watches | Curated Luxury & Precision Timepieces",
    description: "Discover the story behind Rebel Watches. Curating exceptional craftsmanship and luxury timepieces.",
    url: `${SITE_URL}/about`,
    siteName: "Rebel Watches",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "About Rebel Watches",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Rebel Watches | Curated Luxury & Precision Timepieces",
    description: "Discover the story behind Rebel Watches. Curating exceptional craftsmanship.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function AboutPage() {
  // JSON-LD Structured Data Schema for Organization / AboutPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Rebel Watches",
    description: "Learn about Rebel Watches, our mission, and our dedication to curating world-class luxury timepieces.",
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "Rebel Watches",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: [],
      description: "Purveyor of curated luxury, automatic, and classic wristwatches.",
    },
  };

  return (
    <>
      {/* Inject JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="w-full bg-neutral-950 text-neutral-200 min-h-screen selection:bg-neutral-800 selection:text-white font-sans">
        
        {/* Hero Section with Background Image & Dark Filter */}
        <section className="relative w-full py-28 sm:py-36 overflow-hidden border-b border-neutral-900">
          {/* Background Image */}
          <img
            src="/about-image.jpg" 
            alt="About Rebel Watches Hero"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-75 scale-105"
          />
          {/* Dark Overlay Filter */}
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-xs" />

          {/* Header Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-300">
                The Rebel Philosophy
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Redefining Elegance, <span className="text-neutral-300 font-serif italic">One Second</span> at a Time
            </h1>

            <p className="font-sans text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              We don’t just sell timepieces; we curate statements of character. Built for those who defy convention and command their own legacy.
            </p>
          </div>
        </section>

        {/* Main Content Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-24">
          
          {/* Section 1: Our Story / Brand Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-300">
                <Compass className="w-4 h-4" />
                <span>Our Heritage</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide leading-snug">
                Crafted for the Bold, Refined for the Connoisseur
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Founded with a rebellious spirit against ordinary accessories, <strong className="text-white font-semibold">Rebel Watches</strong> emerged from a singular obsession: bridging uncompromising Swiss-inspired mechanical precision with modern, dark-aesthetic luxury. 
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Every timepiece in our catalog undergoes rigorous curation and inspection. Whether you are seeking skeleton automatics or sleek minimalist dress pieces, our collections are handpicked to match moments of milestone success and everyday rebellion.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-neutral-300 shrink-0" />
                  <span>100% Authenticity Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-neutral-300 shrink-0" />
                  <span>Handcrafted Precision</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl group aspect-4/3">
                <img
                  src="/mens-collection.jpg" 
                  alt="Rebel Watches Craftsmanship"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-linear-to-t from-neutral-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-neutral-950/70 backdrop-blur-md border border-neutral-800/80">
                  <p className="font-serif text-white text-sm italic">
                    &ldquo;Time is your most valuable asset. Spend it wearing a masterpiece.&rdquo;
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-2 block">
                    — Rebel Watches Atelier
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Core Pillars (Grid) */}
          <div className="space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                The Pillars of Excellence
              </h2>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">
                What drives our curation standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shadow-inner group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">Uncompromised Quality</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  We partner directly with elite horologists and master craftsmen who utilize sapphire crystal, surgical-grade 316L stainless steel, and dependable automatic movements.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shadow-inner group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">Timeless Aesthetics</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Our designs merge bold modern architecture with timeless luxury elements—giving you a commanding wrist presence for both corporate boardrooms and evening galas.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shadow-inner group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">Customer Commitment</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  From secure checkout and lightning-fast delivery to responsive order tracking and dedicated assistance, your satisfaction is built into our foundation.
                </p>
              </div>

            </div>
          </div>

          {/* Section 3: Call to Action Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Ready to Find Your Signature Timepiece?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Browse our curated selections across Men&apos;s luxury lines, automatic movements, and limited releases.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95"
              >
                Explore Collections
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}