import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/constants/api";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.BLOGS}/${id}`, {
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
        console.error("Get Blog API error:", error);
        return NextResponse.json(
            { message: "Failed to fetch blog details" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await fetch(`${API_ENDPOINTS.BLOGS}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: "Failed to update blog", details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Update Blog API error:", error);
        return NextResponse.json(
            { message: "Failed to update blog" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.BLOGS}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: "Failed to delete blog" },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: "Blog deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete Blog API error:", error);
        return NextResponse.json(
            { message: "Failed to delete blog" },
            { status: 500 }
        );
    }
}
