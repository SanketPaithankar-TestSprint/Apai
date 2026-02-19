import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/constants/api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(API_ENDPOINTS.ADMIN_REGISTER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || "Registration failed" },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Registration API error:", error);
        return NextResponse.json(
            { message: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
