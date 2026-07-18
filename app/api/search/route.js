import { fetchFromTMDB } from "@/config/tmdb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const data = await fetchFromTMDB("/search/multi", {
    query,
    page: "1",
  });

  return NextResponse.json(data || { results: [] });
}
