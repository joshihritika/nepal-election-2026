import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);
  const offset = Number(searchParams.get("offset") || 0);
  try {
    const comments = await getComments(limit, offset);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, message } = await req.json();
    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }
    const trimmedName = String(name).trim().slice(0, 50);
    const trimmedMessage = String(message).trim().slice(0, 500);
    if (!trimmedName || !trimmedMessage) {
      return NextResponse.json({ error: "Name and message cannot be empty" }, { status: 400 });
    }
    const comment = await addComment(trimmedName, trimmedMessage);
    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
