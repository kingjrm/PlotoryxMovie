import { fetchFromTMDB } from "@/config/tmdb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "movie";
  const page = searchParams.get("page") || "1";
  const genre = searchParams.get("genre");
  const category = searchParams.get("category");
  const minRating = searchParams.get("min_rating");
  const language = searchParams.get("language");

  const apiParams = { page, sort_by: "popularity.desc" };
  if (minRating) apiParams["vote_average.gte"] = minRating;
  if (language) apiParams["with_original_language"] = language;

  if (type === "tv") {
    if (category) {
      switch (category) {
        case "kdrama": apiParams["with_original_language"] = "ko"; apiParams["with_genres"] = "18"; break;
        case "cdrama": apiParams["with_original_language"] = "zh"; apiParams["with_genres"] = "18"; break;
        case "jdrama": apiParams["with_original_language"] = "ja"; apiParams["with_genres"] = "18"; break;
        case "anime":  apiParams["with_original_language"] = "ja"; apiParams["with_genres"] = "16"; break;
      }
      if (genre) apiParams["with_genres"] = (apiParams["with_genres"] || "") + "," + genre;
      const data = await fetchFromTMDB("/discover/tv", apiParams);
      return NextResponse.json(data || { results: [], total_pages: 0 });
    } else {
      if (genre) apiParams["with_genres"] = genre;
      const endpoint = genre || language || minRating ? "/discover/tv" : "/tv/popular";
      const data = await fetchFromTMDB(endpoint, apiParams);
      return NextResponse.json(data || { results: [], total_pages: 0 });
    }
  } else {
    if (genre) apiParams["with_genres"] = genre;
    const endpoint = genre || language || minRating ? "/discover/movie" : "/movie/popular";
    const data = await fetchFromTMDB(endpoint, apiParams);
    return NextResponse.json(data || { results: [], total_pages: 0 });
  }
}
