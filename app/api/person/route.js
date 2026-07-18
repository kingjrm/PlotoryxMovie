import { fetchFromTMDB } from "@/config/tmdb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing person ID" }, { status: 400 });
  }

  const data = await fetchFromTMDB(`/person/${id}`, {
    append_to_response: "combined_credits",
  });

  if (!data) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
