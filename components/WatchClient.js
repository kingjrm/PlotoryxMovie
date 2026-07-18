"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function WatchClient({ details, id, type, initialSeason, initialEpisode }) {
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [currentServer, setCurrentServer] = useState(1);
  const [theaterMode, setTheaterMode] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [serverStatuses, setServerStatuses] = useState({});
  const playerWrapperRef = useRef(null);

  const [autoplayNext, setAutoplayNext] = useState(true);
  const [watchedEpisodes, setWatchedEpisodes] = useState({});
  const [expandedEpisodeId, setExpandedEpisodeId] = useState(null);

  // Load autoplay settings and watched list
  useEffect(() => {
    const autoplay = localStorage.getItem("autoplayNext");
    if (autoplay !== null) {
      setAutoplayNext(JSON.parse(autoplay));
    }
    const watched = JSON.parse(localStorage.getItem("watchedEpisodes")) || {};
    setWatchedEpisodes(watched);
  }, []);

  // Auto mark current episode as watched
  useEffect(() => {
    if (type !== "tv") return;
    const currentShowWatched = watchedEpisodes[id] || [];
    if (!currentShowWatched.includes(currentEpisode)) {
      const updated = [...currentShowWatched, currentEpisode];
      const nextWatched = { ...watchedEpisodes, [id]: updated };
      setWatchedEpisodes(nextWatched);
      localStorage.setItem("watchedEpisodes", JSON.stringify(nextWatched));
    }
  }, [currentEpisode, id, type]);


  const title = details.title || details.name || "Unknown";
  const backdropPath = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : "";
  const posterPath = details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : "";

  // Parse seasons
  const seasons = [];
  if (type === "tv" && details.seasons) {
    details.seasons.forEach((s) => {
      if (s.season_number > 0) {
        seasons.push({
          season_number: s.season_number,
          episode_count: s.episode_count,
          name: s.name,
        });
      }
    });
  }

  // Load episodes when currentSeason changes
  useEffect(() => {
    if (type !== "tv") return;

    const fetchEpisodes = async () => {
      setEpisodesLoading(true);
      try {
        const res = await fetch(`/api/season?id=${id}&season=${currentSeason}`);
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (err) {
        console.error("Error loading season episodes:", err);
        setEpisodes([]);
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [id, type, currentSeason]);

  // Check server statuses on mount
  useEffect(() => {
    const checkServers = async () => {
      try {
        const res = await fetch("/api/check_servers");
        const data = await res.json();
        setServerStatuses(data);

        // Auto-switch to first online server if default is offline
        let firstOnlineServer = null;
        for (const [srvId, info] of Object.entries(data)) {
          if (info.online) {
            firstOnlineServer = parseInt(srvId);
            break;
          }
        }

        if (data[currentServer] && !data[currentServer].online && firstOnlineServer) {
          console.log(`Default server ${currentServer} offline. Auto-switching to first online server: ${firstOnlineServer}`);
          setCurrentServer(firstOnlineServer);
        }
      } catch (err) {
        console.error("Error checking servers:", err);
      }
    };

    checkServers();
  }, []);

  // Save state to Continue Watching on page load / change
  useEffect(() => {
    const saveContinueWatching = () => {
      const continueItem = {
        id,
        type,
        title,
        poster: posterPath,
        backdrop: backdropPath,
        season: type === "tv" ? currentSeason : null,
        episode: type === "tv" ? currentEpisode : null,
        timestamp: Date.now(),
      };

      let list = JSON.parse(localStorage.getItem("continueWatching")) || [];
      list = list.filter((item) => !(item.id === id && item.type === type));
      list.unshift(continueItem);
      if (list.length > 12) list.pop();
      localStorage.setItem("continueWatching", JSON.stringify(list));
    };

    saveContinueWatching();
  }, [id, type, currentSeason, currentEpisode, title, posterPath, backdropPath]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // Listen for iframe ended event message
  useEffect(() => {
    const handleMessage = (event) => {
      let data = event.data;
      if (!data) return;

      let isEnded = false;
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === "object") data = parsed;
        } catch (e) {}
      }

      if (typeof data === "string") {
        const lowerData = data.toLowerCase();
        if (lowerData === "ended" || lowerData === "vidlink_ended" || lowerData === "vidsrc_ended") {
          isEnded = true;
        }
      } else if (typeof data === "object") {
        if (data.type === "PLAYER_EVENT" && data.data && data.data.event === "ended") {
          isEnded = true;
        } else if (data.event === "ended" || data.type === "ended" || data.event === "video_ended") {
          isEnded = true;
        } else if (data.data && (data.data.event === "ended" || data.data.type === "ended")) {
          isEnded = true;
        }
      }

      if (isEnded && type === "tv" && autoplayNext) {
        console.log("Autoplay next episode triggered.");
        playNext();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentSeason, currentEpisode, episodes]);

  // Embed URL helper
  const getEmbedUrl = (server, itemId, mediaType, seasonNum, episodeNum) => {
    switch (server) {
      case 1: // VidSrc.to (Using active vsrc.su mirror)
        return mediaType === "movie"
          ? `https://vsrc.su/embed/movie/${itemId}?autoplay=1`
          : `https://vsrc.su/embed/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 2: // VidSrc.me (Using active vidsrcme.ru mirror)
        return mediaType === "movie"
          ? `https://vidsrcme.ru/embed/movie?tmdb=${itemId}&autoplay=1`
          : `https://vidsrcme.ru/embed/tv?tmdb=${itemId}&season=${seasonNum}&episode=${episodeNum}&autoplay=1`;
      case 3: // VidSrc.cc
        return mediaType === "movie"
          ? `https://vidsrc.cc/v2/embed/movie/${itemId}?autoplay=1`
          : `https://vidsrc.cc/v2/embed/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 4: // VidLink.pro
        return mediaType === "movie"
          ? `https://vidlink.pro/movie/${itemId}?primaryColor=e50914&autoplay=true`
          : `https://vidlink.pro/tv/${itemId}/${seasonNum}/${episodeNum}?primaryColor=e50914&autoplay=true`;
      case 5: // Embed.su
        return mediaType === "movie"
          ? `https://embed.su/embed/movie/${itemId}?autoplay=1`
          : `https://embed.su/embed/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 6: // AutoEmbed
        return mediaType === "movie"
          ? `https://autoembed.cc/embed/movie/${itemId}?autoplay=1`
          : `https://autoembed.cc/embed/tv/${itemId}?s=${seasonNum}&e=${episodeNum}?autoplay=1`;
      case 7: // MoviesAPI.club
        return mediaType === "movie"
          ? `https://moviesapi.club/movie/${itemId}?autoplay=1`
          : `https://moviesapi.club/tv/${itemId}/${seasonNum}/${episodeNum}?autoplay=1`;
      case 8: // SuperEmbed
        return mediaType === "movie"
          ? `https://multiembed.to/embed.php?type=movie&tmdb=${itemId}&autoplay=1`
          : `https://multiembed.to/embed.php?type=tv&tmdb=${itemId}&s=${seasonNum}&e=${episodeNum}&autoplay=1`;
      default:
        return `https://vsrc.su/embed/movie/${itemId}?autoplay=1`;
    }
  };

  const playPrevious = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    } else if (currentSeason > 1) {
      const prevSeason = currentSeason - 1;
      const prevSeasonObj = seasons.find((s) => s.season_number === prevSeason);
      const prevMaxEpisodes = prevSeasonObj ? prevSeasonObj.episode_count : 1;
      setCurrentSeason(prevSeason);
      setCurrentEpisode(prevMaxEpisodes);
    }
  };

  const playNext = () => {
    const currentSeasonObj = seasons.find((s) => s.season_number === currentSeason);
    const maxEpisodes = currentSeasonObj ? currentSeasonObj.episode_count : 1;

    if (currentEpisode < maxEpisodes) {
      setCurrentEpisode(currentEpisode + 1);
    } else {
      const nextSeasonExists = seasons.some((s) => s.season_number === currentSeason + 1);
      if (nextSeasonExists) {
        setCurrentSeason(currentSeason + 1);
        setCurrentEpisode(1);
      }
    }
  };

  const toggleFullscreen = () => {
    const el = playerWrapperRef.current;
    if (!el) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Build play states for buttons disabled
  const currentSeasonObj = seasons.find((s) => s.season_number === currentSeason);
  const maxEpisodes = currentSeasonObj ? currentSeasonObj.episode_count : 1;
  const prevDisabled = currentEpisode === 1 && currentSeason === 1;
  const nextSeasonExists = seasons.some((s) => s.season_number === currentSeason + 1);
  const nextDisabled = currentEpisode === maxEpisodes && !nextSeasonExists;

  const currentEmbedUrl = getEmbedUrl(currentServer, id, type, currentSeason, currentEpisode);

  return (
    <>
      {/* Lights Off overlay */}
      {lightsOff && (
        <div
          className="lights-off-overlay"
          id="lightsOffOverlay"
          style={{ opacity: 1, pointerEvents: "all" }}
          onClick={() => setLightsOff(false)}
        ></div>
      )}

      <div className={`watch-container ${lightsOff ? "lights-off-active" : ""}`}>
        <div className="container">
          <div className={`watch-grid ${theaterMode ? "theater-active" : ""}`} id="watchGrid">
            
            {/* Video Player Box */}
            <div className="player-container" id="playerContainer" style={{ zIndex: lightsOff ? 999 : "auto" }}>
              <div className="player-wrapper" ref={playerWrapperRef}>
                <iframe
                  id="videoPlayer"
                  src={currentEmbedUrl}
                  allowFullScreen
                  allow="autoplay; fullscreen *; picture-in-picture"
                ></iframe>
              </div>

              {/* Player Navigation controls for TV */}
              {type === "tv" && (
                <div className="player-navigation-bar" id="playerNavBar" style={{ display: "flex" }}>
                  <button className="nav-episode-btn" id="prevEpisodeBtn" onClick={playPrevious} disabled={prevDisabled}>
                    <ion-icon name="play-back-outline"></ion-icon> Previous
                  </button>
                  <span id="playerNavIndicator">
                    Season {currentSeason}, Episode {currentEpisode}
                  </span>
                  <button className="nav-episode-btn" id="nextEpisodeBtn" onClick={playNext} disabled={nextDisabled}>
                    Next <ion-icon name="play-forward-outline"></ion-icon>
                  </button>
                </div>
              )}

              {/* Server selector */}
              <div className="server-panel">
                <div className="server-panel-header">
                  <h4>
                    <ion-icon name="server-outline"></ion-icon> Stream Servers
                  </h4>
                  <span>If the video doesn&apos;t load, switch to another server</span>
                </div>
                <div className="server-grid">
                  {[
                    "Server 1 (VidSrc.to / Mirror)",
                    "Server 2 (VidSrc.me / Mirror)",
                    "Server 3 (VidSrc.cc)",
                    "Server 4 (VidLink.pro)",
                    "Server 5 (Embed.su)",
                    "Server 6 (AutoEmbed.cc)",
                    "Server 7 (MoviesAPI.club)",
                    "Server 8 (SuperEmbed)",
                  ].map((label, index) => {
                    const srvId = index + 1;
                    const status = serverStatuses[srvId];
                    let dotClass = "status-dot testing";
                    if (status) {
                      dotClass = status.online ? "status-dot online" : "status-dot offline";
                    }

                    return (
                      <button
                        key={srvId}
                        className={`server-btn ${currentServer === srvId ? "active" : ""}`}
                        onClick={() => setCurrentServer(srvId)}
                      >
                        <span className={dotClass} id={`status-dot-${srvId}`}></span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Left Description Box */}
            <div className="watch-left">
              <h1 id="playingTitle" style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "10px", fontFamily: "var(--font-family-title)" }}>
                {title}
              </h1>
              {type === "tv" && (
                <h3 id="episodeSubtitle" style={{ color: "var(--accent)", marginBottom: "15px", fontWeight: 600, fontFamily: "var(--font-family-title)" }}>
                  Season {currentSeason}, Episode {currentEpisode}
                </h3>
              )}
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "1.02rem" }}>{details.overview}</p>

              <div style={{ marginTop: "35px" }}>
                <Link href={`/details?id=${id}&type=${type}`} className="btn btn-secondary">
                  <ion-icon name="arrow-back" style={{ fontSize: "1.1rem" }}></ion-icon> Back to Details
                </Link>
              </div>
            </div>

            {/* Right Sidebar Selector Box */}
            <div className="watch-right">
              <div className="sidebar-panel">
                
                {/* TV Episode selector list */}
                {type === "tv" && seasons.length > 0 && (
                  <div className="sidebar-section">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h4 className="sidebar-title" style={{ marginBottom: 0, fontSize: "0.9rem" }}>
                        <ion-icon name="list-outline"></ion-icon> Seasons
                      </h4>
                    </div>

                    <div className="season-select-wrapper">
                      <select id="seasonSelect" value={currentSeason} onChange={(e) => {
                        setCurrentSeason(parseInt(e.target.value));
                        setCurrentEpisode(1);
                      }}>
                        {seasons.map((s) => (
                          <option key={s.season_number} value={s.season_number}>
                            {s.name} ({s.episode_count} Ep)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="episode-box">
                      <div className="episode-box-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <ion-icon name="tv-outline" style={{ color: "#f5c518", fontSize: "1.1rem" }}></ion-icon>
                          <span id="activeSeasonTitle" style={{ fontWeight: 700, fontFamily: "var(--font-family-title)", fontSize: "0.85rem" }}>
                            Season {currentSeason}
                          </span>
                          <span id="episodeCountBadge" style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, marginLeft: "4px" }}>
                            ({episodes.length} eps)
                          </span>
                        </div>
                        
                        {/* Premium Autoplay switch toggle */}
                        <button
                          onClick={() => {
                            const nextVal = !autoplayNext;
                            setAutoplayNext(nextVal);
                            localStorage.setItem("autoplayNext", JSON.stringify(nextVal));
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: autoplayNext ? "var(--accent)" : "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: "1.15rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "color 0.2s ease"
                          }}
                          title="Autoplay Next Episode"
                        >
                          <ion-icon name={autoplayNext ? "flash" : "flash-off"}></ion-icon>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>Autoplay</span>
                        </button>
                      </div>
                      <div className="episode-list" id="episodeList">
                        {episodesLoading ? (
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", color: "var(--text-secondary)" }}>
                            <div style={{ textAlign: "center" }}>
                              <ion-icon name="sync-outline" className="spin" style={{ fontSize: "2rem", marginBottom: "10px", color: "#f5c518" }}></ion-icon>
                              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Loading episodes...</div>
                            </div>
                          </div>
                        ) : episodes.length > 0 ? (
                          episodes.map((ep) => {
                            const epNum = parseInt(ep.episode_number);
                            const epName = ep.name || `Episode ${epNum}`;
                            const duration = ep.runtime ? `${ep.runtime}m` : "45m";
                            const stillPath = ep.still_path ? `https://image.tmdb.org/t/p/w185${ep.still_path}` : "";
                            const isWatched = (watchedEpisodes[id] || []).includes(epNum);
                            const isExpanded = expandedEpisodeId === ep.id;

                            return (
                              <div
                                key={ep.id}
                                className={`episode-row ${epNum === currentEpisode ? "active" : ""}`}
                                onClick={() => setCurrentEpisode(epNum)}
                              >
                                <div className="episode-row-header">
                                  <div className="episode-thumb-container">
                                    {stillPath ? (
                                      <img src={stillPath} alt={epName} loading="lazy" />
                                    ) : (
                                      <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", background: "#161827" }}>
                                        <ion-icon name="play" style={{ fontSize: "1.5rem", color: "rgba(255,255,255,0.05)" }}></ion-icon>
                                      </div>
                                    )}
                                    <div className="episode-play-overlay">
                                      <ion-icon name="play-sharp"></ion-icon>
                                    </div>
                                  </div>
                                  <div className="episode-row-info">
                                    <div className="episode-row-title-row">
                                      <span className="episode-row-number-title">
                                        {epNum}. {epName}
                                      </span>
                                      <span className="episode-row-duration">{duration}</span>
                                    </div>
                                    
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", width: "100%" }}>
                                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                        {ep.air_date ? ep.air_date.substring(0, 4) : ""}
                                      </span>
                                      
                                      <div className="episode-row-actions">
                                        {/* Watched Toggle Checkmark */}
                                        <button
                                          className={`episode-action-btn ${isWatched ? "watched-active" : ""}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const showWatched = watchedEpisodes[id] || [];
                                            let updated;
                                            if (showWatched.includes(epNum)) {
                                              updated = showWatched.filter(n => n !== epNum);
                                            } else {
                                              updated = [...showWatched, epNum];
                                            }
                                            const nextWatched = { ...watchedEpisodes, [id]: updated };
                                            setWatchedEpisodes(nextWatched);
                                            localStorage.setItem("watchedEpisodes", JSON.stringify(nextWatched));
                                          }}
                                          title={isWatched ? "Mark Unwatched" : "Mark Watched"}
                                        >
                                          <ion-icon name={isWatched ? "checkmark-circle" : "checkmark-circle-outline"}></ion-icon>
                                        </button>

                                        {/* Overview Description Chevron Toggle */}
                                        {ep.overview && (
                                          <button
                                            className={`episode-action-btn ${isExpanded ? "chevron-active" : ""}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedEpisodeId(isExpanded ? null : ep.id);
                                            }}
                                            title="View Synopsis"
                                          >
                                            <ion-icon name="chevron-down-outline"></ion-icon>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Overview Synopsis Card */}
                                {isExpanded && ep.overview && (
                                  <div className="episode-details-panel">
                                    <div className="episode-details-meta">
                                      <span>Aired: {ep.air_date ? new Date(ep.air_date).toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"}) : "N/A"}</span>
                                      {ep.vote_average > 0 && (
                                        <span style={{ color: "#ffb12a", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                          <ion-icon name="star"></ion-icon> {ep.vote_average.toFixed(1)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="episode-details-overview">{ep.overview}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            No episodes found.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Control settings */}
                <div className="sidebar-section">
                  <h4 className="sidebar-title">
                    <ion-icon name="options-outline"></ion-icon> Settings
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      className={`action-control-btn ${theaterMode ? "active" : ""}`}
                      onClick={() => setTheaterMode(!theaterMode)}
                    >
                      <ion-icon name="tv-outline" style={{ fontSize: "1.1rem" }}></ion-icon> Theater Mode
                    </button>
                    <button
                      className={`action-control-btn ${lightsOff ? "active" : ""}`}
                      onClick={() => setLightsOff(!lightsOff)}
                    >
                      <ion-icon name="bulb-outline" style={{ fontSize: "1.1rem" }}></ion-icon> Lights Off
                    </button>
                    <button
                      className={`action-control-btn ${isFullscreen ? "active" : ""}`}
                      onClick={toggleFullscreen}
                    >
                      <ion-icon name="expand-outline" style={{ fontSize: "1.1rem" }}></ion-icon>{" "}
                      {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Scoped style tag watch page rules */
        .watch-container {
          padding-top: calc(var(--header-height) + 20px);
          min-height: 100vh;
          background: #06070c;
          transition: all var(--transition-medium);
        }
        .watch-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          margin-bottom: 50px;
          transition: all var(--transition-medium);
        }
        .player-container {
          grid-column: 1;
          grid-row: 1;
          min-width: 0;
          transition: all var(--transition-medium);
        }
        .player-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          background: #000;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border: 1px solid var(--border-color);
        }
        .player-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .player-navigation-bar {
          margin-top: 18px;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          background: #0c0d16;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .nav-episode-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 22px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .nav-episode-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--border-color-hover);
          transform: translateY(-1px);
        }
        .nav-episode-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }
        .watch-left {
          grid-column: 1;
          grid-row: 2;
          min-width: 0;
        }
        .watch-right {
          grid-column: 2;
          grid-row: 1 / span 2;
        }
        .sidebar-panel {
          background: #0c0d16;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: calc(var(--header-height) + 20px);
        }
        .sidebar-section {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 24px;
        }
        .sidebar-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .sidebar-title {
          font-family: var(--font-family-title);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sidebar-title ion-icon {
          color: #f5c518;
          font-size: 1.1rem;
        }
        .server-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: left;
          transition: all var(--transition-fast);
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: flex-start;
        }
        .server-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }
        .server-btn.active {
          background: var(--accent-gradient);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px var(--accent-glow);
        }
        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a0a0a0;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(160, 160, 160, 0.5);
          transition: all var(--transition-fast);
        }
        .status-dot.online {
          background: #2ec4b6;
          box-shadow: 0 0 8px rgba(46, 196, 182, 0.8);
        }
        .status-dot.offline {
          background: #e50914;
          box-shadow: 0 0 8px rgba(229, 9, 20, 0.8);
        }
        .status-dot.testing {
          background: #f5c518;
          box-shadow: 0 0 8px rgba(245, 197, 24, 0.8);
          animation: statusPulse 1s infinite alternate;
        }
        @keyframes statusPulse {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
        .server-panel {
          background: #0c0d16;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          margin-top: 18px;
          width: 100%;
        }
        .server-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .server-panel-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .server-panel-header h4 ion-icon {
          color: #f5c518;
          font-size: 1.15rem;
        }
        .server-panel-header span {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .server-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 10px;
          width: 100%;
        }
        .season-select-wrapper select {
          background: #161827;
          border: 1px solid var(--border-color);
          color: white;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          width: 100%;
          margin-bottom: 15px;
          transition: border var(--transition-fast);
        }
        .season-select-wrapper select:focus {
          border-color: #f5c518;
        }
        .episode-box {
          background: #0c0d16;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .episode-box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-color);
        }
        .episode-list {
          max-height: 480px;
          overflow-y: auto;
        }
        .episode-list::-webkit-scrollbar {
          width: 6px;
        }
        .episode-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .episode-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .episode-row {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: all var(--transition-fast);
          cursor: pointer;
          align-items: center;
        }
        .episode-row:last-child {
          border-bottom: none;
        }
        .episode-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .episode-row.active {
          background: rgba(229, 9, 20, 0.06);
          border-left: 3px solid var(--accent);
          padding-left: 13px;
        }
        .episode-thumb-container {
          position: relative;
          flex: 0 0 120px;
          width: 120px;
          aspect-ratio: 16 / 9;
          border-radius: 6px;
          overflow: hidden;
          background: #161827;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .episode-thumb-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-fast);
        }
        .episode-row:hover .episode-thumb-container img {
          transform: scale(1.05);
        }
        .episode-play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .episode-row:hover .episode-play-overlay {
          opacity: 1;
        }
        .episode-play-overlay ion-icon {
          font-size: 1.6rem;
          color: white;
          transform: scale(0.8);
          transition: transform var(--transition-fast);
        }
        .episode-row:hover .episode-play-overlay ion-icon {
          transform: scale(1);
        }
        .episode-row.active .episode-play-overlay {
          opacity: 1;
          background: rgba(0, 0, 0, 0.45);
        }
        .episode-row.active .episode-play-overlay ion-icon {
          color: var(--accent);
          transform: scale(1);
        }
        .episode-row-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .episode-row-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          min-width: 0;
          width: 100%;
        }
        .episode-row-number-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          flex: 1;
        }
        .episode-row.active .episode-row-number-title {
          color: var(--accent);
        }
        .episode-row-duration {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          flex-shrink: 0;
        }
        .action-control-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: all var(--transition-fast);
          cursor: pointer;
          width: 100%;
        }
        .action-control-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
          border-color: var(--border-color-hover);
        }
        .action-control-btn.active {
          border-color: var(--accent);
          color: var(--text-primary);
        }
        .watch-grid.theater-active {
          grid-template-columns: 1fr 360px;
        }
        .watch-grid.theater-active .player-container {
          grid-column: 1 / -1;
          grid-row: 1;
        }
        .watch-grid.theater-active .watch-left {
          grid-column: 1;
          grid-row: 2;
        }
        .watch-grid.theater-active .watch-right {
          grid-column: 2;
          grid-row: 2;
        }
        .lights-off-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.98);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--transition-medium);
        }
        .player-wrapper:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          padding-bottom: 0 !important;
          border-radius: 0 !important;
          border: none !important;
        }
        @media (max-width: 992px) {
          .watch-grid,
          .watch-grid.theater-active {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .player-container {
            grid-column: 1 !important;
            grid-row: 1 !important;
            width: 100% !important;
          }
          .watch-left {
            grid-column: 1 !important;
            grid-row: 2 !important;
            width: 100% !important;
          }
          .watch-right {
            grid-column: 1 !important;
            grid-row: 3 !important;
            margin-top: 10px;
            width: 100% !important;
          }
          .sidebar-panel {
            position: static !important;
            width: 100% !important;
          }
        }
        @media (max-width: 768px) {
          .watch-container {
            padding-top: calc(var(--header-height) + 10px) !important;
          }
          .watch-grid {
            gap: 16px !important;
            margin-bottom: 30px !important;
          }
          #playingTitle {
            font-size: 1.5rem !important;
          }
          #episodeSubtitle {
            font-size: 0.9rem !important;
            margin-bottom: 12px !important;
          }
          .watch-left p {
            font-size: 0.92rem !important;
          }
          .sidebar-panel {
            padding: 16px !important;
            gap: 18px !important;
          }
          .sidebar-section {
            padding-bottom: 18px !important;
          }
          .player-navigation-bar {
            padding: 10px 12px !important;
            margin-top: 12px !important;
            border-radius: 8px !important;
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            grid-template-areas:
              "indicator indicator"
              "prev next" !important;
            gap: 10px !important;
            justify-items: center !important;
          }
          .nav-episode-btn {
            padding: 8px 16px !important;
            font-size: 0.78rem !important;
            width: 100% !important;
            justify-content: center !important;
          }
          #prevEpisodeBtn {
            grid-area: prev !important;
          }
          #nextEpisodeBtn {
            grid-area: next !important;
          }
          #playerNavIndicator {
            font-size: 0.78rem !important;
            grid-area: indicator !important;
            margin-bottom: 2px !important;
          }
          .server-panel {
            padding: 12px !important;
          }
          .server-panel-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }
          .server-panel-header span {
            font-size: 0.74rem !important;
          }
          .server-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            gap: 8px !important;
          }
          .server-btn {
            padding: 8px 10px !important;
            font-size: 0.76rem !important;
          }
          .episode-box-header {
            padding: 10px 14px !important;
          }
          .episode-list {
            max-height: 320px !important;
          }
          .episode-row {
            padding: 10px 12px !important;
            gap: 10px !important;
          }
          .episode-thumb-container {
            flex: 0 0 80px !important;
            width: 80px !important;
          }
          .episode-row-number-title {
            font-size: 0.78rem !important;
          }
          .episode-row-duration {
            font-size: 0.68rem !important;
          }
          .action-control-btn {
            padding: 10px 14px !important;
            font-size: 0.8rem !important;
          }
        }
        @media (max-width: 480px) {
          .watch-container {
            padding-top: calc(var(--header-height) + 8px) !important;
          }
          .watch-grid {
            gap: 12px !important;
            margin-bottom: 24px !important;
          }
          .player-wrapper {
            border-radius: 8px !important;
          }
          #playingTitle {
            font-size: 1.35rem !important;
          }
          #episodeSubtitle {
            font-size: 0.85rem !important;
            margin-bottom: 8px !important;
          }
          .watch-left p {
            font-size: 0.88rem !important;
          }
          .sidebar-panel {
            padding: 12px !important;
            gap: 14px !important;
            border-radius: 12px !important;
          }
          .sidebar-title {
            font-size: 0.85rem !important;
            margin-bottom: 10px !important;
          }
          .season-select-wrapper select {
            padding: 8px 12px !important;
            font-size: 0.82rem !important;
            margin-bottom: 10px !important;
            border-radius: 8px !important;
          }
          .episode-box {
            border-radius: 12px !important;
          }
          .episode-box-header {
            padding: 8px 12px !important;
          }
          .episode-list {
            max-height: 280px !important;
          }
          .episode-row {
            padding: 8px 10px !important;
            gap: 8px !important;
          }
          .episode-thumb-container {
            flex: 0 0 70px !important;
            width: 70px !important;
          }
          .episode-row-number-title {
            font-size: 0.75rem !important;
          }
          .episode-row-duration {
            font-size: 0.65rem !important;
          }
          .server-panel {
            padding: 10px !important;
            border-radius: 12px !important;
          }
          .server-panel-header h4 {
            font-size: 0.9rem !important;
          }
          .server-panel-header span {
            font-size: 0.7rem !important;
          }
          .server-btn {
            padding: 6px 8px !important;
            font-size: 0.72rem !important;
            border-radius: 6px !important;
          }
          .player-navigation-bar {
            padding: 8px 10px !important;
            gap: 8px !important;
            border-radius: 6px !important;
          }
          .nav-episode-btn {
            padding: 6px 12px !important;
            font-size: 0.74rem !important;
            border-radius: 20px !important;
          }
          .action-control-btn {
            padding: 8px 12px !important;
            font-size: 0.76rem !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </>
  );
}
