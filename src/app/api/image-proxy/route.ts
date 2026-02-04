import { NextRequest, NextResponse } from "next/server";

// Allowed image domains for security
const ALLOWED_DOMAINS = [
  "upload.wikimedia.org",
  "annapurnaexpress.prixacdn.net",
  "en.setopati.com",
  "assets-api.kathmandupost.com",
  "assets-cdn.kathmandupost.com",
  "enlokaantar.prixacdn.net",
  "wegeexfuvagvyntbtcyu.supabase.co",
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);

    // Security: Only allow specific domains
    if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
    }

    // Fetch the image
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NepalElection/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
