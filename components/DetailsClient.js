"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import CastModal from "@/components/CastModal";

export default function DetailsClient({ details, id, type }) {
  // Tabs State
  const [activeTab, setActiveTab] = useState("cast");

  // Trailer Modal State
  const [trailerActive, setTrailerActive] = useState(false);
  const [trailerTitle, setTrailerTitle] = useState("");

  // Cast Modal State
  const [castModalOpen, setCastModalOpen] = useState(false);
  const [selectedActorId, setSelectedActorId] = useState(null);

  // Watchlist State
  const [inWatchlist, setInWatchlist] = useState(false);
  const [toasts, setToasts] = useState([]);

  const title = details.title || details.name || "Unknown";
  const releaseDate = details.release_date || details.first_air_date || "";
  const year = releaseDate ? releaseDate.substring(0, 4) : "";
  const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]);
  const backdropPath = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : "";
  const posterPath = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "";

  // Find trailer
  let trailerKey = "";
  let trailerName = "Official Trailer";
  if (details.videos?.results) {
    for (const video of details.videos.results) {
      if (video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")) {
        trailerKey = video.key;
        trailerName = video.name || (video.type === "Teaser" ? "Official Teaser" : "Official Trailer");
        break;
      }
    }
  }

  // Check watchlist on mount
  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const exists = watchlist.some((item) => item.id === id && item.type === type);
    setInWatchlist(exists);
  }, [id, type]);

  // Escape key listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && trailerActive) {
        setTrailerActive(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [trailerActive]);

  const toggleWatchlist = () => {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const idx = watchlist.findIndex((item) => item.id === id && item.type === type);

    if (idx > -1) {
      watchlist.splice(idx, 1);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setInWatchlist(false);
      showToast("Removed from Watchlist");
    } else {
      watchlist.push({
        id,
        type,
        title,
        poster: posterPath,
      });
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setInWatchlist(true);
      showToast("Added to Watchlist");
    }
  };

  const showToast = (msg) => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, message: msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3100);
  };

  const openTrailer = () => {
    setTrailerTitle(`${title} - ${trailerName}`);
    setTrailerActive(true);

    // Try to fetch YouTube oEmbed title dynamically
    if (trailerKey) {
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${trailerKey}&format=json`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data) => {
          if (data && data.title) {
            setTrailerTitle(data.title);
          }
        })
        .catch(() => {});
    }
  };

  const handleActorClick = (actorId) => {
    setSelectedActorId(actorId);
    setCastModalOpen(true);
  };

  const cast = details.credits?.cast?.slice(0, 8) || [];
  const recs = details.recommendations?.results?.slice(0, 6) || [];

  return (
    <>
      <div
        className="details-hero"
        style={{
          backgroundImage: backdropPath ? `url('${backdropPath}')` : "none",
        }}
      >
        <div className="container details-content">
          <div className="poster-container">
            {posterPath ? (
              <img src={posterPath} alt={title} />
            ) : (
              <div style={{ width: "320px", height: "480px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #121526 0%, #0c0d16 100%)" }}>
                <ion-icon name="image-outline" style={{ fontSize: "4rem", color: "rgba(255,255,255,0.1)", marginBottom: "15px" }}></ion-icon>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{title}</span>
              </div>
            )}
          </div>
          <div className="info-container">
            <h1 className="info-title">
              {title} {year ? `(${year})` : ""}
            </h1>
            <div className="info-meta">
              <span className="rating">
                <ion-icon name="star"></ion-icon>{" "}
                {details.vote_average ? (Math.round(details.vote_average * 10) / 10).toFixed(1) : "N/A"}
              </span>
              {runtime && (
                <span>
                  <ion-icon name="time-outline" style={{ verticalAlign: "middle", marginRight: "4px" }}></ion-icon>
                  {runtime} min
                </span>
              )}
              <div className="genres">
                {details.genres?.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {details.tagline && <p className="tagline">&quot;{details.tagline}&quot;</p>}

            <h3 className="overview-title">Overview</h3>
            <p className="overview">{details.overview}</p>

            <div className="action-buttons">
              <Link href={`/watch?id=${id}&type=${type}`} className="btn btn-primary">
                <ion-icon name="play-circle" style={{ fontSize: "1.4rem" }}></ion-icon> Watch Now
              </Link>
              {trailerKey && (
                <button className="btn btn-secondary" onClick={openTrailer}>
                  <ion-icon name="videocam-outline" style={{ fontSize: "1.4rem" }}></ion-icon> Watch Trailer
                </button>
              )}
              <button id="addWatchlist" className={`btn ${inWatchlist ? "btn-primary" : "btn-secondary"}`} onClick={toggleWatchlist}>
                <ion-icon name={inWatchlist ? "checkmark" : "add"}></ion-icon>{" "}
                <span>{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === "cast" ? "active" : ""}`} onClick={() => setActiveTab("cast")}>
            Cast
          </button>
          {trailerKey && (
            <button className="tab-btn" onClick={openTrailer}>
              {trailerName}
            </button>
          )}
          {recs.length > 0 && (
            <button className={`tab-btn ${activeTab === "recs" ? "active" : ""}`} onClick={() => setActiveTab("recs")}>
              More Like This
            </button>
          )}
        </div>

        {/* Cast Tab */}
        {activeTab === "cast" && (
          <div id="castTab" className="tab-content active">
            <div className="cast-grid">
              {cast.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>No cast information available.</p>
              ) : (
                cast.map((actor, idx) => {
                  const actorImg = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "";
                  return (
                    <div
                      key={`${actor.id}-${idx}`}
                      className="actor-card cast-trigger"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleActorClick(actor.id)}
                    >
                      {actorImg ? (
                        <img className="actor-img" src={actorImg} alt={actor.name} />
                      ) : (
                        <div className="actor-img" style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#161827", color: "var(--text-secondary)", fontWeight: 700, fontSize: "1.2rem" }}>
                          {actor.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {actor.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                        {actor.character}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recs" && recs.length > 0 && (
          <div id="recsTab" className="tab-content active">
            <div className="movie-grid">
              {recs.map((item, idx) => (
                <MovieCard key={`${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal Overlay */}
      {trailerActive && (
        <div
          className="trailer-modal-overlay active"
          id="trailerModal"
          onClick={(e) => {
            if (e.target.id === "trailerModal") setTrailerActive(false);
          }}
        >
          <div className="trailer-modal-container">
            <div className="trailer-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#11121d", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "white", fontFamily: "var(--font-family-title)", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "calc(100% - 40px)" }}>
                <ion-icon name="film-outline" style={{ color: "var(--accent)", fontSize: "1.25rem", flexShrink: 0 }}></ion-icon>
                <span id="trailerModalTitle">{trailerTitle}</span>
              </h3>
              <button id="closeTrailerBtn" onClick={() => setTrailerActive(false)} aria-label="Close trailer" style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.6rem", display: "flex", alignItems: "center", transition: "color var(--transition-fast)" }}>
                <ion-icon name="close"></ion-icon>
              </button>
            </div>
            <div className="trailer-modal-video-ratio">
              <iframe id="trailerPlayer" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} allowFullScreen allow="autoplay; fullscreen" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div
        id="toastContainer"
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "rgba(12, 13, 22, 0.95)",
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "30px",
              fontSize: "0.9rem",
              fontWeight: 600,
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transform: "translateY(0)",
              opacity: 1,
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "auto",
            }}
          >
            <ion-icon name="bookmark" style={{ color: "#e50914", fontSize: "1.2rem" }}></ion-icon>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Cast Modal Overlay details */}
      <CastModal isOpen={castModalOpen} actorId={selectedActorId} onClose={() => setCastModalOpen(false)} />

      <style jsx>{`
        /* Scoped style tag details rules */
        .details-hero {
          position: relative;
          padding-top: 140px;
          padding-bottom: 60px;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
          min-height: 85vh;
          display: flex;
          align-items: center;
        }
        .details-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(6,7,12,0.98) 0%, rgba(6,7,12,0.85) 50%, rgba(6,7,12,0.4) 100%),
                      linear-gradient(to top, var(--bg-main) 0%, rgba(6,7,12,0) 25%);
        }
        .details-content {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 48px;
          align-items: center;
        }
        .poster-container {
          flex: 0 0 320px;
          max-width: 320px;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0,0,0,0.8);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .poster-container img {
          width: 100%;
          display: block;
          transition: transform var(--transition-medium);
        }
        .poster-container:hover img {
          transform: scale(1.03);
        }
        .info-container {
          flex: 1;
          min-width: 300px;
        }
        .info-title {
          font-size: 3.2rem;
          line-height: 1.1;
          margin-bottom: 12px;
          letter-spacing: -1.5px;
          background: linear-gradient(180deg, #ffffff 0%, #dcdfe9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .info-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          color: var(--text-secondary);
          margin-bottom: 24px;
          align-items: center;
          font-weight: 600;
        }
        .info-meta span.rating {
          color: #ffb12a;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .genres {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .genre-tag {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: var(--text-primary);
        }
        .tagline {
          font-style: italic;
          color: #9ea2c0;
          margin-bottom: 24px;
          font-size: 1.1rem;
          border-left: 3px solid var(--accent);
          padding-left: 12px;
        }
        .overview-title {
          font-size: 1.25rem;
          margin-bottom: 10px;
          color: var(--text-primary);
        }
        .overview {
          line-height: 1.7;
          margin-bottom: 35px;
          color: var(--text-secondary);
          font-size: 1.02rem;
        }
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .tabs-container {
          margin-top: 60px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
        }
        .tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.1rem;
          font-weight: 700;
          padding-bottom: 12px;
          cursor: pointer;
          position: relative;
          transition: color var(--transition-fast);
        }
        .tab-btn:hover {
          color: var(--text-primary);
        }
        .tab-btn.active {
          color: var(--text-primary);
        }
        .tab-btn.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--accent-gradient);
          border-radius: 3px;
        }
        .tab-content {
          display: block;
          animation: fadeIn 0.4s ease;
        }
        .cast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 20px;
        }
        .actor-card {
          text-align: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px;
          transition: all var(--transition-fast);
        }
        .actor-card:hover {
          transform: translateY(-5px);
          border-color: var(--border-color-hover);
          box-shadow: var(--card-shadow);
        }
        .actor-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 50%;
          margin-bottom: 10px;
          border: 2px solid rgba(255,255,255,0.05);
        }
        .trailer-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(4, 5, 10, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .trailer-modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        .trailer-modal-container {
          width: 90%;
          max-width: 960px;
          background: #0c0d16;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(229, 9, 20, 0.15);
          display: flex;
          flex-direction: column;
          transform: scale(0.85);
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .trailer-modal-overlay.active .trailer-modal-container {
          transform: scale(1);
        }
        .trailer-modal-video-ratio {
          width: 100%;
          aspect-ratio: 16 / 9;
          position: relative;
          background: #000;
        }
        #closeTrailerBtn ion-icon {
          transition: transform 0.2s ease;
        }
        #closeTrailerBtn:hover {
          color: var(--accent) !important;
        }
        #closeTrailerBtn:hover ion-icon {
          transform: scale(1.1) rotate(90deg);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 992px) {
          .details-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .poster-container {
            flex: 0 0 240px;
            max-width: 240px;
            margin: 0 auto;
          }
          .info-title {
            font-size: 2.2rem;
            margin-top: 15px;
          }
          .info-meta {
            justify-content: center;
          }
          .action-buttons {
            justify-content: center;
          }
          .tagline {
            border-left: none;
            border-top: 2px solid var(--accent);
            border-bottom: 2px solid var(--accent);
            padding: 8px 0;
            text-align: center;
          }
        }
        @media (max-width: 576px) {
          .details-hero {
            padding-top: 100px;
            padding-bottom: 30px;
            background-attachment: scroll;
          }
          .info-title {
            font-size: 1.7rem !important;
          }
          .info-meta {
            font-size: 0.82rem;
            gap: 8px;
          }
          .genre-tag {
            font-size: 0.72rem;
            padding: 2px 8px;
          }
          .tagline {
            font-size: 0.95rem;
          }
          .overview {
            font-size: 0.9rem;
            line-height: 1.6;
          }
          .action-buttons {
            flex-direction: column;
            width: 100%;
            gap: 10px;
          }
          .action-buttons .btn {
            width: 100%;
            text-align: center;
          }
          .tabs-container {
            margin-top: 40px;
            gap: 16px;
            margin-bottom: 20px;
          }
          .tab-btn {
            font-size: 0.92rem;
            padding-bottom: 8px;
          }
          .cast-grid {
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 12px;
          }
          .actor-card {
            padding: 8px;
            border-radius: 8px;
          }
          .actor-img {
            margin-bottom: 6px;
          }
        }
      `}</style>
    </>
  );
}
