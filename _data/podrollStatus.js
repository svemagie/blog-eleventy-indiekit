/**
 * Podroll Status Data
 * Checks if the podroll API backend is available at build time.
 * Used for conditional navigation — the podroll page itself loads data client-side.
 */

import { cachedFetch } from "../lib/data-fetch.js";

const INDIEKIT_URL = process.env.SITE_URL || "https://example.com";

export default async function () {
  try {
    const url = `${INDIEKIT_URL}/podrollapi/api/status`;
    console.log(`[podrollStatus] Checking API: ${url}`);
    const data = await cachedFetch(url, {
      duration: "15m",
      type: "json",
    });
    console.log("[podrollStatus] API available");
    return {
      available: true,
      source: "indiekit",
      ...data,
    };
  } catch (error) {
    console.log(
      `[podrollStatus] API unavailable: ${error.message}`
    );
    return {
      available: false,
      source: "unavailable",
    };
  }
}
