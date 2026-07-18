import { fetchFromTMDB } from "@/config/tmdb";
import HomePageClient from "@/components/HomePageClient";

// Opt into dynamic rendering (SSR) since it accesses external data
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch data concurrently on the server
  const [trending, popularMovies, topTv] = await Promise.all([
    fetchFromTMDB("/trending/all/day"),
    fetchFromTMDB("/movie/popular"),
    fetchFromTMDB("/tv/top_rated"),
  ]);

  return (
    <HomePageClient
      trending={trending}
      popularMovies={popularMovies}
      topTv={topTv}
    />
  );
}
