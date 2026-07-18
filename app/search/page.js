import { fetchFromTMDB } from "@/config/tmdb";
import MovieCard from "@/components/MovieCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  // Resolve searchParams before accessing properties
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));

  let results = null;
  let popular = null;

  if (query) {
    results = await fetchFromTMDB("/search/multi", {
      query,
      page: page.toString(),
    });
  }

  // Fetch popular recommendations if search has no results
  if (!results || !results.results || results.results.length === 0) {
    popular = await fetchFromTMDB("/trending/all/day");
  }

  const searchItems = results?.results?.filter((item) => item.media_type !== "person") || [];

  return (
    <div className="container" style={{ paddingTop: "calc(var(--header-height) + 40px)", minHeight: "80vh" }}>
      {searchItems.length > 0 ? (
        <>
          <h1 style={{ marginBottom: "30px", fontWeight: 700, fontFamily: "var(--font-family-title)", color: "var(--text-secondary)", fontSize: "1.6rem" }}>
            Explore titles related to: <span style={{ color: "var(--text-primary)" }}>&quot;{query}&quot;</span>
          </h1>
          
          <div className="movie-grid">
            {searchItems.map((item, idx) => (
              <MovieCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="no-results" style={{ padding: "40px 0" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "25px", fontSize: "1.15rem", fontWeight: 500 }}>
            Your search for &quot;<strong>{query}</strong>&quot; did not have any matches.
          </p>
          
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "26px", borderRadius: "12px", marginBottom: "50px", maxWidth: "600px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "1.1rem", color: "var(--text-primary)", fontFamily: "var(--font-family-title)", fontWeight: 700 }}>Suggestions:</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px", color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "0.95rem" }}>
              <li>Try different keywords</li>
              <li>Looking for a movie or TV show? Try searching for its title</li>
              <li>Try searching for a genre name (e.g. Action, Comedy, Romance)</li>
            </ul>
          </div>
          
          <h2 style={{ fontSize: "1.45rem", fontWeight: 700, marginBottom: "25px", fontFamily: "var(--font-family-title)", borderLeft: "4px solid var(--accent)", paddingLeft: "12px", letterSpacing: "0.5px" }}>POPULAR SEARCHES</h2>
          <div className="movie-grid">
            {popular?.results?.slice(0, 12).map((item, idx) => (
              <MovieCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
