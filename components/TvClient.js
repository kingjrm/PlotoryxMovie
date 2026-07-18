"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";

const TV_GENRES = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export default function TvClient({ initialTv, initialCategory, initialGenre, totalPages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tvShows, setTvShows] = useState(initialTv?.results || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalPages > 1);

  // Sync state if initialTv changes
  useEffect(() => {
    setTvShows(initialTv?.results || []);
    setCurrentPage(1);
    setHasMore(totalPages > 1);
  }, [initialTv, totalPages]);

  // Apply category and genre filters
  const applyFilters = (category, genre) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category !== undefined) {
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
    }

    if (genre !== undefined) {
      if (genre) {
        params.set("genre", genre);
      } else {
        params.delete("genre");
      }
    }

    params.delete("page"); // reset page
    router.push(`/tv?${params.toString()}`);
  };

  const handleCategoryChange = (e) => {
    applyFilters(e.target.value, undefined);
  };

  const handleGenreChange = (e) => {
    applyFilters(undefined, e.target.value);
  };

  // Infinite scroll
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
    let url = `/api/discover?type=tv&page=${nextPage}`;
    if (initialCategory) {
      url += `&category=${initialCategory}`;
    }
    if (initialGenre) {
      url += `&genre=${initialGenre}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setTvShows((prev) => [...prev, ...data.results]);
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

  // Build the title based on filters
  let title = "Popular TV Shows";
  if (initialCategory) {
    switch (initialCategory) {
      case "kdrama":
        title = "Korean Dramas (K-Drama)";
        break;
      case "cdrama":
        title = "Chinese Dramas (C-Drama)";
        break;
      case "jdrama":
        title = "Japanese Dramas (J-Drama)";
        break;
      case "anime":
        title = "Anime Series";
        break;
    }
    if (initialGenre && TV_GENRES[initialGenre]) {
      title += ` - ${TV_GENRES[initialGenre]}`;
    }
  } else if (initialGenre && TV_GENRES[initialGenre]) {
    title = `${TV_GENRES[initialGenre]} TV Shows`;
  }

  return (
    <div className="container" style={{ paddingTop: "calc(var(--header-height) + 40px)", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <h1 style={{ marginBottom: 0 }}>{title}</h1>

        {/* TV Filter Bar */}
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {/* Category Dropdown */}
          <div className="filter-select-wrapper">
            <select id="categorySelect" value={initialCategory || ""} onChange={handleCategoryChange}>
              <option value="">All TV Shows</option>
              <option value="kdrama">K-Dramas (Korean)</option>
              <option value="cdrama">C-Dramas (Chinese)</option>
              <option value="jdrama">J-Dramas (Japanese)</option>
              <option value="anime">Anime (Japanese)</option>
            </select>
          </div>

          {/* Genre Dropdown */}
          <div className="filter-select-wrapper">
            <select id="genreSelect" value={initialGenre || ""} onChange={handleGenreChange}>
              <option value="">All Genres</option>
              {Object.entries(TV_GENRES).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="movie-grid" id="tvGrid">
        {tvShows.length > 0 ? (
          tvShows.map((item, idx) => (
            <MovieCard key={`${item.id}-${idx}`} item={item} />
          ))
        ) : (
          <p id="noResultsMessage" style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            No TV shows found matching these filters.
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
