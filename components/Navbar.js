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
  const [searchTab, setSearchTab] = useState("All");
  const [recentSearches, setRecentSearches] = useState([]);

  const searchInputRef = useRef(null);
  const liveResultsRef = useRef(null);
  const searchBarRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setRecentSearches(JSON.parse(localStorage.getItem("recentSearches")) || []);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "s" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        liveResultsRef.current && !liveResultsRef.current.contains(e.target) &&
        searchBarRef.current && !searchBarRef.current.contains(e.target)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setSearchResults(data.results.filter((i) => i.media_type !== "person").slice(0, 5));
          } else {
            setSearchResults([]);
          }
        } catch (err) {
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

  const saveRecent = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const prev = JSON.parse(localStorage.getItem("recentSearches")) || [];
    const next = [trimmed, ...prev.filter(r => r !== trimmed)].slice(0, 6);
    localStorage.setItem("recentSearches", JSON.stringify(next));
    setRecentSearches(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecent(searchQuery);
      setSearchFocused(false);
      setMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchItemClick = (title) => {
    if (title) saveRecent(title);
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
  };

  const navLinks = [
    { href: "/",          label: "Home",      icon: "home-outline",        iconActive: "home" },
    { href: "/movies",    label: "Movies",    icon: "film-outline",        iconActive: "film" },
    { href: "/tv",        label: "Shows",     icon: "tv-outline",          iconActive: "tv" },
    { href: "/genres",    label: "Genres",    icon: "apps-outline",        iconActive: "apps" },
    { href: "/trending",  label: "Trending",  icon: "trending-up-outline", iconActive: "trending-up" },
    { href: "/favorites", label: "Watchlist", icon: "bookmark-outline",    iconActive: "bookmark" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      <div className="container nav-container">
        <Link href="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <img src="/Plotoryx-Logo.png" alt="Plotoryx" className="brand-logo-img" />
          <span>Plotoryx</span>
        </Link>

        <div className={`nav-links-pill ${mobileMenuOpen ? "active" : ""}`} id="navLinksPill">
          <ul className="nav-links" id="navLinks">
            {navLinks.map(({ href, label, icon, iconActive }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={isActive ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ion-icon name={isActive ? iconActive : icon}></ion-icon>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="nav-actions">
          <div
            className={`search-bar ${mobileSearchOpen ? "active" : ""}`}
            id="searchBar"
            ref={searchBarRef}
          >
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
                onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); setSearchFocused(false); }}
              >
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </form>

            {searchFocused && (
              <div className="search-dropdown" ref={liveResultsRef}>
                {/* Filter tabs */}
                <div className="search-tabs">
                  {["All", "Movies", "Shows", "Anime"].map(tab => (
                    <button
                      key={tab}
                      className={`search-tab-btn ${searchTab === tab ? "active" : ""}`}
                      onClick={() => setSearchTab(tab)}
                    >{tab}</button>
                  ))}
                </div>

                {/* Recent searches — shown when no query */}
                {searchQuery.trim().length <= 2 && recentSearches.length > 0 && (
                  <div className="search-recents">
                    <div className="search-recents-header">
                      <span className="search-recents-label">RECENT</span>
                      <button className="search-clear-btn" onClick={() => { setRecentSearches([]); localStorage.removeItem("recentSearches"); }}>Clear</button>
                    </div>
                    {recentSearches.map((r, i) => (
                      <button key={i} className="search-recent-item" onClick={() => { setSearchQuery(r); setSearchFocused(true); }}>
                        <ion-icon name="time-outline"></ion-icon>
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                {/* Live results */}
                {searchQuery.trim().length > 2 && (
                  <div className="search-results-list">
                    {searchLoading && (
                      <div className="search-loading">
                        <ion-icon name="sync-outline"></ion-icon> Searching...
                      </div>
                    )}
                    {!searchLoading && searchResults.length === 0 && (
                      <div className="search-empty">No results for "{searchQuery}"</div>
                    )}
                    {!searchLoading && searchResults.map((item) => {
                      const itemTitle = item.title || item.name;
                      const itemType = item.title ? "movie" : "tv";
                      const year = (item.release_date || item.first_air_date || "").substring(0, 4);
                      const rating = item.vote_average ? (Math.round(item.vote_average * 10) / 10) : null;
                      const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "";
                      return (
                        <Link key={item.id} href={`/details?id=${item.id}&type=${itemType}`} className="search-result-item" onClick={() => handleSearchItemClick(itemTitle)}>
                          <div className="search-result-thumb">
                            {posterUrl ? <img src={posterUrl} alt={itemTitle} /> : <ion-icon name="film-outline"></ion-icon>}
                          </div>
                          <div className="search-result-info">
                            <div className="search-result-title">{itemTitle}</div>
                            <div className="search-result-meta">
                              {rating && <span className="srm-rating">⭐ {rating}</span>}
                              {year && <span>{year}</span>}
                              <span className="srm-type">{itemType === "movie" ? "Movie" : "TV Show"}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

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
