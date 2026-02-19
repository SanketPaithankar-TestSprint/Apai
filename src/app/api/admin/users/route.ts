import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/constants/api"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.json({ message: "No token found" }, { status: 401 })
  }

  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_USERS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch users" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
