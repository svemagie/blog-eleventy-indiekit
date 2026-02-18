/**
 * Computed data resolved during the data cascade (sequential, per-page).
 *
 * Eleventy 3.x renders Nunjucks templates in parallel, which causes
 * `page.url` and `page.fileSlug` to return wrong values when read
 * via {% set %} in templates. By computing OG-related values here,
 * they are resolved before parallel rendering begins.
 *
 * See: https://github.com/11ty/eleventy/issues/3183
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  ogSlug: (data) => {
    const url = data.page?.url;
    if (!url) return "";
    return url.replace(/\/$/, "").split("/").pop();
  },

  hasOgImage: (data) => {
    const url = data.page?.url;
    if (!url) return false;
    const slug = url.replace(/\/$/, "").split("/").pop();
    if (!slug) return false;
    const ogPath = resolve(__dirname, "..", ".cache", "og", `${slug}.png`);
    return existsSync(ogPath);
  },
};
