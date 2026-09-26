export const revalidateHomepage = async () => {
  try {
    const frontendUrl = process.env.CLIENT_URL;

    if (!frontendUrl) {
      console.error("FRONTEND_URL is not configured.");
      return false;
    }

    if (!process.env.REVALIDATE_SECRET) {
      console.error("REVALIDATE_SECRET is not configured.");
      return false;
    }

    const response = await fetch(`${frontendUrl}/api/revalidate/homepage`, {
      method: "POST",
      headers: {
        "x-revalidate-secret": process.env.REVALIDATE_SECRET,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Homepage revalidation failed:", response.status, data);

      return false;
    }

    console.log("Homepage revalidated successfully.");

    return true;
  } catch (error) {
    console.error("Could not connect to Next.js revalidation endpoint:", error);

    return false;
  }
};

export async function revalidateProductCache(slug) {
  const NEXT_APP_URL = process.env.CLIENT_URL;
  const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

  if (!NEXT_APP_URL || !REVALIDATE_SECRET || !slug) {
    console.warn("Product cache revalidation skipped:", {
      hasNextAppUrl: !!NEXT_APP_URL,
      hasSecret: !!REVALIDATE_SECRET,
      slug,
    });
    return;
  }
  try {
    const response = await fetch(`${NEXT_APP_URL}/api/revalidate/productPage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": REVALIDATE_SECRET,
      },
      body: JSON.stringify({ tag: `product:${slug}` }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Product cache revalidation failed:", {
        slug,
        status: response.status,
        response: text,
      });
      return;
    }
    console.log(`Product cache revalidated: product:${slug}`);
  } catch (error) {
    console.error("Product cache revalidation error:", error);
  }
}

export const revalidateProductInBackground = (slug) => {
  revalidateProductCache(slug).catch((error) => {
    console.error("Background product revalidation failed:", error);
  });
};
/** * Fire-and-forget homepage invalidation. */ export const revalidateHomepageInBackground =
  () => {
    revalidateHomepage().catch((error) => {
      console.error("Background homepage revalidation failed:", error);
    });
  };

  export const revalidateCollectionsInBackground = async () => {
    try {
      const frontendUrl = process.env.CLIENT_URL;
      const secret = process.env.REVALIDATE_SECRET;
  
      if (!frontendUrl || !secret) return;
  
      await fetch(`${frontendUrl}/api/revalidate/collections`, {
        method: "POST",
        headers: { "x-revalidate-secret": secret },
      });
      console.log("Collections cache revalidation triggered.");
    } catch (error) {
      console.error("Collections revalidation trigger failed:", error);
    }
  };