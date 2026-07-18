"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";

export default function HomePageClient({ trending, popularMovies, topTv }) {
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselTimer = useRef(null);

  // Continue Watching State
  const [continueWatchingList, setContinueWatchingList] = useState([]);

  // Surprise Me State
  const [rouletteType, setRouletteType] = useState("movie");
  const [rouletteGenre, setRouletteGenre] = useState("");
  const [rouletteActive, setRouletteActive] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [shuffleWinner, setShuffleWinner] = useState(null);
  const [shuffleTempItem, setShuffleTempItem] = useState(null);
  const [shuffleLoading, setShuffleLoading] = useState(false);

  const heroes = trending?.results?.slice(0, 5) || [];

  // Initialize Continue Watching from localStorage
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("continueWatching")) || [];
    setContinueWatchingList(list);
  }, []);

  // Carousel timer
  useEffect(() => {
    if (heroes.length === 0) return;
    carouselTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroes.length);
    }, 6000);

    return () => clearInterval(carouselTimer.current);
  }, [heroes.length]);

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
    clearInterval(carouselTimer.current);
    carouselTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroes.length);
    }, 6000);
  };

  // Horizontal sliders scroll controls
  const handleScrollLeft = (e) => {
    const slider = e.currentTarget.parentNode.querySelector(".movie-slider");
    if (slider) {
      slider.scrollBy({ left: -600, behavior: "smooth" });
    }
  };

  const handleScrollRight = (e) => {
    const slider = e.currentTarget.parentNode.querySelector(".movie-slider");
    if (slider) {
      slider.scrollBy({ left: 600, behavior: "smooth" });
    }
  };

  // Surprise Me Logic
  const triggerRoulette = async () => {
    setShuffleLoading(true);
    const type = rouletteType || "movie";
    let genre = rouletteGenre || "";

    if (type === "tv") {
      if (genre === "28" || genre === "12") {
        genre = "10759"; // Action & Adventure TV
      } else if (genre === "878") {
        genre = "10765"; // Sci-Fi & Fantasy TV
      }
    }

    const randomPage = Math.floor(Math.random() * 10) + 1; // variety page 1-10
    const apiPath = `/api/discover?type=${type}&genre=${genre}&page=${randomPage}`;

    try {
      const res = await fetch(apiPath);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const results = data.results || [];

      if (results.length > 0) {
        // Prepare container & winner
        const winner = results[Math.floor(Math.random() * results.length)];
        setShuffleWinner(winner);
        setShuffleTempItem(results[0]);
        setRouletteActive(true);
        setShuffling(true);

        document.body.style.overflow = "hidden";

        // Shuffle animation
        let cycleIndex = 0;
        const totalFastCycles = 12;
        const cycleDelay = 100;

        function runCycle() {
          if (cycleIndex < totalFastCycles) {
            const tempItem = results[Math.floor(Math.random() * results.length)];
            setShuffleTempItem(tempItem);
            cycleIndex++;
            setTimeout(runCycle, cycleDelay);
          } else if (cycleIndex === totalFastCycles) {
            const tempItem = results[Math.floor(Math.random() * results.length)];
            setShuffleTempItem(tempItem);
            cycleIndex++;
            setTimeout(runCycle, 150);
          } else if (cycleIndex === totalFastCycles + 1) {
            const tempItem = results[Math.floor(Math.random() * results.length)];
            setShuffleTempItem(tempItem);
            cycleIndex++;
            setTimeout(runCycle, 250);
          } else if (cycleIndex === totalFastCycles + 2) {
            const tempItem = results[Math.floor(Math.random() * results.length)];
            setShuffleTempItem(tempItem);
            cycleIndex++;
            setTimeout(runCycle, 400);
          } else {
            // Finalize
            setShuffleTempItem(winner);
            setShuffling(false);
          }
        }

        setTimeout(runCycle, cycleDelay);
      } else {
        alert("No titles found for the selected filters. Try another genre!");
      }
    } catch (e) {
      console.error(e);
      alert("Roulette failed. Please try again!");
    } finally {
      setShuffleLoading(false);
    }
  };

  const closeRoulette = () => {
    setRouletteActive(false);
    setShuffleWinner(null);
    setShuffleTempItem(null);
    document.body.style.overflow = "";
  };

  // Listen for escape key on roulette modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && rouletteActive) {
        closeRoulette();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [rouletteActive]);

  return (
    <>
      {/* Hero Section */}
      <div className="hero">
        <div className="carousel-container">
          {heroes.map((item, index) => {
            const itemBg = item.backdrop_path
              ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
              : "/assets/images/hero-fallback.jpg";
            const itemTitle = item.title || item.name || "Untitled";
            const itemOverview = item.overview || "No description available.";
            const itemRating = item.vote_average ? (Math.round(item.vote_average * 10) / 10).toFixed(1) : "";
            const itemDate = item.release_date || item.first_air_date || "";
            const itemYear = itemDate ? itemDate.substring(0, 4) : "";
            const itemType = item.media_type || (item.title ? "movie" : "tv");

            return (
              <div
                key={item.id}
                className={`hero-slide ${index === currentSlide ? "active" : ""}`}
                style={{ backgroundImage: `url('${itemBg}')` }}
              >
                <div className="container hero-content">
                  <div className="hero-badge">
                    <ion-icon name="flame"></ion-icon> TRENDING TODAY
                  </div>
                  <h1 className="hero-title">{itemTitle}</h1>
                  <div className="hero-meta-info">
                    {itemRating && (
                      <span className="rating">
                        <ion-icon name="star"></ion-icon> {itemRating}
                      </span>
                    )}
                    {itemYear && <span className="year">{itemYear}</span>}
                    <span className="type">{itemType === "movie" ? "Movie" : "TV Series"}</span>
                  </div>
                  <p className="hero-desc">{itemOverview}</p>
                  <div className="hero-actions" style={{ display: "flex", gap: "15px" }}>
                    <Link
                      href={`/watch?id=${item.id}&type=${itemType}`}
                      className="btn netflix-btn-play"
                    >
                      <ion-icon name="play" style={{ fontSize: "1.4rem" }}></ion-icon> Play
                    </Link>
                    <Link
                      href={`/details?id=${item.id}&type=${itemType}`}
                      className="btn netflix-btn-info"
                    >
                      <ion-icon name="information-circle-outline" style={{ fontSize: "1.4rem" }}></ion-icon> More Info
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="carousel-indicators">
          {heroes.map((item, index) => (
            <button
              key={item.id}
              className={`carousel-dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            ></button>
          ))}
        </div>
      </div>

      {/* Continue Watching Section */}
      {continueWatchingList.length > 0 && (
        <div className="container" id="continueWatchingSection" style={{ paddingTop: "10px" }}>
          <h2 className="section-title">Continue Watching</h2>
          <div className="movie-slider-wrapper">
            <button className="slider-btn prev" aria-label="Slide Left" onClick={handleScrollLeft}>
              <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            <div className="movie-slider" id="continueWatchingGrid">
              {continueWatchingList.map((item) => {
                const isTV = item.type === "tv";
                const episodeInfo = isTV ? `S${item.season} Ep${item.episode}` : "Movie";
                const link = `/watch?id=${item.id}&type=${item.type}` + (isTV ? `&season=${item.season}&episode=${item.episode}` : "");
                const cardImgSrc = item.backdrop || item.poster || "";
                const progress = (parseInt(item.id) % 55) + 25;

                return (
                  <Link key={`${item.id}-${item.type}`} href={link} className="continue-card">
                    <div className="continue-img-container">
                      {cardImgSrc ? (
                        <img loading="lazy" src={cardImgSrc} alt={item.title} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #121526 0%, #0c0d16 100%)", padding: "20px", textAlign: "center" }}>
                          <ion-icon name="image-outline" style={{ fontSize: "2.5rem", color: "rgba(255,255,255,0.1)", marginBottom: "10px" }}></ion-icon>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                            {item.title}
                          </div>
                        </div>
                      )}
                      <div className="continue-play-overlay">
                        <ion-icon name="play-circle-outline" className="continue-play-icon"></ion-icon>
                      </div>
                      <div className="continue-progress-bar">
                        <div className="continue-progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div className="continue-details">
                      <div className="continue-text">
                        <div className="continue-title" title={item.title}>
                          {item.title}
                        </div>
                        <div className="continue-meta">{episodeInfo}</div>
                      </div>
                      <div className="continue-actions">
                        <button className="continue-btn-play" aria-label="Play">
                          <ion-icon name="play-circle"></ion-icon>
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <button className="slider-btn next" aria-label="Slide Right" onClick={handleScrollRight}>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
          </div>
        </div>
      )}

      {/* Popular Genres Section */}
      <div className="container" style={{ marginTop: "30px" }}>
        <h2 className="section-title">Popular Genres</h2>
        <div style={{ display: "flex", gap: "14px", overflowX: "auto", padding: "10px 4px 20px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <Link href="/movies?genre=28" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(229, 9, 20, 0.15) 0%, rgba(229, 9, 20, 0.02) 100%)", borderColor: "rgba(229, 9, 20, 0.2)" }}>
            <ion-icon name="flame-outline" style={{ fontSize: "1.5rem", color: "#e50914", marginRight: "8px" }}></ion-icon>
            <span>Action</span>
          </Link>
          <Link href="/movies?genre=35" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(245, 197, 24, 0.15) 0%, rgba(245, 197, 24, 0.02) 100%)", borderColor: "rgba(245, 197, 24, 0.2)" }}>
            <ion-icon name="happy-outline" style={{ fontSize: "1.5rem", color: "#f5c518", marginRight: "8px" }}></ion-icon>
            <span>Comedy</span>
          </Link>
          <Link href="/movies?genre=878" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(26, 115, 232, 0.15) 0%, rgba(26, 115, 232, 0.02) 100%)", borderColor: "rgba(26, 115, 232, 0.2)" }}>
            <ion-icon name="planet-outline" style={{ fontSize: "1.5rem", color: "#1a73e8", marginRight: "8px" }}></ion-icon>
            <span>Sci-Fi</span>
          </Link>
          <Link href="/movies?genre=18" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.02) 100%)", borderColor: "rgba(168, 85, 247, 0.2)" }}>
            <ion-icon name="sad-outline" style={{ fontSize: "1.5rem", color: "#a855f7", marginRight: "8px" }}></ion-icon>
            <span>Drama</span>
          </Link>
          <Link href="/movies?genre=53" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.02) 100%)", borderColor: "rgba(236, 72, 153, 0.2)" }}>
            <ion-icon name="skull-outline" style={{ fontSize: "1.5rem", color: "#ec4899", marginRight: "8px" }}></ion-icon>
            <span>Thriller</span>
          </Link>
          <Link href="/movies?genre=27" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.02) 100%)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <ion-icon name="thunderstorm-outline" style={{ fontSize: "1.5rem", color: "#ef4444", marginRight: "8px" }}></ion-icon>
            <span>Horror</span>
          </Link>
          <Link href="/movies?genre=10749" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.02) 100%)", borderColor: "rgba(244, 63, 94, 0.2)" }}>
            <ion-icon name="heart-outline" style={{ fontSize: "1.5rem", color: "#f43f5e", marginRight: "8px" }}></ion-icon>
            <span>Romance</span>
          </Link>
          <Link href="/movies?genre=16" className="genre-card" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.02) 100%)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
            <ion-icon name="color-palette-outline" style={{ fontSize: "1.5rem", color: "#10b981", marginRight: "8px" }}></ion-icon>
            <span>Animation</span>
          </Link>
        </div>
      </div>

      {/* Surprise Me Section */}
      <div className="container" style={{ marginTop: "40px", marginBottom: "40px" }}>
        <div className="shuffle-banner">
          <div className="shuffle-blur-circle"></div>
          <div className="shuffle-container">
            <div className="shuffle-info">
              <div className="shuffle-badge">
                <span className="pulse-dot"></span>
                <span>Plotoryx Shuffle</span>
              </div>
              <h2 className="shuffle-title">Can't decide what to watch?</h2>
              <p className="shuffle-desc">Select your mood filters and let our system find the perfect movie or television series recommendation instantly!</p>
            </div>

            <div className="shuffle-form-wrapper">
              <div className="shuffle-form-row">
                <div className="shuffle-field">
                  <label>
                    <ion-icon name="videocam-outline"></ion-icon> Type
                  </label>
                  <select id="rouletteType" value={rouletteType} onChange={(e) => setRouletteType(e.target.value)}>
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                  </select>
                </div>
                <div className="shuffle-field">
                  <label>
                    <ion-icon name="options-outline"></ion-icon> Genre
                  </label>
                  <select id="rouletteGenre" value={rouletteGenre} onChange={(e) => setRouletteGenre(e.target.value)}>
                    <option value="">All Genres</option>
                    <option value="28">Action</option>
                    <option value="12">Adventure</option>
                    <option value="16">Animation</option>
                    <option value="35">Comedy</option>
                    <option value="80">Crime</option>
                    <option value="18">Drama</option>
                    <option value="27">Horror</option>
                    <option value="9648">Mystery</option>
                    <option value="10749">Romance</option>
                    <option value="878">Sci-Fi</option>
                    <option value="53">Thriller</option>
                  </select>
                </div>
              </div>

              <button id="shuffleBtn" className="shuffle-btn" onClick={triggerRoulette} disabled={shuffleLoading}>
                {shuffleLoading ? (
                  <>
                    <ion-icon name="sync-outline" className="spin" style={{ fontSize: "1.2rem", marginRight: "6px" }}></ion-icon>
                    <span>Shuffling...</span>
                  </>
                ) : (
                  <>
                    <ion-icon name="shuffle-outline"></ion-icon>
                    <span>Surprise Me</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Movie Content Sections */}
      <div className="container">
        {/* Trending Today Slider */}
        <h2 className="section-title">Trending Today</h2>
        <div className="movie-slider-wrapper">
          <button className="slider-btn prev" aria-label="Slide Left" onClick={handleScrollLeft}>
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          <div className="movie-slider">
            {trending?.results?.slice(0, 18).map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
          <button className="slider-btn next" aria-label="Slide Right" onClick={handleScrollRight}>
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
        </div>

        {/* Popular Movies Slider */}
        <h2 className="section-title">Popular Movies</h2>
        <div className="movie-slider-wrapper">
          <button className="slider-btn prev" aria-label="Slide Left" onClick={handleScrollLeft}>
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          <div className="movie-slider">
            {popularMovies?.results?.slice(0, 18).map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
          <button className="slider-btn next" aria-label="Slide Right" onClick={handleScrollRight}>
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
        </div>

        {/* Top Rated TV Shows Slider */}
        <h2 className="section-title">Top Rated TV Shows</h2>
        <div className="movie-slider-wrapper">
          <button className="slider-btn prev" aria-label="Slide Left" onClick={handleScrollLeft}>
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          <div className="movie-slider">
            {topTv?.results?.slice(0, 18).map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
          <button className="slider-btn next" aria-label="Slide Right" onClick={handleScrollRight}>
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
        </div>
      </div>

      {/* Roulette Result Modal Overlay */}
      {rouletteActive && (
        <div
          className="roulette-modal-overlay active"
          id="rouletteModal"
          onClick={(e) => {
            if (e.target.id === "rouletteModal") closeRoulette();
          }}
        >
          <div className={`roulette-modal-container ${shuffling ? "shuffling" : "reveal-active"}`}>
            <button className="roulette-modal-close" id="closeRouletteBtn" aria-label="Close random choice" onClick={closeRoulette}>
              <ion-icon name="close-outline"></ion-icon>
            </button>

            <div
              className="roulette-modal-banner"
              id="rouletteBanner"
              style={{
                backgroundImage: `url('${
                  shuffleTempItem?.backdrop_path
                    ? `https://image.tmdb.org/t/p/w780${shuffleTempItem.backdrop_path}`
                    : "/assets/images/hero-fallback.jpg"
                }')`,
              }}
            >
              <div className="roulette-modal-gradient"></div>
            </div>

            <div className="roulette-modal-content" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span id="rouletteBadge" style={{ background: "var(--accent-gradient)", color: "white", padding: "3px 10px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {rouletteType === "movie" ? "Movie" : "TV Series"}
                </span>
                <span id="rouletteRating" style={{ color: "#ffb12a", fontWeight: "700", display: "flex", alignItems: "center", gap: "3px", fontSize: "0.9rem" }}>
                  <ion-icon name="star"></ion-icon>{" "}
                  {shuffleTempItem?.vote_average ? (Math.round(shuffleTempItem.vote_average * 10) / 10).toFixed(1) : "N/A"}
                </span>
              </div>
              <h2 id="rouletteTitle" style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "12px", fontFamily: "var(--font-family-title)", lineHeight: "1.2" }}>
                {shuffleTempItem?.title || shuffleTempItem?.name || "Untitled"}
              </h2>
              <p id="rouletteOverview" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "24px", display: "-webkit-box", WebkitLineClamp: "4", LineClamp: "4", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {shuffling ? "Shuffling list..." : shuffleWinner?.overview || "No description available."}
              </p>

              <div className="roulette-modal-actions" style={{ display: "flex", gap: "12px" }}>
                <Link
                  id="rouletteWatchLink"
                  href={`/watch?id=${shuffleWinner?.id}&type=${rouletteType}`}
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: "8px", padding: "12px", fontWeight: "700", textAlign: "center", justifyContent: "center" }}
                  onClick={closeRoulette}
                >
                  <ion-icon name="play" style={{ fontSize: "1.2rem", marginRight: "4px" }}></ion-icon> Watch Now
                </Link>
                <button
                  id="rouletteReshuffleBtn"
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: "8px", padding: "12px", fontWeight: "700", textAlign: "center", justifyContent: "center" }}
                  onClick={triggerRoulette}
                  disabled={shuffling}
                >
                  <ion-icon name="refresh-outline" style={{ fontSize: "1.2rem", marginRight: "4px" }}></ion-icon> Shuffle Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
