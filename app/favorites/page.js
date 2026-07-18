"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";

export default function FavoritesPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlist(list);
    setLoaded(true);
  }, []);

  return (
    <div className="container" style={{ paddingTop: "calc(var(--header-height) + 40px)", minHeight: "80vh" }}>
      <h1 style={{ marginBottom: "30px" }}>Your Watchlist</h1>
      
      {loaded && watchlist.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>Your watchlist is empty.</p>
      ) : (
        <div className="movie-grid" id="watchlistGrid">
          {watchlist.map((item, idx) => {
            // Map keys so it works with MovieCard
            const movieItem = {
              id: item.id,
              title: item.type === "movie" ? item.title : undefined,
              name: item.type === "tv" ? item.title : undefined,
              poster_path: item.poster ? item.poster.replace("https://image.tmdb.org/t/p/w342", "").replace("https://image.tmdb.org/t/p/w500", "") : "",
              media_type: item.type,
            };

            return (
              <MovieCard key={`${item.id}-${idx}`} item={movieItem} />
            );
          })}
        </div>
      )}
    </div>
  );
}
