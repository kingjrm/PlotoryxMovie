import { fetchFromTMDB } from "@/config/tmdb";
import MoviesClient from "@/components/MoviesClient";

export const dynamic = "force-dynamic";

export default async function MoviesPage({ searchParams }) {
  // Resolve searchParams before accessing properties (required in Next.js 15+)
  const resolvedSearchParams = await searchParams;
  const genre = resolvedSearchParams.genre || null;

  let movies = null;
  if (genre) {
    movies = await fetchFromTMDB("/discover/movie", { page: "1", with_genres: genre });
  } else {
    movies = await fetchFromTMDB("/movie/popular", { page: "1" });
  }

  const totalPages = movies?.total_pages || 1;

  return (
    <MoviesClient
      initialMovies={movies}
      initialGenre={genre}
      totalPages={totalPages}
    />
  );
}
