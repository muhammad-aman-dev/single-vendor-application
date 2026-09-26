import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.rebelwatches.com";

const API_URL = process.env.API_URL;

/* -------------------------------------------------------------------------- */
/*                              PRODUCT FETCH                                 */
/* -------------------------------------------------------------------------- */

async function getProduct(slug) {
  if (!slug || !API_URL) {
    return null;
  }

  try {
    const res = await fetch(
      `${API_URL}/general/products/${encodeURIComponent(
        slug
      )}`,
      {
        next: {
          revalidate: 300,
          tags: [`product:${slug}`],
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return data?.product || null;
  } catch (error) {
    console.error(
      "Failed to fetch product:",
      error
    );

    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                               METADATA                                     */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return {
      title:
        "Product Not Found | Rebel Watches",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seoTitle =
    typeof product.seo?.title ===
      "string" &&
    product.seo.title.trim()
      ? product.seo.title.trim()
      : `${product.name} | Rebel Watches`;

  const seoDescription =
    typeof product.seo?.description ===
      "string" &&
    product.seo.description.trim()
      ? product.seo.description.trim()
      : typeof product.description ===
          "string" &&
        product.description.trim()
      ? product.description.trim()
      : `Discover ${product.name} from Rebel Watches. Explore this exceptional luxury timepiece.`;

  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;

  const images =
    Array.isArray(product.images)
      ? product.images
          .filter(
            (image) =>
              image &&
              typeof image.url ===
                "string" &&
              image.url.trim()
          )
          .map((image) => ({
            url: image.url,
            alt:
              typeof image.alt ===
                "string" &&
              image.alt.trim()
                ? image.alt
                : product.name,
          }))
      : [];

  const keywords =
    Array.isArray(
      product.seo?.keywords
    )
      ? product.seo.keywords.filter(
          (keyword) =>
            typeof keyword ===
              "string" &&
            keyword.trim()
        )
      : [];

  return {
    title: seoTitle,

    description:
      seoDescription,

    keywords:
      keywords.length > 0
        ? keywords
        : [
            product.name,
            product.category,
            product.gender,
            "luxury watches",
            "Rebel Watches",
          ].filter(Boolean),

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index:
        product.status ===
        "Active",

      follow: true,

      googleBot: {
        index:
          product.status ===
          "Active",

        follow: true,

        "max-image-preview":
          "large",

        "max-snippet": -1,

        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "website",

      locale: "en_US",

      url: canonicalUrl,

      siteName:
        "Rebel Watches",

      title: seoTitle,

      description:
        seoDescription,

      images,
    },

    twitter: {
      card:
        "summary_large_image",

      title: seoTitle,

      description:
        seoDescription,

      images:
        images.length > 0
          ? [images[0].url]
          : [],
    },
  };
}


function hasAvailableStock(product) {
  const baseStock = Number(
    product?.stock || 0
  );

  if (
    !Number.isFinite(baseStock) ||
    baseStock <= 0
  ) {
    return false;
  }

  if (
    product.status !==
    "Active"
  ) {
    return false;
  }

  const variations =
    Array.isArray(
      product.variations
    )
      ? product.variations
      : [];

  /*
   * Your schema does not contain combination-level
   * variant stock.
   *
   * Therefore any variation value with stock > 0
   * means there is potentially stock available.
   */
  if (variations.length === 0) {
    return true;
  }

  return variations.some(
    (variation) =>
      Array.isArray(
        variation?.values
      ) &&
      variation.values.some(
        (value) =>
          Number(
            value?.stock || 0
          ) > 0
      )
  );
}

/* -------------------------------------------------------------------------- */
/*                               JSON-LD                                      */
/* -------------------------------------------------------------------------- */

function ProductJsonLd({
  product,
}) {
  const productUrl = `${SITE_URL}/products/${product.slug}`;

  const images = Array.isArray(product.images)
  ? product.images
      .map((image) => {
        let url = image?.url;
        if (!url || typeof url !== "string") return null;

        // If wrapped in Next.js optimization, extract the original source
        if (url.includes("/_next/image")) {
          try {
            const urlObj = new URL(url, SITE_URL);
            const originalUrl = urlObj.searchParams.get("url");
            if (!originalUrl) return null;
            url = decodeURIComponent(originalUrl);
          } catch (e) {
            return null; // Drop immediately if parsing fails
          }
        }

        // Ensure it's a valid absolute URL, otherwise drop it
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return url;
        }

        return null;
      })
      .filter(Boolean) // Removes any null values
  : [];

  const hasStock =
    hasAvailableStock(product);

  const price = Number(
    product.price
  );

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type": "Product",

    name:
      product.name,

    description:
      product.seo?.description ||
      product.description ||
      product.name,

    sku:
      product.productId,

    url:
      productUrl,

    category:
      product.category,

    image:
      images,

    brand: {
      "@type": "Brand",

      name:
        "Rebel Watches",
    },

    offers: {
      "@type": "Offer",

      url:
        productUrl,

      priceCurrency:
        "PKR",

      price:
        Number.isFinite(price)
          ? price.toFixed(2)
          : "0.00",

      availability:
        hasStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",

      seller: {
        "@type":
          "Organization",

        name:
          "Rebel Watches",
      },
    },
  };

  if (images.length === 0) {
    delete jsonLd.image;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html:
          JSON.stringify(
            jsonLd
          ),
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              PRODUCT PAGE                                  */
/* -------------------------------------------------------------------------- */

export default async function ProductPage({
  params,
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const product =
    await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductJsonLd
        product={product}
      />

      <main>
        <ProductClient
          product={product}
        />
      </main>
    </>
  );
}
