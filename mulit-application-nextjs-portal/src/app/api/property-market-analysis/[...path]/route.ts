import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.MARKET_ANALYSIS_API_URL || "http://127.0.0.1:8001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "DELETE");
}

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const { path } = await params;
    const backendPath = path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : "";
    const backendUrl = `${BACKEND_URL}/${backendPath}${queryString}`;

    const headers: HeadersInit = {
      "Content-Type": request.headers.get("Content-Type") || "application/json",
    };

    // Copy authorization header if present
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (method !== "GET" && method !== "DELETE") {
      fetchOptions.body = await request.text();
    }

    const response = await fetch(backendUrl, fetchOptions);

    // Handle different response content types
    const contentType = response.headers.get("Content-Type") || "";
    
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // For non-JSON responses (like text/plain from v3/api-docs)
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "text/plain",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to market analysis service" },
      { status: 502 }
    );
  }
}
