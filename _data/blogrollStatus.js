/**
 * Blogroll Status Data
 * Checks if the blogroll API backend is available at build time.
 * Used for conditional navigation — the blogroll page itself loads data client-side.
 */

import EleventyFetch from "@11ty/eleventy-fetch";

const INDIEKIT_URL = process.env.SITE_URL || "https://example.com";

export default async function () {
  try {
    const url = `${INDIEKIT_URL}/blogrollapi/api/status`;
    console.log(`[blogrollStatus] Checking API: ${url}`);
    const data = await EleventyFetch(url, {
      duration: "15m",
      type: "json",
    });
    console.log("[blogrollStatus] API available");
    return {
      available: true,
      source: "indiekit",
      ...data,
    };
  } catch (error) {
    console.log(
      `[blogrollStatus] API unavailable: ${error.message}`
    );
    return {
      available: false,
      source: "unavailable",
    };
  }
}
