import { fetchFromTMDB } from "@/config/tmdb";
import MovieCard from "@/components/MovieCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TrendingPage({ searchParams }) {
  // Resolve searchParams before accessing properties
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));
  
  const trending = await fetchFromTMDB("/trending/all/day", { page: page.toString() });

  return (
    <div className="container" style={{ paddingTop: "calc(var(--header-height) + 40px)", minHeight: "80vh" }}>
      <h1 style={{ marginBottom: "30px" }}>Trending Now</h1>
      
      <div className="movie-grid">
        {trending && trending.results ? (
          trending.results.map((item, idx) => (
            <MovieCard key={`${item.id}-${idx}`} item={item} />
          ))
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>No trending items found.</p>
        )}
      </div>
      
      {/* Pagination controls */}
      <div style={{ display: "flex", justifyContent: "center", margin: "40px 0", gap: "20px" }}>
        {page > 1 && (
          <Link
            href={`/trending?page=${page - 1}`}
            className="btn"
            style={{ background: "#333", color: "white", padding: "10px 20px" }}
          >
            Previous
          </Link>
        )}
        <Link
          href={`/trending?page=${page + 1}`}
          className="btn"
          style={{ background: "#333", color: "white", padding: "10px 20px" }}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
