"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MovieCard({ item }) {
  const router = useRouter();

  if (!item || !item.id) {
    return null;
  }

  const id = item.id;
  const title = item.title || item.name || "Unknown";
  const voteAverage = item.vote_average && item.vote_average > 0
    ? Math.round(item.vote_average * 10) / 10
    : "";
  const releaseDate = item.release_date || item.first_air_date || "N/A";
  const year = releaseDate && releaseDate !== "N/A" ? releaseDate.substring(0, 4) : "N/A";
  const type = item.title || (item.media_type === "movie") ? "movie" : "tv";

  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
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
          other.style.transform = "scale(0.95)";
          other.style.filter = "blur(1px)";
        }
      });
    }

    setTimeout(() => {
      router.push(href);
    }, 250);
  };

  return (
    <Link href={href} className="movie-card" onClick={handleClick}>
      {voteAverage && (
        <div className="card-rating-badge">
          <ion-icon name="star"></ion-icon> {voteAverage}
        </div>
      )}

      {posterPath ? (
        <img loading="lazy" src={posterPath} alt={title} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignMems: "center", background: "linear-gradient(135deg, #121526 0%, #0c0d16 100%)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
          <ion-icon name="image-outline" style={{ fontSize: "3rem", color: "rgba(255,255,255,0.1)", marginBottom: "12px" }}></ion-icon>
          <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", lineHeight: "1.3", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical" }}>
            {title}
          </div>
        </div>
      )}

      <div className="movie-info">
        <div className="movie-title">{title}</div>
        <div className="movie-meta">
          <span className="media-type">{type === "movie" ? "Movie" : "TV Series"}</span>
          <span>{year}</span>
        </div>
      </div>
    </Link>
  );
}
