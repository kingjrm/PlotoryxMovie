const TMDB_API_KEY = process.env.TMDB_API_KEY || "7b32ad01207d183920ef3b1db854fd1f";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function fetchFromTMDB(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} on endpoint ${endpoint}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`TMDB fetch failed on endpoint ${endpoint}:`, error);
    return null;
  }
}
