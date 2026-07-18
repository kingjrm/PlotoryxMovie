import { fetchFromTMDB } from "@/config/tmdb";
import DetailsClient from "@/components/DetailsClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DetailsPage({ searchParams }) {
  // Resolve searchParams before accessing properties
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;
  const type = resolvedSearchParams.type || "movie";

  if (!id) {
    notFound();
  }

  const details = await fetchFromTMDB(`/${type}/${id}`, {
    append_to_response: "credits,videos,recommendations",
  });

  if (!details) {
    notFound();
  }

  return (
    <DetailsClient
      details={details}
      id={id}
      type={type}
    />
  );
}
