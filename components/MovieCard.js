"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MovieCard({ item, rank }) {
  const router = useRouter();

  if (!item || !item.id) return null;

  const id = item.id;
  const title = item.title || item.name || "Unknown";
  const voteAverage = item.vote_average && item.vote_average > 0
    ? Math.round(item.vote_average * 10) / 10
    : null;
  const releaseDate = item.release_date || item.first_air_date || "";
  const year = releaseDate ? releaseDate.substring(0, 4) : "";
  const type = item.media_type === "tv" || (!item.title && item.name) ? "tv" : "movie";

  // Prefer backdrop for landscape layout; fallback to poster
  const backdropPath = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
    : item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "";

  const href = `/details?id=${id}&type=${type}`;

  const handleClick = (e) => {
    e.preventDefault();
    const card = e.currentTarget;
    card.classList.add("card-clicking");
    const grid = card.closest(".movie-grid") || card.closest(".movie-slider");
    if (grid) {
      grid.querySelectorAll(".movie-card").forEach((other) => {
        if (other !== card) {
          other.style.opacity = "0.25";
          other.style.transform = "scale(0.96)";
          other.style.filter = "blur(1px)";
        }
      });
    }
    setTimeout(() => router.push(href), 220);
  };

  return (
    <Link href={href} className="movie-card" onClick={handleClick}>
      {/* Landscape image container */}
      <div className="movie-card-image">
        {/* Rank badge TOP N */}
        {rank && (
          <div className="card-rank-badge">
            <span className="card-rank-top">TOP</span>
            <span className="card-rank-num">{rank}</span>
          </div>
        )}
        {backdropPath ? (
          <img loading="lazy" src={backdropPath} alt={title} />
        ) : (
          <div className="no-poster">
            <ion-icon name="image-outline" style={{ fontSize: "2.5rem", color: "rgba(255,255,255,0.08)", marginBottom: "8px" }}></ion-icon>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
              {title}
            </div>
          </div>
        )}
        {/* Gradient overlay for readability */}
        <div className="movie-card-gradient" />
      </div>

      {/* Info below card */}
      <div className="movie-info">
        <div className="movie-title">{title}</div>
        <div className="movie-meta">
          {voteAverage && (
            <span className="meta-rating">
              <ion-icon name="star"></ion-icon>{voteAverage}
            </span>
          )}
          {year && <><span className="meta-dot"></span><span>{year}</span></>}
          <span className="meta-dot"></span>
          <span className="media-type">{type === "movie" ? "Movie" : "TV"}</span>
        </div>
      </div>
    </Link>
  );
}
