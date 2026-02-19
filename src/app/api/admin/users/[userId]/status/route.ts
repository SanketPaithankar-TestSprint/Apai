import { API_ENDPOINTS } from "@/constants/api"
import { cookies } from "next/headers"

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Await params in Next.js 14+
    const { userId } = await params

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const backendUrl = API_ENDPOINTS.ADMIN_USER_STATUS(Number(userId))

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    console.error("Error toggling user status:", error)
    return new Response(JSON.stringify({ error: "Failed to toggle user status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
