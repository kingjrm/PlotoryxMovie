import { NextResponse } from "next/server";

const domains = {
  1: "https://vsrc.su",
  2: "https://vidsrcme.ru",
  3: "https://vidsrc.cc",
  4: "https://vidlink.pro",
  5: "https://embed.su",
  6: "https://autoembed.cc",
  7: "https://moviesapi.club",
  8: "https://multiembed.to",
};

export async function GET() {
  const results = {};

  const checkServer = async (id, url) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      // Status codes between 200 and 499 are considered online.
      const online = response.status >= 200 && response.status <= 499;

      results[id] = {
        online,
        status: response.status,
        error: null,
      };
    } catch (err) {
      // If the error is an AbortError, it was a timeout. Otherwise it could be network error.
      const isTimeout = err.name === "AbortError";
      results[id] = {
        online: false,
        status: 0,
        error: isTimeout ? "Timeout" : err.message || "Network Error",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const checkPromises = Object.entries(domains).map(([id, url]) =>
    checkServer(id, url)
  );

  await Promise.all(checkPromises);

  return NextResponse.json(results);
}
