import { fetchFromTMDB } from "@/config/tmdb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  const season = searchParams.get("season") || "1";

  if (!id) {
    return NextResponse.json({ episodes: [] });
  }

  const data = await fetchFromTMDB(`/tv/${id}/season/${season}`);

  if (!data) {
    return NextResponse.json({ episodes: [] });
  }

  return NextResponse.json(data);
}
