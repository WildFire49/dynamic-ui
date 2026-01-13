import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Streaming chat proxy hit:");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Target endpoint:", `${API_BASE_URL}/chat/stream`);
    console.log("Request body:", body);

    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      cache: "no-cache",
      body: JSON.stringify(body),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => "");
      console.error("Streaming backend error:", errorText);
      return NextResponse.json(
        { error: `Backend API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Stream SSE payload directly back to the client
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-cache");
    headers.set("Access-Control-Allow-Origin", "*");
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/event-stream");
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Chat proxy error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
