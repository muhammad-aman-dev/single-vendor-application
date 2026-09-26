// app/collections/[type]/page.jsx
import { notFound } from "next/navigation";
import CollectionView from "@/components/CollectionView";

const COLLECTION_LABELS = {
  "featured-articles": "Featured Collection",
  "male-articles": "Men's Collection",
  "female-articles": "Women's Collection",
  "childrens-articles": "Children's Collection",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getCollectionTitle(type) {
  if (COLLECTION_LABELS[type]) return COLLECTION_LABELS[type];
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function fetchCollection(type, page) {
  try {
    const res = await fetch(
      `${API_BASE}/general/collections/dynamic?type=${encodeURIComponent(
        type
      )}&page=${page}&limit=24`,
      { next: { revalidate: 60 } } // ISR — regenerate every 60s, still fast + fresh-ish
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data : null;
  } catch (error) {
    console.error("fetchCollection error:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { type: rawType } = await params;
  const type = decodeURIComponent(rawType).trim().toLowerCase();
  const title = getCollectionTitle(type);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${type}`;

  return {
    title: `Browse Best ${title} | Rebel Watches`,
    description: `Shop the ${title} at Rebel Watches — premium timepieces built to last. Browse the full range and find your next watch.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Rebel Watches`,
      description: `Discover ${title} at Rebel Watches.`,
      url,
      type: "website",
    },
  };
}

export default async function CollectionPage({ params, searchParams }) {
  const { type: rawType } = await params;
  const { page: rawPage } = await searchParams;

  const type = decodeURIComponent(rawType).trim().toLowerCase();
  const page = Math.max(parseInt(rawPage, 10) || 1, 1);

  const data = await fetchCollection(type, page);

  // If a page beyond totalPages is requested, 404 instead of showing empty state
  if (data && page > 1 && page > data.pagination.totalPages) {
    notFound();
  }

  return (
    <CollectionView
      type={type}
      title={getCollectionTitle(type)}
      products={data?.products || []}
      pagination={data?.pagination || null}
    />
  );
}