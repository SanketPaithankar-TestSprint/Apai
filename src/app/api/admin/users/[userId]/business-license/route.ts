import { API_ENDPOINTS } from "@/constants/api"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params

        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            })
        }

        const backendUrl = API_ENDPOINTS.ADMIN_USER_BUSINESS_LICENSE(Number(userId))

        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`)
        }

        const pdfBuffer = await response.arrayBuffer()
        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="business-license-${userId}.pdf"`,
            },
        })
    } catch (error) {
        console.error("Error fetching business license:", error)
        return new Response(JSON.stringify({ error: "Failed to fetch business license" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}
