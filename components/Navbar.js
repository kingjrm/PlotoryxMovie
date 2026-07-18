"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchInputRef = useRef(null);
  const liveResultsRef = useRef(null);
  const searchBarRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Monitor scroll for header background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut 's' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "s" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside search results to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        liveResultsRef.current &&
        !liveResultsRef.current.contains(e.target) &&
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery)}`
          );
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const filtered = data.results
              .filter((item) => item.media_type !== "person")
              .slice(0, 5);
            setSearchResults(filtered);
          } else {
            setSearchResults([]);
          }
        } catch (err) {
          console.error("Search error:", err);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 400);
    } else {
      setSearchResults([]);
    }

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      setMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchItemClick = () => {
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link href="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <img src="/Plotoryx-Logo.png" alt="Plotoryx" className="brand-logo-img" />
          <span>Plotoryx</span>
        </Link>

        {/* Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`} id="navLinks">
          <li>
            <Link
              href="/"
              className={pathname === "/" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/movies"
              className={pathname === "/movies" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Movies
            </Link>
          </li>
          <li>
            <Link
              href="/tv"
              className={pathname === "/tv" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              TV Shows
            </Link>
          </li>
          <li>
            <Link
              href="/genres"
              className={pathname === "/genres" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Genres
            </Link>
          </li>
          <li>
            <Link
              href="/trending"
              className={pathname === "/trending" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Trending
            </Link>
          </li>
          <li>
            <Link
              href="/favorites"
              className={pathname === "/favorites" ? "active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Watchlist
            </Link>
          </li>
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          {/* Search Bar */}
          <div
            className={`search-bar ${mobileSearchOpen ? "active" : ""}`}
            id="searchBar"
            ref={searchBarRef}
          >
            {/* Mobile search button */}
            <button
              type="button"
              className="mobile-search-trigger"
              id="mobileSearchTrigger"
              onClick={() => {
                setMobileSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
            >
              <ion-icon name="search-outline"></ion-icon>
              <span>Search</span>
            </button>

            {/* Inline/Overlay search form */}
            <form onSubmit={handleSearchSubmit} id="searchForm">
              <ion-icon name="search-outline" class="search-input-icon"></ion-icon>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Titles, people, genres..."
                id="searchInput"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
              />
              <button
                type="button"
                className="close-search-btn"
                id="closeSearchBtn"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery("");
                  setSearchFocused(false);
                }}
              >
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </form>

            {/* Live Autocomplete Results */}
            {searchFocused && searchQuery.trim().length > 2 && (
              <div
                className="live-search-results"
                id="liveSearchResults"
                ref={liveResultsRef}
                style={{ display: "block" }}
              >
                {searchLoading && (
                  <p style={{ padding: "10px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Loading...
                  </p>
                )}
                {!searchLoading && searchResults.length === 0 && (
                  <p style={{ padding: "10px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    No results found
                  </p>
                )}
                {!searchLoading &&
                  searchResults.map((item) => {
                    const title = item.title || item.name;
                    const type = item.title ? "movie" : "tv";
                    const year = (item.release_date || item.first_air_date || "").substring(0, 4) || "N/A";
                    const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : "N/A";
                    const posterUrl = item.poster_path
                      ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                      : "";

                    return (
                      <Link
                        key={item.id}
                        href={`/details?id=${item.id}&type=${type}`}
                        className="search-item"
                        onClick={handleSearchItemClick}
                      >
                        {posterUrl ? (
                          <img src={posterUrl} alt={title} />
                        ) : (
                          <div style={{ width: "40px", height: "56px", display: "flex", justifyContent: "center", alignItems: "center", background: "#161827", borderRadius: "4px" }}>
                            <ion-icon name="image-outline" style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.1)" }}></ion-icon>
                          </div>
                        )}
                        <div className="search-item-info">
                          <div className="search-item-title">{title}</div>
                          <div className="search-item-meta">
                            <span className="search-item-badge">
                              {type === "movie" ? "Movie" : "Series"}
                            </span>
                            <span>⭐ {rating}</span>
                            <span>{year}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Hamburger Menu button */}
          <div
            className={`burger-menu ${mobileMenuOpen ? "active" : ""}`}
            id="burgerMenu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
}
