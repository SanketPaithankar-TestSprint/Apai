import { API_ENDPOINTS } from "@/constants/api"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            })
        }

        const body = await request.json()
        const backendUrl = API_ENDPOINTS.ADMIN_CREATE_TEST_ACCOUNT

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`)
        }

        const data = await response.json()
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error creating test account:", error)
        return new Response(JSON.stringify({ error: "Failed to create test account" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}
