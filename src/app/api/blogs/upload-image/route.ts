import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/constants/api";

export async function POST(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    try {
        const formData = await request.formData();

        // Assuming the Java backend accepts multipart/form-data at /blogs/upload-image
        // Use the constant from API_ENDPOINTS
        const uploadUrl = API_ENDPOINTS.BLOG_UPLOAD_IMAGE;

        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Note: When sending FormData with fetch, do NOT set Content-Type header manually.
                // The browser/fetch client sets it automatically with the boundary.
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: "Failed to upload image", details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Upload Image API error:", error);
        return NextResponse.json(
            { message: "Failed to upload image" },
            { status: 500 }
        );
    }
}
