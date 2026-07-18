import { fetchFromTMDB } from "@/config/tmdb";
import TvClient from "@/components/TvClient";

export const dynamic = "force-dynamic";

export default async function TvPage({ searchParams }) {
  // Resolve searchParams before accessing properties (required in Next.js 15+)
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category || null;
  const genre = resolvedSearchParams.genre || null;

  const apiParams = { page: "1" };
  let tv = null;

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
      apiParams["with_genres"] += `,${genre}`;
    }

    tv = await fetchFromTMDB("/discover/tv", apiParams);
  } else if (genre) {
    apiParams["with_genres"] = genre;
    tv = await fetchFromTMDB("/discover/tv", apiParams);
  } else {
    tv = await fetchFromTMDB("/tv/popular", apiParams);
  }

  const totalPages = tv?.total_pages || 1;

  return (
    <TvClient
      initialTv={tv}
      initialCategory={category}
      initialGenre={genre}
      totalPages={totalPages}
    />
  );
}
