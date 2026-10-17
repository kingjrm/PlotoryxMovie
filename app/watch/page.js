import { fetchFromTMDB } from "@/config/tmdb";
import WatchClient from "@/components/WatchClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WatchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;
  const type = resolvedSearchParams.type || "movie";
  const season = parseInt(resolvedSearchParams.season || "1");
  const episode = parseInt(resolvedSearchParams.episode || "1");

  if (!id) notFound();

  const [details, recommendations] = await Promise.all([
    fetchFromTMDB(`/${type}/${id}`),
    fetchFromTMDB(`/${type}/${id}/recommendations`).catch(() => null),
  ]);

  if (!details) notFound();

  // Merge recommendations into details
  if (recommendations) details.recommendations = recommendations;

  return (
    <WatchClient
      details={details}
      id={id}
      type={type}
      initialSeason={season}
      initialEpisode={episode}
    />
  );
}
