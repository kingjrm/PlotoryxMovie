import { fetchFromTMDB } from "@/config/tmdb";
import DetailsClient from "@/components/DetailsClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DetailsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;
  const type = resolvedSearchParams.type || "movie";

  if (!id) notFound();

  const appendFields = type === "tv"
    ? "credits,videos,recommendations,content_ratings,seasons"
    : "credits,videos,recommendations,release_dates";

  const details = await fetchFromTMDB(`/${type}/${id}`, {
    append_to_response: appendFields,
  });

  if (!details) notFound();

  // For TV: fetch Season 1 episodes
  let seasonEpisodes = [];
  if (type === "tv") {
    try {
      const seasonData = await fetchFromTMDB(`/tv/${id}/season/1`, {});
      seasonEpisodes = seasonData?.episodes || [];
    } catch (e) {}
  }

  return (
    <DetailsClient
      details={{ ...details, season_episodes: seasonEpisodes }}
      id={id}
      type={type}
    />
  );
}
