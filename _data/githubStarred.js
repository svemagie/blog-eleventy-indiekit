/**
 * GitHub Starred Repos Metadata
 * Provides build timestamp only — the starred page fetches all data
 * client-side via Alpine.js to avoid loading 5000+ objects into
 * Eleventy's memory during build (causes OOM on constrained containers).
 */

export default function () {
  return {
    buildDate: new Date().toISOString(),
  };
}
