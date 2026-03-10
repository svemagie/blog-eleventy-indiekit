/**
 * Shared data-fetching helper for _data files.
 *
 * Wraps @11ty/eleventy-fetch with two protections:
 *   1. Hard timeout — 10-second AbortController ceiling on every request
 *   2. Watch-mode cache extension — uses "4h" TTL during watch/serve,
 *      keeping the original (shorter) TTL only for production builds
 *
 * Usage:
 *   import { cachedFetch } from "../lib/data-fetch.js";
 *   const data = await cachedFetch(url, { duration: "15m", type: "json" });
 */

import EleventyFetch from "@11ty/eleventy-fetch";

const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

// In watch/serve mode, extend cache to avoid re-fetching on every rebuild.
// Production builds use the caller's original TTL for fresh data.
const isWatchMode = process.env.ELEVENTY_RUN_MODE !== "build";
const WATCH_MODE_DURATION = "4h";

/**
 * Fetch with timeout and watch-mode cache extension.
 *
 * @param {string} url - URL to fetch
 * @param {object} options - EleventyFetch options (duration, type, fetchOptions, etc.)
 * @returns {Promise<any>} Parsed response
 */
export async function cachedFetch(url, options = {}) {
  // Extend cache in watch mode
  const duration = isWatchMode ? WATCH_MODE_DURATION : (options.duration || "15m");

  // Create abort controller for hard timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const fetchOptions = {
      ...options.fetchOptions,
      signal: controller.signal,
    };

    const result = await EleventyFetch(url, {
      ...options,
      duration,
      fetchOptions,
    });

    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}
