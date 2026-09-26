import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request) {
  try {
    const secret = request.headers.get("x-revalidate-secret");

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Invalidate homepage data cache
    revalidateTag("homepage", "max");

    // Invalidate homepage route
    revalidatePath("/");

    return Response.json({
      success: true,
      message: "Homepage cache revalidated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Homepage revalidation error:", error);

    return Response.json(
      {
        success: false,
        message: "Homepage revalidation failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    {
      success: false,
      message: "Method not allowed",
    },
    { status: 405 }
  );
}