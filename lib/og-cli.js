#!/usr/bin/env node

/**
 * CLI entry point for OG image generation.
 * Runs as a separate process to isolate memory from Eleventy.
 *
 * Usage: node lib/og-cli.js <contentDir> <cacheDir> <siteName>
 */

import { generateOgImages } from "./og.js";

const [contentDir, cacheDir, siteName] = process.argv.slice(2);

if (!contentDir || !cacheDir || !siteName) {
  console.error("[og] Usage: node og-cli.js <contentDir> <cacheDir> <siteName>");
  process.exit(1);
}

await generateOgImages(contentDir, cacheDir, siteName);
