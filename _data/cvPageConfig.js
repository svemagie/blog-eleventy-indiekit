/**
 * CV Page Configuration Data
 * Reads config from indiekit-endpoint-cv plugin CV page builder.
 * Falls back to null — cv.njk then uses the default hardcoded layout.
 *
 * The CV plugin writes a .indiekit/cv-page.json file that Eleventy watches.
 * On change, a rebuild picks up the new config, allowing layout changes
 * without a Docker rebuild.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function () {
  try {
    // Resolve via the content/ symlink relative to the Eleventy project
    const configPath = resolve(__dirname, "..", "content", ".indiekit", "cv-page.json");
    const raw = readFileSync(configPath, "utf8");
    const config = JSON.parse(raw);
    console.log("[cvPageConfig] Loaded CV page builder config");
    return config;
  } catch {
    // No CV page builder config — fall back to hardcoded layout in cv.njk
    return null;
  }
}
