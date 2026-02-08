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
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function () {
  try {
    // Resolve via the content/ symlink relative to the Eleventy project
    const configPath = resolve(__dirname, "..", "content", ".indiekit", "homepage.json");
    const raw = readFileSync(configPath, "utf8");
    const config = JSON.parse(raw);
    console.log("[homepageConfig] Loaded plugin config");
    return config;
  } catch {
    // No homepage plugin config — this is the normal case for most deployments
    return null;
  }
}
