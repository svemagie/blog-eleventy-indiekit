/**
 * Homepage Configuration Data
 * Reads config from indiekit-endpoint-homepage plugin (when installed).
 * Falls back to null — home.njk then uses the default layout.
 *
 * Future: The homepage plugin will write a .indiekit/homepage.json file
 * that Eleventy watches. On change, a rebuild picks up the new config,
 * allowing layout changes without a Docker rebuild.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CONTENT_DIR = process.env.CONTENT_DIR || "/data/content";

export default function () {
  try {
    const configPath = resolve(CONTENT_DIR, ".indiekit", "homepage.json");
    const raw = readFileSync(configPath, "utf8");
    const config = JSON.parse(raw);
    console.log("[homepageConfig] Loaded plugin config");
    return config;
  } catch {
    // No homepage plugin config — this is the normal case for most deployments
    return null;
  }
}
