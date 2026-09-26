import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const secret = request.headers.get("x-revalidate-secret");

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tag } = body;

    if (!tag) {
      return NextResponse.json(
        { message: "Missing tag" },
        { status: 400 }
      );
    }

    revalidateTag(tag, "max");

    return NextResponse.json({
      revalidated: true,
      tag,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Product revalidation error:", error);

    return NextResponse.json(
      {
        message: "Failed to revalidate product cache",
      },
      { status: 500 }
    );
  }
}
