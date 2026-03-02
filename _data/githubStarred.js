/**
 * GitHub Starred Repos Data
 * Fetches all cached starred repos from Indiekit's GitHub endpoint
 * Uses EleventyFetch with 1-day cache (plugin handles freshness)
 */

import EleventyFetch from "@11ty/eleventy-fetch";

const INDIEKIT_URL = process.env.SITE_URL || "https://example.com";

export default async function () {
  const buildDate = new Date().toISOString();

  try {
    const url = `${INDIEKIT_URL}/githubapi/api/starred/all`;
    console.log(`[githubStarred] Fetching from: ${url}`);

    const data = await EleventyFetch(url, {
      duration: "1d",
      type: "json",
    });

    console.log(
      `[githubStarred] Loaded ${data.stars?.length || 0} starred repos (total: ${data.totalCount})`,
    );

    return {
      stars: data.stars || [],
      totalCount: data.totalCount || 0,
      lastSync: data.lastSync || null,
      buildDate,
      source: "indiekit",
    };
  } catch (error) {
    console.log(`[githubStarred] API unavailable: ${error.message}`);
    return {
      stars: [],
      totalCount: 0,
      lastSync: null,
      buildDate,
      source: "error",
    };
  }
}
