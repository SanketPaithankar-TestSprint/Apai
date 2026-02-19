import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/constants/api";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  
  // Construct the URL with query parameters if they exist
  const url = query ? `${API_ENDPOINTS.BLOGS}?${query}` : API_ENDPOINTS.BLOGS;

  if (!token) {
    return NextResponse.json({ message: "No token found" }, { status: 401 });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch blogs" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Blogs API error:", error);
    return NextResponse.json(
      { message: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    console.error("No token found in cookies");
    return NextResponse.json({ message: "No token found" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    
    // Log what we received
    const keys = Array.from(formData.keys());
    console.log("Received formData keys:", keys);
    
    const dataJson = formData.get("data");
    if (dataJson) {
      try {
        const parsedData = JSON.parse(dataJson as string);
        console.log("Parsed data field:", JSON.stringify(parsedData, null, 2));
      } catch (e) {
        console.log("Could not parse data field:", dataJson);
      }
    }
    
    // Forward the multipart form data directly to the backend
    console.log("Forwarding to backend URL:", API_ENDPOINTS.BLOGS);
    const response = await fetch(API_ENDPOINTS.BLOGS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
        const errorData = await response.text().catch(() => "");
        console.error("Backend error response:", errorData);
        
        // Try to parse and format the error
        try {
          const parsedError = JSON.parse(errorData);
          console.error("Parsed backend error:", JSON.stringify(parsedError, null, 2));
        } catch (e) {
          // Not JSON, already logged as raw text
        }
        
      return NextResponse.json(
        { message: "Failed to create blog", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Blog created successfully:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create Blog API error:", error);
    return NextResponse.json(
      { message: "Failed to create blog", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
