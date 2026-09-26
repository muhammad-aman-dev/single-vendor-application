import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  ChevronRight,
  Compass,
} from "lucide-react";

import ProductCard from "@/components/ProductCard";
import ValueProps from "./ValueProps";
import HeroCarousel from "./HeroCrousel";

const FALLBACK_IMAGE = "/watch-fallback.webp";

function sanitizeProducts(products = []) {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map((product) => ({
    ...product,
    images:
      Array.isArray(product.images) && product.images.length > 0
        ? product.images.map((image) => ({
            ...image,
            url:
              image?.url && image.url.trim() !== ""
                ? image.url
                : FALLBACK_IMAGE,
          }))
        : [
            {
              url: FALLBACK_IMAGE,
              alt: product?.name || "Luxury Watch",
            },
          ],
  }));
}

function AboutSection() {
  return (
    <section
      aria-label="About Rebel Watches - Certified Authentic Watches in Pakistan"
      className="w-full bg-neutral-900/40 border-y border-neutral-800/80 my-16 sm:my-24 relative overflow-hidden"
    >
      <div className="absolute top-1/2 -right-32 -translate-y-1/2 w-125 h-125 bg-neutral-700/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className="md:col-span-6 relative w-full h-80 sm:h-105 md:h-120 overflow-hidden rounded-3xl border border-neutral-800 shadow-2xl group">
            <Image
              src="/Rebel-Watches-About.jpg"
              alt="Rebel Watches craftsman authenticating a luxury watch movement in Pakistan"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              quality={75}
              className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-7 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/50">
                <Compass className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-300">
                  Certified Authentic
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                About <span className="text-neutral-300">Rebel Watches</span>
              </h2>
            </div>

            <p className="font-sans text-sm sm:text-base text-neutral-300 leading-relaxed">
              <strong className="text-white font-semibold">REBEL WATCHES</strong> is Pakistan&apos;s trusted destination for certified, authentic luxury and branded watches. We specialize in curating, verifying, and preserving extraordinary timepieces from the world&apos;s finest watchmakers. Every watch undergoes a rigorous multi-point technical evaluation—guaranteeing verified authenticity, precision movement, and flawless condition before it reaches you.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80">
              <div className="flex flex-col items-start gap-1.5">
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">100% Authentic</span>
                <span className="text-[11px] text-neutral-500">Verified Originals</span>
              </div>

              <div className="flex flex-col items-start gap-1.5">
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">Tested Movement</span>
                <span className="text-[11px] text-neutral-500">Precision Calibrated</span>
              </div>

              <div className="flex flex-col items-start gap-1.5">
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">Curated Quality</span>
                <span className="text-[11px] text-neutral-500">Master Craftsmanship</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-black/40 active:scale-95"
              >
                <span>See Our Process</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSection({ section, index }) {
  if (!section?.products?.length) {
    return null;
  }

  return (
    <>
      <section
        aria-labelledby={`heading-${section.id || index}`}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-neutral-900/80 last:border-b-0"
      >
        <div className="mb-8 pb-4 border-b border-neutral-900 flex items-end justify-between gap-4">
          <div className="text-left space-y-1">
            {section.subtitle && (
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400 block">
                {section.subtitle}
              </span>
            )}
            <h2
              id={`heading-${section.id || index}`}
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white"
            >
              {section.title}
            </h2>
          </div>
           { section.title == "Featured Collections" &&
          <Link
            href={`/collections/featured-articles`}
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:text-white transition-colors pb-1 whitespace-nowrap"
          >
            <span>View Collection</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link> }
        </div>

        {/* Reduced initial render payload to 4 products to improve TBT/Hydration */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {section.products.slice(0, 4).map((product) => (
            <ProductCard
              key={product._id || product.id || product.productId}
              product={product}
            />
          ))}
        </div>
      </section>

      {index === 0 && <AboutSection />}
    </>
  );
}

export default function HomeContent({ homepage }) {
  const carousels = Array.isArray(homepage?.carousels) ? homepage.carousels : [];

  const featuredProducts = sanitizeProducts(homepage?.featuredProducts);
  const latestProducts = sanitizeProducts(homepage?.latestProducts);
  const saleProducts = sanitizeProducts(homepage?.saleProducts);

  const sections = [
    {
      id: "featured",
      title: "Featured Collections",
      subtitle: "Curated Selection",
      slug: "featured",
      products: featuredProducts,
    },
    {
      id: "latest",
      title: "Latest Arrivals",
      subtitle: "Fresh Horizons",
      slug: "latest",
      products: latestProducts,
    },
    {
      id: "sale",
      title: "Special Offers",
      subtitle: "Limited Time",
      slug: "sale",
      products: saleProducts,
    },
  ];

  const defaultSlides = [
    {
      _id: "default",
      imageUrl: FALLBACK_IMAGE,
      alt: "Luxury Watch Collection",
      title: "Luxury Watch Collection",
      redirectUrl: "/",
    },
  ];

  const slides = carousels.length > 0 ? carousels : defaultSlides;

  const ctaLink = "/collections";

  const subtitle = "Certified Authentic Timepieces";
const title = "Luxury & Branded Watches in Pakistan";
const description = "Discover handcrafted, 100% authentic timepieces from the world's most iconic watchmakers. From heritage classics to modern icons — every Rebel Watches piece comes certified and insured.";
const ctaText = "Explore Collections";

  const hasProducts = sections.some(
    (section) => Array.isArray(section.products) && section.products.length > 0
  );

  return (
    <main className="w-full bg-neutral-950 text-neutral-200 min-h-screen selection:bg-neutral-800 selection:text-white font-sans">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-16 md:py-16">
        <div className="relative md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
          {/* Hero Image */}
          <div className="w-full md:col-span-7 md:order-2 min-w-0">
            <HeroCarousel slides={slides} />
          </div>

          {/* Hero Text */}
          <div className="mt-8 md:mt-0 p-2 sm:p-4 md:p-0 md:order-1 md:col-span-5 flex flex-col justify-center items-start">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400 block mb-3">
              {subtitle}
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl tracking-tight text-white font-bold leading-[1.12] mb-5 max-w-md">
              {title}
            </h1>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md mb-8">
              {description}
            </p>

            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-black/50 active:scale-95"
            >
              <span>{ctaText}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <ValueProps />

      {sections.map((section, index) => (
        <ProductSection key={section.id} section={section} index={index} />
      ))}

      {!hasProducts && <AboutSection />}
    </main>
  );
}
