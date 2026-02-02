import { NextRequest, NextResponse } from "next/server";
import { castVote, removeVote, getVotes, getUserVote } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const constituency = searchParams.get("constituency");
  const voterId = searchParams.get("voterId");

  if (!constituency) {
    return NextResponse.json({ error: "constituency is required" }, { status: 400 });
  }

  const votes = await getVotes(constituency);
  const userVote = voterId ? await getUserVote(constituency, voterId) : null;

  return NextResponse.json({ votes, userVote });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { constituency, candidateId, voterId } = body;

    if (!constituency || !voterId) {
      return NextResponse.json(
        { error: "constituency and voterId are required" },
        { status: 400 }
      );
    }

    // If candidateId is null, remove the vote (unvote)
    if (!candidateId) {
      await removeVote(constituency, voterId);
      const votes = await getVotes(constituency);
      return NextResponse.json({ votes, userVote: null });
    }

    await castVote(constituency, candidateId, voterId);
    const votes = await getVotes(constituency);

    return NextResponse.json({ votes, userVote: candidateId });
  } catch {
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
