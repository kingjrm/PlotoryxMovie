"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WatchClient({ details, id, type, initialSeason, initialEpisode }) {
  const router = useRouter();
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [currentServer, setCurrentServer] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [serverStatuses, setServerStatuses] = useState({});
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [watchedEpisodes, setWatchedEpisodes] = useState({});
  const [episodeDrawerOpen, setEpisodeDrawerOpen] = useState(false);
  const playerWrapperRef = useRef(null);

  const title = details.title || details.name || "Unknown";
  const backdropPath = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : "";

  const seasons = [];
  if (type === "tv" && details.seasons) {
    details.seasons.forEach((s) => {
      if (s.season_number > 0) seasons.push({ season_number: s.season_number, episode_count: s.episode_count, name: s.name });
    });
  }

  useEffect(() => {
    const a = localStorage.getItem("autoplayNext");
    if (a !== null) setAutoplayNext(JSON.parse(a));
    setWatchedEpisodes(JSON.parse(localStorage.getItem("watchedEpisodes")) || {});
  }, []);

  useEffect(() => {
    if (type !== "tv") return;
    const wl = JSON.parse(localStorage.getItem("watchedEpisodes")) || {};
    const cur = wl[id] || [];
    if (!cur.includes(currentEpisode)) {
      const updated = [...cur, currentEpisode];
      const next = { ...wl, [id]: updated };
      setWatchedEpisodes(next);
      localStorage.setItem("watchedEpisodes", JSON.stringify(next));
    }
  }, [currentEpisode, id, type]);

  useEffect(() => {
    if (type !== "tv") return;
    setEpisodesLoading(true);
    fetch(`/api/season?id=${id}&season=${currentSeason}`)
      .then(r => r.json())
      .then(d => setEpisodes(d.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setEpisodesLoading(false));
  }, [id, type, currentSeason]);

  useEffect(() => {
    fetch("/api/check_servers")
      .then(r => r.json())
      .then(d => {
        setServerStatuses(d);
        // Auto-select first online server
        const firstOnline = Object.entries(d)
          .sort(([a], [b]) => Number(a) - Number(b))
          .find(([, info]) => info.online);
        if (firstOnline) setCurrentServer(Number(firstOnline[0]));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const item = {
      id, type, title,
      poster: details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : "",
      season: currentSeason, episode: currentEpisode,
      timestamp: Date.now()
    };
    let list = JSON.parse(localStorage.getItem("continueWatching")) || [];
    list = list.filter(i => !(i.id === id && i.type === type));
    list.unshift(item);
    if (list.length > 20) list = list.slice(0, 20);
    localStorage.setItem("continueWatching", JSON.stringify(list));
  }, [id, type, currentSeason, currentEpisode]);

  const getEmbedUrl = (server, itemId, mediaType, seasonNum, episodeNum) => {
    switch (server) {
      case 1: return mediaType === "movie" ? `https://vsrc.su/embed/movie/${itemId}?autoplay=1` : `https://vsrc.su/embed/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 2: return mediaType === "movie" ? `https://vidsrcme.ru/embed/movie?tmdb=${itemId}&autoplay=1` : `https://vidsrcme.ru/embed/tv?tmdb=${itemId}&season=${seasonNum}&episode=${episodeNum}&autoplay=1`;
      case 3: return mediaType === "movie" ? `https://vidsrc.cc/v2/embed/movie/${itemId}?autoplay=1` : `https://vidsrc.cc/v2/embed/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 4: return mediaType === "movie" ? `https://vidlink.pro/movie/${itemId}?primaryColor=e50914&autoplay=true` : `https://vidlink.pro/tv/${itemId}/${seasonNum}/${episodeNum}?primaryColor=e50914&autoplay=true`;
      case 5: return mediaType === "movie" ? `https://embed.su/embed/movie/${itemId}?autoplay=1` : `https://embed.su/embed/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 6: return mediaType === "movie" ? `https://autoembed.cc/embed/movie/${itemId}?autoplay=1` : `https://autoembed.cc/embed/tv/${itemId}?s=${seasonNum}&e=${episodeNum}&autoplay=1`;
      case 7: return mediaType === "movie" ? `https://moviesapi.club/movie/${itemId}?autoplay=1` : `https://moviesapi.club/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 8: return mediaType === "movie" ? `https://multiembed.to/embed.php?type=movie&tmdb=${itemId}&autoplay=1` : `https://multiembed.to/embed.php?type=tv&tmdb=${itemId}&s=${seasonNum}&e=${episodeNum}&autoplay=1`;
      default: return `https://vsrc.su/embed/movie/${itemId}?autoplay=1`;
    }
  };

  const currentSeasonObj = seasons.find(s => s.season_number === currentSeason);
  const maxEpisodes = currentSeasonObj ? currentSeasonObj.episode_count : 1;
  const nextSeasonExists = seasons.some(s => s.season_number === currentSeason + 1);
  const nextDisabled = currentEpisode === maxEpisodes && !nextSeasonExists;
  const prevDisabled = currentEpisode === 1 && currentSeason === 1;

  const playNext = () => {
    if (currentEpisode < maxEpisodes) setCurrentEpisode(currentEpisode + 1);
    else if (nextSeasonExists) { setCurrentSeason(currentSeason + 1); setCurrentEpisode(1); }
  };
  const playPrevious = () => {
    if (currentEpisode > 1) setCurrentEpisode(currentEpisode - 1);
    else if (currentSeason > 1) {
      const prev = currentSeason - 1;
      const prevObj = seasons.find(s => s.season_number === prev);
      setCurrentSeason(prev);
      setCurrentEpisode(prevObj ? prevObj.episode_count : 1);
    }
  };

  const SERVERS = [
    "VidSrc.to", "VidSrc.me", "VidSrc.cc", "VidLink.pro",
    "Embed.su", "AutoEmbed", "MoviesAPI", "SuperEmbed"
  ];

  const currentEmbedUrl = getEmbedUrl(currentServer, id, type, currentSeason, currentEpisode);
  const currentEpObj = episodes.find(e => e.episode_number === currentEpisode);

  return (
    <>
      {/* Full-screen watch page */}
      <div className="wp-page">

        {/* -- TOP BAR -- */}
        <div className="wp-topbar">
          <div className="wp-topbar-left">
            <button className="wp-back-btn" onClick={() => router.back()}>
              <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            <div>
              <div className="wp-topbar-title">{title}</div>
              {type === "tv" && (
                <div className="wp-topbar-sub">S{currentSeason} E{currentEpisode}{currentEpObj?.name ? ` · ${currentEpObj.name}` : ""}</div>
              )}
            </div>
          </div>
          <div className="wp-topbar-right">
            {type === "tv" && !nextDisabled && (
              <button className="wp-top-btn" onClick={playNext}>
                <ion-icon name="play-skip-forward-outline"></ion-icon> Next Episode
              </button>
            )}
          </div>
        </div>

        {/* -- SERVER BAR -- */}
        <div className="wp-server-bar">
          <span className="wp-server-label">Server:</span>
          {SERVERS.map((label, i) => {
            const srvId = i + 1;
            const status = serverStatuses[srvId];
            const dotCls = status ? (status.online ? "sdot online" : "sdot offline") : "sdot testing";
            return (
              <button
                key={srvId}
                className={`wp-server-chip ${currentServer === srvId ? "active" : ""}`}
                onClick={() => setCurrentServer(srvId)}
              >
                <span className={dotCls}></span>
                {label}
              </button>
            );
          })}
        </div>

        {/* -- PLAYER -- */}
        <div
          className="wp-player-wrap"
          ref={playerWrapperRef}
          onWheel={(e) => window.scrollBy({ top: e.deltaY, behavior: "auto" })}
        >
          <iframe
            id="videoPlayer"
            src={currentEmbedUrl}
            allowFullScreen
            allow="autoplay; fullscreen *; picture-in-picture"
            className="wp-player-iframe"
          />
          {/* Transparent overlay — lets scroll pass through to parent window */}
          <div className="wp-scroll-overlay" />
        </div>

        {/* -- BOTTOM BAR -- */}
        <div className="wp-bottom-bar">
          <div className="wp-bottom-left">
            {type === "tv" && (
              <>
                <button className="wp-bottom-btn" onClick={playPrevious} disabled={prevDisabled}>
                  <ion-icon name="play-skip-back-outline"></ion-icon>
                </button>
                <button className="wp-bottom-btn" onClick={playNext} disabled={nextDisabled}>
                  <ion-icon name="play-skip-forward-outline"></ion-icon>
                </button>
              </>
            )}
            <Link href={`/details?id=${id}&type=${type}`} className="wp-bottom-btn" title="Back to Details">
              <ion-icon name="information-circle-outline"></ion-icon>
            </Link>
          </div>

          <div className="wp-bottom-center">
            {type === "tv" && (
              <button
                className="wp-episodes-btn"
                onClick={() => setEpisodeDrawerOpen(o => !o)}
              >
                Episodes <ion-icon name={episodeDrawerOpen ? "chevron-down-outline" : "chevron-up-outline"}></ion-icon>
              </button>
            )}
          </div>

          <div className="wp-bottom-right">
            <button
              className={`wp-bottom-btn ${autoplayNext ? "active" : ""}`}
              onClick={() => { const v = !autoplayNext; setAutoplayNext(v); localStorage.setItem("autoplayNext", JSON.stringify(v)); }}
              title="Auto-next"
            >
              <ion-icon name="play-forward-outline"></ion-icon>
              <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Auto</span>
            </button>
          </div>
        </div>

        {/* -- EPISODES DRAWER -- */}
        {episodeDrawerOpen && (
          <div className="wp-drawer" onClick={e => { if (e.target === e.currentTarget) setEpisodeDrawerOpen(false); }}>
            <div className="wp-drawer-panel">
              {/* Drawer header */}
              <div className="wp-drawer-header">
                <div>
                  <div className="wp-drawer-title">Episodes</div>
                  <div className="wp-drawer-sub">{title}</div>
                </div>
                <div className="wp-drawer-header-right">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <ion-icon name="play-forward-outline"></ion-icon> Auto next
                    <button
                      className={`wp-toggle ${autoplayNext ? "on" : "off"}`}
                      onClick={() => { const v = !autoplayNext; setAutoplayNext(v); localStorage.setItem("autoplayNext", JSON.stringify(v)); }}
                    >
                      <span className="wp-toggle-thumb"></span>
                    </button>
                  </div>
                  <button className="wp-drawer-close" onClick={() => setEpisodeDrawerOpen(false)}>
                    <ion-icon name="close-outline"></ion-icon>
                  </button>
                </div>
              </div>

              <div className="wp-drawer-body">
                {/* Seasons column */}
                <div className="wp-seasons-col">
                  {seasons.map(s => (
                    <button
                      key={s.season_number}
                      className={`wp-season-btn ${currentSeason === s.season_number ? "active" : ""}`}
                      onClick={() => { setCurrentSeason(s.season_number); setCurrentEpisode(1); }}
                    >
                      <span>Season {s.season_number}</span>
                      <span className="wp-season-eps">{s.episode_count} Eps</span>
                    </button>
                  ))}
                </div>

                {/* Episodes column */}
                <div className="wp-episodes-col">
                  {episodesLoading ? (
                    <div className="wp-loading">
                      <ion-icon name="sync-outline" className="spin" style={{ fontSize: "2rem" }}></ion-icon>
                    </div>
                  ) : (
                    episodes.map(ep => {
                      const epNum = ep.episode_number;
                      const isWatching = epNum === currentEpisode;
                      const isWatched = (watchedEpisodes[id] || []).includes(epNum);
                      const still = ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : backdropPath;
                      const duration = ep.runtime ? `${ep.runtime}m` : "";
                      return (
                        <div
                          key={ep.id}
                          className={`wp-ep-row ${isWatching ? "watching" : ""}`}
                          onClick={() => { setCurrentEpisode(epNum); setEpisodeDrawerOpen(false); }}
                        >
                          <div className="wp-ep-thumb">
                            {still && <img src={still} alt={ep.name} loading="lazy" />}
                            {!isWatching && (
                              <div className="wp-ep-thumb-overlay">
                                <ion-icon name="play-outline"></ion-icon>
                              </div>
                            )}
                          </div>
                          <div className="wp-ep-info">
                            <div className="wp-ep-header-row">
                              <div className="wp-ep-title">{ep.name || `Episode ${epNum}`}</div>
                              {isWatching && <span className="wp-watching-badge">Watching</span>}
                            </div>
                            <div className="wp-ep-meta">S{currentSeason} E{epNum}{duration ? ` · ${duration}` : ""}</div>
                            {ep.overview && <div className="wp-ep-overview">{ep.overview}</div>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* -- PICKS FOR YOU -- */}
      {details.recommendations?.results?.filter(r => r.backdrop_path).length > 0 && (
        <div className="wp-picks">
          <div className="wp-picks-header">
            <span className="wp-picks-title">Picks for You</span>
            <span className="wp-picks-sub">More titles you might enjoy</span>
          </div>
          <div className="wp-picks-grid">
            {details.recommendations.results
              .filter(r => r.backdrop_path)
              .slice(0, 12)
              .map(item => {
                const recTitle = item.title || item.name;
                const recType = item.title ? "movie" : "tv";
                const recYear = (item.release_date || item.first_air_date || "").substring(0, 4);
                const recRating = item.vote_average ? (Math.round(item.vote_average * 10) / 10).toFixed(1) : null;
                const recBackdrop = `https://image.tmdb.org/t/p/w500${item.backdrop_path}`;
                return (
                  <Link key={item.id} href={`/details?id=${item.id}&type=${recType}`} className="wp-pick-card">
                    <div className="wp-pick-thumb">
                      <img src={recBackdrop} alt={recTitle} loading="lazy" />
                      <div className="wp-pick-overlay">
                        <ion-icon name="play-circle-outline"></ion-icon>
                      </div>
                    </div>
                    <div className="wp-pick-info">
                      <div className="wp-pick-name">{recTitle}</div>
                      <div className="wp-pick-meta">
                        {recRating && <span className="wp-pick-rating">⭐ {recRating}</span>}
                        {recYear && <span>{recYear}</span>}
                        <span className="wp-pick-type">{recType === "movie" ? "Movie" : "TV"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      <style jsx>{`
        .wp-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #000;
          padding-top: var(--header-height);
        }
        /* Top bar */
        .wp-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background: rgba(0,0,0,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 16px;
        }
        .wp-topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }
        .wp-back-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .wp-back-btn:hover { background: rgba(255,255,255,0.12); }
        .wp-topbar-title {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wp-topbar-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 1px;
        }
        .wp-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .wp-top-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.07);
          color: white;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .wp-top-btn:hover { background: rgba(255,255,255,0.14); }
        /* Server bar */
        .wp-server-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 24px;
          background: #0a0a0a;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow-x: auto;
          scrollbar-width: none;
          flex-wrap: wrap;
        }
        .wp-server-bar::-webkit-scrollbar { display: none; }
        .wp-server-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          white-space: nowrap;
          margin-right: 4px;
        }
        .wp-server-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .wp-server-chip:hover {
          background: rgba(255,255,255,0.09);
          color: white;
        }
        .wp-server-chip.active {
          background: rgba(229,9,20,0.15);
          border-color: rgba(229,9,20,0.5);
          color: white;
        }
        .sdot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #888;
          flex-shrink: 0;
        }
        .sdot.online { background: #2ec4b6; box-shadow: 0 0 5px rgba(46,196,182,0.6); }
        .sdot.offline { background: #e50914; }
        .sdot.testing { background: #f5c518; animation: blink 1s infinite alternate; }
        @keyframes blink { from { opacity: 0.4; } to { opacity: 1; } }
        /* Player */
        .wp-player-wrap {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          aspect-ratio: 16/9;
          background: #000;
          position: relative;
          overflow: hidden;
        }
        .wp-player-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        /* Transparent overlay so wheel scroll passes through to page */
        .wp-scroll-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        /* Bottom bar */
        .wp-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 24px;
          background: rgba(0,0,0,0.95);
          border-top: 1px solid rgba(255,255,255,0.05);
          min-height: 52px;
        }
        .wp-bottom-left, .wp-bottom-right {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 120px;
        }
        .wp-bottom-right { justify-content: flex-end; }
        .wp-bottom-center { display: flex; justify-content: center; flex: 1; }
        .wp-bottom-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .wp-bottom-btn:hover { background: rgba(255,255,255,0.12); }
        .wp-bottom-btn.active { border-color: rgba(229,9,20,0.5); color: var(--accent); }
        .wp-bottom-btn:disabled { opacity: 0.3; pointer-events: none; }
        .wp-episodes-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.07);
          color: white;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wp-episodes-btn:hover { background: rgba(255,255,255,0.14); }
        /* Episodes drawer */
        .wp-drawer {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .wp-drawer-panel {
          width: 100%;
          max-width: 940px;
          max-height: 80vh;
          background: rgba(16,16,16,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          animation: drawerFadeIn 0.25s ease;
          box-shadow: 0 24px 80px rgba(0,0,0,0.8);
        }
        @keyframes drawerFadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .wp-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .wp-drawer-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
        }
        .wp-drawer-sub {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .wp-drawer-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .wp-drawer-close {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: white;
          font-size: 1.2rem;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .wp-drawer-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        /* Seasons column */
        .wp-seasons-col {
          width: 190px;
          flex-shrink: 0;
          overflow-y: auto;
          border-right: 1px solid rgba(255,255,255,0.07);
          padding: 8px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .wp-season-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          margin-bottom: 2px;
        }
        .wp-season-btn:hover { background: rgba(255,255,255,0.05); color: white; }
        .wp-season-btn.active {
          background: rgba(255,255,255,0.08);
          color: white;
          border-left: 2px solid var(--accent);
          padding-left: 10px;
        }
        .wp-season-eps {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        /* Episodes column */
        .wp-episodes-col {
          flex: 1;
          overflow-y: auto;
          padding: 8px 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .wp-ep-row {
          display: flex;
          gap: 16px;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
          margin-bottom: 4px;
        }
        .wp-ep-row:hover { background: rgba(255,255,255,0.05); }
        .wp-ep-row.watching { background: rgba(255,255,255,0.07); }
        .wp-ep-thumb {
          flex: 0 0 140px;
          aspect-ratio: 16/9;
          border-radius: 7px;
          overflow: hidden;
          background: #1a1a1a;
          position: relative;
        }
        .wp-ep-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .wp-ep-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .wp-ep-row:hover .wp-ep-thumb-overlay { opacity: 1; }
        .wp-ep-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .wp-ep-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .wp-ep-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wp-watching-badge {
          font-size: 0.68rem;
          font-weight: 700;
          background: var(--accent);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .wp-ep-meta {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .wp-ep-overview {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .wp-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px;
          color: var(--text-secondary);
        }
        /* Toggle switch */
        .wp-toggle {
          width: 36px; height: 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
        }
        .wp-toggle.on { background: var(--accent); }
        .wp-toggle.off { background: rgba(255,255,255,0.15); }
        .wp-toggle-thumb {
          position: absolute;
          top: 2px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          transition: left 0.2s;
        }
        .wp-toggle.on .wp-toggle-thumb { left: 18px; }
        .wp-toggle.off .wp-toggle-thumb { left: 2px; }
        @media (max-width: 600px) {
          .wp-topbar { padding: 10px 14px; }
          .wp-server-bar { padding: 6px 14px; }
          .wp-bottom-bar { padding: 8px 14px; }
          .wp-seasons-col { width: 130px; }
          .wp-ep-thumb { flex: 0 0 100px; }
          .wp-drawer-panel { max-height: 90vh; }
        }
        /* Picks for You */
        .wp-picks {
          background: #080808;
          padding: 28px 28px 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .wp-picks-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 18px;
        }
        .wp-picks-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: white;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1.5px;
        }
        .wp-picks-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .wp-picks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }
        .wp-pick-card {
          border-radius: 10px;
          overflow: hidden;
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          text-decoration: none;
          transition: transform 0.2s, border-color 0.2s;
        }
        .wp-pick-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.16); }
        .wp-pick-thumb {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .wp-pick-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .wp-pick-card:hover .wp-pick-thumb img { transform: scale(1.05); }
        .wp-pick-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .wp-pick-card:hover .wp-pick-overlay { opacity: 1; }
        .wp-pick-info { padding: 10px 12px 12px; }
        .wp-pick-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wp-pick-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          font-size: 0.72rem;
          color: var(--text-secondary);
        }
        .wp-pick-rating { color: #ffb12a; }
        .wp-pick-type {
          background: rgba(229,9,20,0.12);
          color: var(--accent);
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        @media (max-width: 600px) {
          .wp-picks { padding: 20px 16px 30px; }
          .wp-picks-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>
    </>
  );
}
