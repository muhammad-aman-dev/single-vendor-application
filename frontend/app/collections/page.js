import Link from "next/link";
import { slugify } from "@/lib/slugify";
import { Compass, ArrowRight, ShieldCheck, Clock, Award } from "lucide-react";

// Revalidate every 2 days (172800 seconds)
export const revalidate = 172800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata = {
  title: "Exclusive Luxury Watch Collections | Handcrafted Timepieces",
  description: "Explore our curated collections of luxury, automatic, sports, and classic wristwatches. Discover exceptional craftsmanship built for every occasion.",
  keywords: "luxury watches, watch collections, automatic watches, best watch brands, men's watches, women's watches, wristwatches",
  alternates: {
    canonical: `${SITE_URL}/collections`,
  },
  openGraph: {
    title: "Exclusive Luxury Watch Collections | Handcrafted Timepieces",
    description: "Explore our curated collections of luxury, automatic, sports, and classic wristwatches. Discover exceptional craftsmanship.",
    url: `${SITE_URL}/collections`,
    siteName: "Rebel Watches",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Luxury Watch Collections Overview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exclusive Luxury Watch Collections | Handcrafted Timepieces",
    description: "Explore our curated collections of luxury, automatic, sports, and classic wristwatches.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL}/general/category/all`, {
      next: { revalidate: 172800 },
    });
    const data = await res.json();
    return data?.categories || [];
  } catch (error) {
    console.error("Failed to fetch collections categories:", error);
    return [];
  }
}

export default async function CollectionsPage() {
  const categories = await getCategories();

  // JSON-LD Structured Data Schema for CollectionPage & ItemList
  // Including both the static "Mens" item and dynamic API categories
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Exclusive Luxury Watch Collections",
    description: "Explore our curated collections of luxury, automatic, sports, and classic wristwatches.",
    url: `${SITE_URL}/collections`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Mens",
          url: `${SITE_URL}/collections/men-articles`,
        },
        ...categories.map((cat, index) => ({
          "@type": "ListItem",
          position: index + 2,
          name: cat.name,
          url: `${SITE_URL}/collections/${slugify(cat.name)}-articles`,
        })),
      ],
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
        
        {/* Brand Header with Background Image & Dark Filter */}
        <section className="relative w-full py-24 sm:py-32 overflow-hidden border-b border-neutral-900">
          {/* Background Image */}
          <img
            src="/collections-header.jpg"
            alt="Luxury Watch Collections Header"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-75 scale-105"
          />
          {/* Dark Overlay Filter */}
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs" />

          {/* Header Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/60 border border-neutral-800">
              <Compass className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                Curated Timepieces
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Explore Our <span className="text-neutral-300">Watch Collections</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-neutral-400 leading-relaxed">
              Discover the best watches designed with precision and elegance. Find your signature style items crafted under our exclusive collections.
            </p>
          </div>
        </section>

        {/* Main Content Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">
          
          {/* Collections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Static/Featured Mens Collection Card */}
            <div className="group relative h-110 rounded-3xl overflow-hidden border border-neutral-800/80 bg-neutral-900 shadow-2xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:border-neutral-700">
              <img
                src="/mens-collection.jpg"
                alt="Mens watch collection"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 brightness-95"
              />
              <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-95 group-hover:opacity-90 transition-opacity" />

              <div className="relative z-10 p-6">
                <h2 className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-md">
                  Mens
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">
                  Master Horology
                </p>
              </div>

              <div className="relative z-10 p-6 pt-0">
                <Link
                  href="/collections/men-articles"
                  className="inline-flex items-center justify-center gap-2.5 w-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/80 text-xs font-bold tracking-widest uppercase py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg group-hover:border-neutral-600"
                >
                  <span>See all from Mens</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* 2. Dynamic API Categories Cards */}
            {categories.map((cat) => {
              const categorySlug = slugify(cat.name);
              return (
                <div
                  key={cat._id}
                  className="group relative h-110 rounded-3xl overflow-hidden border border-neutral-800/80 bg-neutral-900 shadow-2xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:border-neutral-700"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={`${cat.name} watch collection`}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 brightness-95"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-900" />
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-95 group-hover:opacity-90 transition-opacity" />

                  <div className="relative z-10 p-6">
                    <h2 className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-md">
                      {cat.name}
                    </h2>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">
                      Master Horology
                    </p>
                  </div>

                  <div className="relative z-10 p-6 pt-0">
                    <Link
                      href={`/collections/${categorySlug}-articles`}
                      className="inline-flex items-center justify-center gap-2.5 w-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/80 text-xs font-bold tracking-widest uppercase py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg group-hover:border-neutral-600"
                    >
                      <span>See all from {cat.name}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Trust Value Props Sub-section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-neutral-900">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">100% Certified</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Authentic Horology</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Tested Movement</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Precision Calibrated</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Curated Quality</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Master Craftsmanship</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}