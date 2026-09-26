import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const secret = request.headers.get("x-revalidate-secret");

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return Response.json(
        { success: false, message: "Unauthorized revalidation attempt" },
        { status: 401 }
      );
    }

    // Revalidate the collections page path
    revalidatePath("/collections");

    return Response.json({
      success: true,
      message: "Collections path revalidated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Collections revalidation error:", error);
    return Response.json(
      { success: false, message: "Collections revalidation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
}