"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DetailsClient({ details, id, type }) {
  const router = useRouter();

  const [inWatchlist, setInWatchlist] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [castModalOpen, setCastModalOpen] = useState(false);
  const [selectedActorId, setSelectedActorId] = useState(null);
  const iframeRef = useRef(null);

  const title = details.title || details.name || "Unknown";
  const releaseDate = details.release_date || details.first_air_date || "";
  const year = releaseDate ? releaseDate.substring(0, 4) : "";
  const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]);
  const numberOfSeasons = details.number_of_seasons;
  const numberOfEpisodes = details.number_of_episodes;
  const backdropPath = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : "";
  const voteAverage = details.vote_average ? (Math.round(details.vote_average * 10) / 10).toFixed(1) : null;
  const contentRating = details.content_ratings?.results?.find(r => r.iso_3166_1 === "US")?.rating
    || details.release_dates?.results?.find(r => r.iso_3166_1 === "US")?.release_dates?.[0]?.certification
    || null;

  // Find trailer
  let trailerKey = "";
  if (details.videos?.results) {
    for (const v of details.videos.results) {
      if (v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) {
        trailerKey = v.key;
        break;
      }
    }
  }

  // Season 1 episodes
  const season1 = details.seasons?.find(s => s.season_number === 1);
  const episodes = details.season_episodes || [];

  const cast = details.credits?.cast?.slice(0, 20) || [];
  const recs = details.recommendations?.results?.filter(r => r.backdrop_path).slice(0, 12) || [];

  useEffect(() => {
    const wl = JSON.parse(localStorage.getItem("watchlist")) || [];
    setInWatchlist(wl.some(item => item.id === id && item.type === type));
  }, [id, type]);

  const toggleWatchlist = () => {
    let wl = JSON.parse(localStorage.getItem("watchlist")) || [];
    const idx = wl.findIndex(item => item.id === id && item.type === type);
    if (idx > -1) {
      wl.splice(idx, 1);
      setInWatchlist(false);
      showToast("Removed from Watchlist");
    } else {
      wl.push({ id, type, title, poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "" });
      setInWatchlist(true);
      showToast("Added to Watchlist");
    }
    localStorage.setItem("watchlist", JSON.stringify(wl));
  };

  const showToast = (msg) => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message: msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 3100);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    // Reload iframe with new mute param
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = src
        .replace(/&mute=[01]/, "")
        .replace(/\?mute=[01]/, "?")
        + `&mute=${newMuted ? 1 : 0}`;
    }
  };

  const videoSrc = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0&showinfo=0`
    : null;

  return (
    <>
      {/* ---- HERO: VIDEO BACKGROUND ---- */}
      <div className="details-video-hero">
        {/* Back button */}
        <button className="details-back-btn" onClick={() => router.back()} aria-label="Go back">
          <ion-icon name="chevron-back-outline"></ion-icon>
        </button>

        {/* Video / Backdrop background */}
        <div className="details-video-bg">
          {videoSrc ? (
            <iframe
              ref={iframeRef}
              src={videoSrc}
              allow="autoplay; fullscreen"
              title="Background trailer"
            />
          ) : (
            backdropPath && (
              <div className="details-backdrop-fallback" style={{ backgroundImage: `url('${backdropPath}')` }} />
            )
          )}
          <div className="details-video-gradient" />
        </div>

        {/* Top-right controls */}
        {videoSrc && (
          <div className="details-video-controls">
            <button className="details-vid-btn" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
              <ion-icon name={isMuted ? "volume-mute-outline" : "volume-high-outline"}></ion-icon>
            </button>
          </div>
        )}

        {/* Hero Content — bottom left */}
        <div className="details-hero-content">
          <h1 className="details-title-text">{title}</h1>

          <div className="details-meta-row">
            {voteAverage && (
              <span className="details-meta-rating">
                <ion-icon name="star"></ion-icon> {voteAverage}
              </span>
            )}
            {runtime && <span>{runtime} min</span>}
            {numberOfSeasons && (
              <span>{numberOfSeasons} Season{numberOfSeasons > 1 ? "s" : ""}</span>
            )}
            {year && <span>{year}</span>}
            {contentRating && <span className="details-badge">{contentRating}</span>}
          </div>

          <div className="details-genre-row">
            {details.genres?.map((g, i) => (
              <span key={g.id} className="details-genre-pill">{g.name}</span>
            ))}
          </div>

          <p className="details-overview">{details.overview}</p>

          <div className="details-action-row">
            <Link href={`/watch?id=${id}&type=${type}`} className="details-btn-play">
              <ion-icon name="play" style={{ fontSize: "1.1rem" }}></ion-icon> Play
            </Link>
            <button
              className={`details-btn-list ${inWatchlist ? "active" : ""}`}
              onClick={toggleWatchlist}
            >
              <ion-icon name={inWatchlist ? "checkmark-outline" : "add-outline"}></ion-icon>
              {inWatchlist ? "In List" : "+ Add to List"}
            </button>
          </div>
        </div>
      </div>

      {/* ---- CONTENT BELOW HERO ---- */}
      <div className="details-section">
        <div className="details-section-inner">

          {/* Episodes Section (TV only) */}
          {type === "tv" && (season1 || episodes.length > 0) && (
            <div>
              <div className="details-season-header">
                <div>
                  <div className="details-season-title">
                    {season1 ? season1.name || "Season 1" : "Season 1"}
                  </div>
                  {(season1?.episode_count || numberOfEpisodes) && (
                    <div className="details-season-sub">
                      {season1?.episode_count || numberOfEpisodes} episodes
                    </div>
                  )}
                </div>
              </div>

              <div className="details-episode-scroll">
                {episodes.length > 0 ? (
                  episodes.map((ep, i) => {
                    const epThumb = ep.still_path
                      ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                      : backdropPath;
                    const epRating = ep.vote_average && ep.vote_average > 0
                      ? (Math.round(ep.vote_average * 10) / 10).toFixed(1)
                      : null;
                    return (
                      <Link
                        key={ep.id || i}
                        href={`/watch?id=${id}&type=${type}&season=1&ep=${ep.episode_number || i + 1}`}
                        className="details-ep-card"
                      >
                        <div className="details-ep-thumb">
                          {epThumb && <img src={epThumb} alt={ep.name} loading="lazy" />}
                          <div className="details-ep-thumb-overlay" />
                          <div className="details-ep-num-label">Episode {ep.episode_number || i + 1}</div>
                          <div className="details-ep-play-icon">
                            <ion-icon name="play-circle-outline"></ion-icon>
                          </div>
                        </div>
                        <div className="details-ep-body">
                          <div className="details-ep-title">{ep.name || `Episode ${i + 1}`}</div>
                          <div className="details-ep-desc">{ep.overview || "No description available."}</div>
                          <div className="details-ep-footer">
                            <span className="ep-duration">
                              <ion-icon name="play-outline"></ion-icon>
                              {ep.runtime ? `${ep.runtime}m` : "—"}
                            </span>
                            {epRating && (
                              <span className="ep-rating">
                                <ion-icon name="star"></ion-icon> {epRating}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  // Fallback: show placeholder cards from season info
                  Array.from({ length: Math.min(season1?.episode_count || 8, 10) }).map((_, i) => (
                    <Link
                      key={i}
                      href={`/watch?id=${id}&type=${type}&season=1&ep=${i + 1}`}
                      className="details-ep-card"
                    >
                      <div className="details-ep-thumb" style={{ background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {backdropPath && <img src={backdropPath} alt={`Episode ${i + 1}`} loading="lazy" style={{ opacity: 0.4 }} />}
                        <div className="details-ep-thumb-overlay" />
                        <div className="details-ep-num-label">Episode {i + 1}</div>
                        <div className="details-ep-play-icon"><ion-icon name="play-circle-outline"></ion-icon></div>
                      </div>
                      <div className="details-ep-body">
                        <div className="details-ep-title">Episode {i + 1}</div>
                        <div className="details-ep-desc">Watch episode {i + 1} of {title}.</div>
                        <div className="details-ep-footer">
                          <span className="ep-duration"><ion-icon name="play-outline"></ion-icon> —</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Cast Section */}
          {cast.length > 0 && (
            <div>
              <div className="details-section-heading">
                <div>
                  <h2>Cast</h2>
                  <p>The cast behind this title</p>
                </div>
              </div>
              <div className="details-cast-scroll">
                {cast.map((actor, idx) => {
                  const img = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null;
                  return (
                    <div key={`${actor.id}-${idx}`} className="details-cast-card">
                      {img ? (
                        <img className="details-cast-img" src={img} alt={actor.name} loading="lazy" />
                      ) : (
                        <div className="details-cast-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: "var(--text-secondary)", background: "#1a1a1a" }}>
                          {actor.name.charAt(0)}
                        </div>
                      )}
                      <div className="details-cast-info">
                        <div className="details-cast-name">{actor.name}</div>
                        <div className="details-cast-char">{actor.character}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recs.length > 0 && (
            <div>
              <div className="details-section-heading">
                <div>
                  <h2>You may like</h2>
                  <p>More titles like this one</p>
                </div>
              </div>
              <div className="details-recs-grid">
                {recs.map((item, idx) => {
                  const recTitle = item.title || item.name;
                  const recType = item.title ? "movie" : "tv";
                  const recYear = (item.release_date || item.first_air_date || "").substring(0, 4);
                  const recRating = item.vote_average ? (Math.round(item.vote_average * 10) / 10).toFixed(1) : null;
                  const recBackdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : "";
                  return (
                    <Link key={`${item.id}-${idx}`} href={`/details?id=${item.id}&type=${recType}`} className="details-rec-card">
                      <div className="details-rec-thumb">
                        {recBackdrop && <img src={recBackdrop} alt={recTitle} loading="lazy" />}
                      </div>
                      <div className="details-rec-title">{recTitle}</div>
                      <div className="details-rec-meta">
                        {recRating && (
                          <span className="details-rec-rating">
                            <ion-icon name="star"></ion-icon> {recRating}
                          </span>
                        )}
                        {recYear && <><span className="meta-dot"></span><span>{recYear}</span></>}
                        <span className="meta-dot"></span>
                        <span>{recType === "movie" ? "Movie" : "TV Show"}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast Notifications */}
      <div style={{ position: "fixed", bottom: "25px", right: "25px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999, pointerEvents: "none" }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: "rgba(20,20,20,0.95)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "12px 20px", borderRadius: "8px", fontSize: "0.88rem", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: "10px", pointerEvents: "auto" }}>
            <ion-icon name="bookmark" style={{ color: "#e50914", fontSize: "1.1rem" }}></ion-icon>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
