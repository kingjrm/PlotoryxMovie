"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";

const MOVIE_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export default function MoviesClient({ initialMovies, initialGenre, totalPages }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [movies, setMovies] = useState(initialMovies?.results || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalPages > 1);

  // Sync state if initialMovies changes (e.g. genre filter changes from server side)
  useEffect(() => {
    setMovies(initialMovies?.results || []);
    setCurrentPage(1);
    setHasMore(totalPages > 1);
  }, [initialMovies, totalPages]);

  // Apply genre filter
  const handleGenreChange = (e) => {
    const genre = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (genre) {
      params.set("genre", genre);
    } else {
      params.delete("genre");
    }
    params.delete("page"); // reset page parameter
    router.push(`/movies?${params.toString()}`);
  };

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, currentPage]);

  const loadNextPage = async () => {
    setLoading(true);
    const nextPage = currentPage + 1;
    let url = `/api/discover?type=movie&page=${nextPage}`;
    if (initialGenre) {
      url += `&genre=${initialGenre}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setMovies((prev) => [...prev, ...data.results]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < (data.total_pages || totalPages));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading next page:", err);
    } finally {
      setLoading(false);
    }
  };

  const title = initialGenre && MOVIE_GENRES[initialGenre]
    ? `${MOVIE_GENRES[initialGenre]} Movies`
    : "Popular Movies";

  return (
    <div className="container" style={{ paddingTop: "calc(var(--header-height) + 40px)", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <h1 style={{ marginBottom: 0 }}>{title}</h1>

        {/* Genre Filter */}
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="filter-select-wrapper">
            <select id="genreSelect" value={initialGenre || ""} onChange={handleGenreChange}>
              <option value="">All Genres</option>
              {Object.entries(MOVIE_GENRES).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="movie-grid" id="movieGrid">
        {movies.length > 0 ? (
          movies.map((item, idx) => (
            <MovieCard key={`${item.id}-${idx}`} item={item} />
          ))
        ) : (
          <p id="noResultsMessage" style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            No movies found matching these filters.
          </p>
        )}
      </div>

      {/* Infinite Scroll Spinner */}
      {loading && (
        <div id="infiniteScrollLoading" style={{ display: "block", textAlign: "center", padding: "40px 0" }}>
          <ion-icon name="sync-outline" className="spin" style={{ fontSize: "2.2rem", color: "#f5c518" }}></ion-icon>
        </div>
      )}
    </div>
  );
}
