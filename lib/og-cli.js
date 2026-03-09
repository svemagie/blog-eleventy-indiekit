#!/usr/bin/env node

/**
 * CLI entry point for OG image generation.
 * Runs as a separate process to isolate memory from Eleventy.
 *
 * Usage: node lib/og-cli.js <contentDir> <cacheDir> <siteName> [batchSize]
 *
 * batchSize: Max images to generate per invocation (0 = unlimited).
 *            When set, exits after generating that many images so the caller
 *            can re-spawn (releasing all WASM native memory between batches).
 *            Exit code 2 = batch complete, more work remains.
 */

import { generateOgImages } from "./og.js";

const [contentDir, cacheDir, siteName, batchSizeStr] = process.argv.slice(2);

if (!contentDir || !cacheDir || !siteName) {
  console.error("[og] Usage: node og-cli.js <contentDir> <cacheDir> <siteName> [batchSize]");
  process.exit(1);
}

const batchSize = parseInt(batchSizeStr, 10) || 0;
const result = await generateOgImages(contentDir, cacheDir, siteName, batchSize);

// Exit code 2 signals "batch complete, more images remain"
if (result?.hasMore) {
  process.exit(2);
}
