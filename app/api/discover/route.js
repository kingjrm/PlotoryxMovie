import { fetchFromTMDB } from "@/config/tmdb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "movie";
  const page = searchParams.get("page") || "1";
  const genre = searchParams.get("genre");
  const category = searchParams.get("category");

  const apiParams = { page };

  if (type === "tv") {
    if (category) {
      switch (category) {
        case "kdrama":
          apiParams["with_original_language"] = "ko";
          apiParams["with_genres"] = "18";
          break;
        case "cdrama":
          apiParams["with_original_language"] = "zh";
          apiParams["with_genres"] = "18";
          break;
        case "jdrama":
          apiParams["with_original_language"] = "ja";
          apiParams["with_genres"] = "18";
          break;
        case "anime":
          apiParams["with_original_language"] = "ja";
          apiParams["with_genres"] = "16";
          break;
      }
      if (genre) {
        apiParams["with_genres"] += "," + genre;
      }
      const data = await fetchFromTMDB("/discover/tv", apiParams);
      return NextResponse.json(data || { results: [], total_pages: 0 });
    } else if (genre) {
      apiParams["with_genres"] = genre;
      const data = await fetchFromTMDB("/discover/tv", apiParams);
      return NextResponse.json(data || { results: [], total_pages: 0 });
    } else {
      const data = await fetchFromTMDB("/tv/popular", apiParams);
      return NextResponse.json(data || { results: [], total_pages: 0 });
    }
  } else {
    if (genre) {
      apiParams["with_genres"] = genre;
      const data = await fetchFromTMDB("/discover/movie", apiParams);
      return NextResponse.json(data || { results: [], total_pages: 0 });
    } else {
      const data = await fetchFromTMDB("/movie/popular", apiParams);
      return NextResponse.json(data || { results: [], total_pages: 0 });
    }
  }
}
