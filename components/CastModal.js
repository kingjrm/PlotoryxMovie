"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CastModal({ isOpen, actorId, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actorData, setActorData] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !actorId) return;

    const fetchActorDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/person?id=${actorId}`);
        if (!res.ok) throw new Error("Failed to fetch actor details");
        const data = await res.json();
        setActorData(data);
      } catch (err) {
        console.error("Error loading actor details:", err);
        setActorData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActorDetails();
  }, [isOpen, actorId]);

  if (!isOpen) return null;

  const calculateAge = (birthday, deathday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatBirthDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const handleMovieClick = (e, id, type) => {
    e.preventDefault();
    onClose();
    // Navigate with dimming visual feedback
    const card = e.currentTarget;
    card.classList.add("card-clicking");
    setTimeout(() => {
      router.push(`/details?id=${id}&type=${type}`);
    }, 250);
  };

  const name = actorData?.name || "Loading Name...";
  const avatarUrl = actorData?.profile_path
    ? `https://image.tmdb.org/t/p/h632${actorData.profile_path}`
    : "";
  const birthday = actorData?.birthday ? formatBirthDate(actorData.birthday) : "N/A";
  const deathday = actorData?.deathday ? formatBirthDate(actorData.deathday) : null;
  const age = actorData ? calculateAge(actorData.birthday, actorData.deathday) : null;
  const birthplace = actorData?.place_of_birth || "N/A";
  const biography = actorData?.biography || "No biography available.";
  const department = actorData?.known_for_department || "Acting";

  // Filter combined credits filmography (sort by popularity descending)
  const filmography = actorData?.combined_credits?.cast
    ? actorData.combined_credits.cast
        .filter((item) => item.poster_path)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 15)
    : [];

  return (
    <div
      className="cast-modal-overlay active"
      onClick={(e) => {
        if (e.target.classList.contains("cast-modal-overlay")) onClose();
      }}
    >
      <div className="cast-modal-container">
        <button className="cast-modal-close" aria-label="Close details" onClick={onClose}>
          <ion-icon name="close-outline"></ion-icon>
        </button>

        {loading ? (
          <div className="cast-modal-loader">
            <ion-icon name="sync-outline" className="spin"></ion-icon>
            <div>Loading details...</div>
          </div>
        ) : actorData ? (
          <div className="cast-modal-content">
            {/* Bio Panel */}
            <div className="cast-modal-bio-panel">
              <div className="cast-modal-avatar-wrapper">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="cast-modal-avatar" />
                ) : (
                  <div className="cast-modal-avatar" style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#161827", color: "var(--text-secondary)", fontWeight: 700, fontSize: "2rem" }}>
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="cast-modal-name">{name}</h2>

              <div className="cast-modal-meta">
                <p>
                  <strong>Role:</strong> {department}
                </p>
                <p>
                  <strong>Born:</strong> {birthday}
                </p>
                {deathday && (
                  <p>
                    <strong>Died:</strong> {deathday}
                  </p>
                )}
                {age !== null && (
                  <p>
                    <strong>Age:</strong> {age} years old
                  </p>
                )}
                <p>
                  <strong>Birthplace:</strong> {birthplace}
                </p>
              </div>

              <div className="cast-modal-bio-scroll">
                <p style={{ margin: 0 }}>{biography}</p>
              </div>
            </div>

            {/* Filmography Panel */}
            <div className="cast-modal-filmography-panel">
              <h3 className="cast-modal-section-title">Known For</h3>

              {filmography.length > 0 ? (
                <div className="cast-modal-slider-wrapper">
                  <button className="cast-slider-btn prev-btn" onClick={slideLeft} aria-label="Scroll left">
                    <ion-icon name="chevron-back-outline"></ion-icon>
                  </button>
                  <div className="cast-modal-slider" ref={sliderRef}>
                    {filmography.map((item, idx) => {
                      const movieTitle = item.title || item.name || "Untitled";
                      const itemType = item.media_type || (item.title ? "movie" : "tv");
                      const poster = `https://image.tmdb.org/t/p/w185${item.poster_path}`;
                      const rating = item.vote_average ? (Math.round(item.vote_average * 10) / 10).toFixed(1) : "N/A";
                      const character = item.character || "Self";

                      return (
                        <div
                          key={`${item.id}-${idx}`}
                          onClick={(e) => handleMovieClick(e, item.id, itemType)}
                          className="cast-movie-card"
                        >
                          <div className="cast-movie-poster-wrapper">
                            <span className="cast-movie-rating-badge">
                              <ion-icon name="star"></ion-icon> {rating}
                            </span>
                            <img
                              src={poster}
                              alt={movieTitle}
                              className="cast-movie-poster"
                              loading="lazy"
                            />
                          </div>
                          <div className="cast-movie-info">
                            <div className="cast-movie-title" title={movieTitle}>
                              {movieTitle}
                            </div>
                            <div className="cast-movie-character" title={character}>
                              {character}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="cast-slider-btn next-btn" onClick={slideRight} aria-label="Scroll right">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                  </button>
                </div>
              ) : (
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                  No filmography details found.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="cast-modal-loader">
            <ion-icon name="alert-circle-outline" style={{ color: "var(--accent)" }}></ion-icon>
            <div>Failed to load details.</div>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Inject cast modal specific styles */
        .cast-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(4, 5, 10, 0.75);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 20px;
        }
        .cast-modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        .cast-modal-container {
          background: rgba(12, 13, 22, 0.97);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          width: 100%;
          max-width: 950px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 50px rgba(245, 197, 24, 0.05);
          transform: scale(0.92) translateY(20px);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cast-modal-overlay.active .cast-modal-container {
          transform: scale(1) translateY(0);
        }
        .cast-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.5rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
          outline: none;
        }
        .cast-modal-close:hover {
          background: var(--accent);
          border-color: var(--accent);
          transform: rotate(90deg) scale(1.05);
          box-shadow: 0 0 15px var(--accent-glow);
        }
        .cast-modal-content {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 100%;
          max-height: 85vh;
          overflow: hidden;
        }
        .cast-modal-bio-panel {
          padding: 35px 25px;
          background: rgba(255, 255, 255, 0.01);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          overflow-y: auto;
          max-height: 85vh;
        }
        .cast-modal-avatar-wrapper {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 20px;
          border: 3px solid #f5c518;
          box-shadow: 0 8px 24px rgba(245, 197, 24, 0.2);
          flex-shrink: 0;
        }
        .cast-modal-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cast-modal-name {
          font-family: var(--font-family-title);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .cast-modal-meta {
          width: 100%;
          margin-bottom: 18px;
          font-size: 0.85rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 14px;
        }
        .cast-modal-meta p {
          margin-bottom: 8px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .cast-modal-meta p:last-child {
          margin-bottom: 0;
        }
        .cast-modal-meta strong {
          color: var(--text-primary);
        }
        .cast-modal-bio-scroll {
          text-align: left;
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-secondary);
          overflow-y: auto;
          padding-right: 8px;
          width: 100%;
          max-height: 250px;
        }
        .cast-modal-bio-scroll::-webkit-scrollbar,
        .cast-modal-slider::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .cast-modal-bio-scroll::-webkit-scrollbar-track,
        .cast-modal-slider::-webkit-scrollbar-track {
          background: transparent;
        }
        .cast-modal-bio-scroll::-webkit-scrollbar-thumb,
        .cast-modal-slider::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .cast-modal-bio-scroll::-webkit-scrollbar-thumb:hover,
        .cast-modal-slider::-webkit-scrollbar-thumb:hover {
          background: #f5c518;
        }
        .cast-modal-filmography-panel {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          max-height: 85vh;
        }
        .cast-modal-section-title {
          font-family: var(--font-family-title);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
          border-left: 4px solid #f5c518;
          padding-left: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cast-modal-slider-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .cast-modal-slider {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 10px 4px 20px;
          width: 100%;
        }
        .cast-movie-card {
          flex: 0 0 130px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          cursor: pointer;
        }
        .cast-movie-card:hover {
          transform: translateY(-8px);
          border-color: #f5c518;
          box-shadow: 0 12px 24px rgba(245, 197, 24, 0.15);
          background: rgba(255, 255, 255, 0.05);
        }
        .cast-movie-poster-wrapper {
          aspect-ratio: 2 / 3;
          overflow: hidden;
          position: relative;
          background: #121526;
        }
        .cast-movie-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }
        .cast-movie-card:hover .cast-movie-poster {
          transform: scale(1.05);
        }
        .cast-movie-rating-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(6, 7, 13, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 2px 5px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #f5c518;
          display: flex;
          align-items: center;
          gap: 2px;
          backdrop-filter: blur(4px);
          z-index: 2;
        }
        .cast-movie-info {
          padding: 10px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-height: 70px;
        }
        .cast-movie-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .cast-movie-character {
          font-size: 0.7rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: auto;
        }
        .cast-slider-btn {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(12, 13, 22, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          outline: none;
        }
        .cast-slider-btn:hover {
          background: #f5c518;
          color: #0c0d16;
          border-color: #f5c518;
          transform: scale(1.1);
        }
        .cast-slider-btn.prev-btn {
          left: -18px;
        }
        .cast-slider-btn.next-btn {
          right: -18px;
        }
        .cast-modal-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 380px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .cast-modal-loader ion-icon {
          font-size: 3rem;
          color: #f5c518;
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .cast-modal-content {
            grid-template-columns: 1fr;
            overflow-y: auto;
          }
          .cast-modal-container {
            max-height: 90vh;
          }
          .cast-modal-bio-panel {
            max-height: none;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 45px 20px 25px;
          }
          .cast-modal-filmography-panel {
            padding: 25px 20px;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
}
