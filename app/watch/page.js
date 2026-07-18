import { fetchFromTMDB } from "@/config/tmdb";
import WatchClient from "@/components/WatchClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WatchPage({ searchParams }) {
  // Resolve searchParams before accessing properties
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;
  const type = resolvedSearchParams.type || "movie";
  const season = parseInt(resolvedSearchParams.season || "1");
  const episode = parseInt(resolvedSearchParams.episode || "1");

  if (!id) {
    notFound();
  }

  const details = await fetchFromTMDB(`/${type}/${id}`);

  if (!details) {
    notFound();
  }

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
