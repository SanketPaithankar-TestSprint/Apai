import { NextResponse } from "next/server"

// This endpoint is deprecated - middleware handles authentication
export async function GET() {
  return NextResponse.json(
    { message: "This endpoint is not in use. Authentication is handled by middleware." },
    { status: 200 }
  )
}

export async function POST() {
  return NextResponse.json(
    { message: "This endpoint is not in use. Authentication is handled by middleware." },
    { status: 200 }
  )
}
