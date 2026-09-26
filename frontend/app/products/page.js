import CatalogClient from "@/components/CatalogClient";

// Fallback safety if the environment variable is missing
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rebelwatches.com";

export const metadata = {
  title: "Shop All Watches | Rebel Watches — Luxury & Vintage Timepieces",
  description: "Shop authenticated luxury & vintage watches in Pakistan. Discover curated modern timepieces at Rebel Watches with nationwide delivery.",
  keywords: ["luxury watches", "vintage watches", "authenticated watches", "mechanical watches", "Rebel Watches", "buy watches online"],
  
  alternates: {
    canonical: `${SITE_URL}/products`,
  },

  openGraph: {
    title: "Shop All Watches | Rebel Watches",
    description: "Explore the complete collection of authenticated luxury, vintage, and modern watches at Rebel Watches.",
    url: `${SITE_URL}/products`, 
    siteName: "Rebel Watches",
    locale: "en_US",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Shop All Watches | Rebel Watches",
    description: "Explore the complete collection of authenticated luxury, vintage, and modern watches at Rebel Watches.",
  },
};

export default function ProductsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Shop All Watches",
    "description": "Explore the complete collection of authenticated luxury, vintage, and modern watches at Rebel Watches.",
    "url": `${SITE_URL}/products`,
    "provider": {
      "@type": "Organization",
      "name": "Rebel Watches",
      "url": SITE_URL
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-neutral-950 text-neutral-200">
        <CatalogClient />
      </main>
    </>
  );
}