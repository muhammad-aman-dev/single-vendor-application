import HomeContent from "@/components/HomeContent";

export const revalidate = 3600;

// Fallback safety if env variable is missing during build
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rebelwatches.com";

export const metadata = {
  metadataBase: new URL(SITE_URL), // Handles relative paths automatically!
  title: "Rebel Watches | Luxury Vintage & Modern Watches",
  description:
    "Discover curated luxury watches, vintage restorations, and modern mechanical watches at Rebel Watches. 100% authenticated with a 2-year warranty.",
  keywords: [
    "luxury watches",
    "vintage watches",
    "chronographs",
    "automatic watches",
    "watch restoration",
    "rebel watches",
  ],
  authors: [{ name: "Rebel Watches" }],
  creator: "Rebel Watches",
  publisher: "Rebel Watches",

  alternates: {
    canonical: "/", // Automatically resolved against metadataBase
  },

  openGraph: {
    title: "Rebel Watches | Curated Luxury Watches",
    description:
      "Explore handpicked vintage restorations and rare modern watches. Guaranteed 100% authentic with global insured shipping.",
    url: SITE_URL,
    siteName: "Rebel Watches",
    images: [
      {
        url: "/og-image.jpg", // Automatically resolved to SITE_URL/og-image.jpg
        width: 1200,
        height: 630,
        alt: "Rebel Watches Curated Luxury Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Rebel Watches | Luxury Vintage & Modern Watches",
    description:
      "Curated luxury watches and vintage restorations. Guaranteed 100% authentic.",
    creator: "@rebelwatches",
    images: [`/og-image.jpg`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Rebel Watches",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.jpg`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Rebel Watches",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "Rebel Watches | Luxury Vintage & Modern Watches",
      description:
        "Discover curated luxury watches, vintage restorations, and modern mechanical watches at Rebel Watches.",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en-US",
    },
  ],
};

async function getHomepageData() {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    console.error("API_URL is not configured.");
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/general/homepagedata/all`, {
      next: {
        revalidate: 3600,
        tags: ["homepage"],
      },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Homepage API failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const result = await response.json();

    if (!result?.success || !result?.homepage) {
      console.error("Invalid homepage API response.");
      return null;
    }

    return result.homepage;
  } catch (error) {
    console.error("Homepage fetch failed:", error);
    return null;
  }
}

export default async function Home() {
  const homepage = await getHomepageData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      <main className="bg-neutral-950">
        <HomeContent homepage={homepage} />
      </main>
    </>
  );
}