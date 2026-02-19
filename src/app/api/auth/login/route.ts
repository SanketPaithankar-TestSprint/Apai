import { API_ENDPOINTS } from "@/constants/api";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
    usernameOrEmail: z.string().min(1, "Email or username is required"),
    password: z.string().min(6, "Password must be at least 6 characters").max(16, "Password must be at most 16 characters"),
    deviceType: z.string().default("web"),
    browserInfo: z.string().default("next-js-app"),
});
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { usernameOrEmail, password, deviceType = "web", browserInfo = "next-js-app" } = loginSchema.parse(body);
        
        // Calling backend API to login user
        const backendResponse = await fetch(API_ENDPOINTS.LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usernameOrEmail,
                password,
                deviceType,
                browserInfo,
            }),
        })
        
        // Backend response
        if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            return NextResponse.json({ message: errorData.message || "Login failed" }, { status: backendResponse.status });
        }
        
        // Getting token from backend response
        const data = await backendResponse.json();
        const jwttoken = data?.data?.jwtToken;
        
        if (!jwttoken) {
            return NextResponse.json({ message: "No token received from server" }, { status: 500 });
        }
        
        // Setting cookie with token
        const response = NextResponse.json({ message: "Login successful" });
        response.cookies.set("token", jwttoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });
        return response;
    } catch (error) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }
    
}