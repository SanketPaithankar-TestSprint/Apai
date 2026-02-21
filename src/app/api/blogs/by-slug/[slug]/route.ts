import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/constants/api";

/**
 * GET /api/blogs/by-slug/[slug]
 * Proxies GET /api/v1/blogs/{slug} on the Java backend with auth token.
 * Returns the full blog object including the numeric `id` needed for PUT.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.BLOGS}/${slug}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ message: "Blog not found" }, { status: 404 });
            }
            return NextResponse.json(
                { message: "Failed to fetch blog" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Get Blog by Slug API error:", error);
        return NextResponse.json(
            { message: "Failed to fetch blog details" },
            { status: 500 }
        );
    }
}
