/**
 * CV Data — reads from indiekit-endpoint-cv plugin data file.
 *
 * The CV plugin writes content/.indiekit/cv.json on every save
 * and on startup. Eleventy reads that file here.
 *
 * Falls back to empty defaults if no plugin is installed.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function () {
  try {
    const cvPath = resolve(__dirname, "..", "content", ".indiekit", "cv.json");
    const raw = readFileSync(cvPath, "utf8");
    const data = JSON.parse(raw);
    console.log("[cv] Loaded CV data from plugin");
    return data;
  } catch {
    // No CV plugin data file — return empty defaults
    return {
      lastUpdated: null,
      experience: [],
      projects: [],
      skills: {},
      skillTypes: {},
      languages: [],
      education: [],
      interests: [],
      interestTypes: {},
    };
  }
}
