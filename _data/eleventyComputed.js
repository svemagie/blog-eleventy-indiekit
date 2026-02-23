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
  eleventyComputed: {
    // Compute permalink from file path for posts without explicit frontmatter permalink.
    // Pattern: content/{type}/{yyyy}-{MM}-{dd}-{slug}.md → /{type}/{yyyy}/{MM}/{dd}/{slug}/
    permalink: (data) => {
      // If frontmatter already has permalink, use it (new posts from preset)
      if (data.permalink) return data.permalink;

      // Only compute for files matching the dated post pattern
      const inputPath = data.page?.inputPath || "";
      const match = inputPath.match(
        /content\/([^/]+)\/(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/
      );
      if (match) {
        const [, type, year, month, day, slug] = match;
        return `/${type}/${year}/${month}/${day}/${slug}/`;
      }

      // For non-matching files (pages, root files), preserve existing permalink or let Eleventy decide
      return data.permalink;
    },

    // OG image slug — must reconstruct date-prefixed filename from URL segments.
    // OG images are generated as {yyyy}-{MM}-{dd}-{slug}.png by lib/og.js.
    // With new URL structure /type/yyyy/MM/dd/slug/, we reconstruct the filename.
    ogSlug: (data) => {
      const url = data.page?.url || "";
      const segments = url.split("/").filter(Boolean);
      // Date-based URL: /type/yyyy/MM/dd/slug/ → 5 segments
      if (segments.length === 5) {
        const [, year, month, day, slug] = segments;
        return `${year}-${month}-${day}-${slug}`;
      }
      // Fallback: last segment (for pages, legacy URLs)
      return segments[segments.length - 1] || "";
    },

    hasOgImage: (data) => {
      const url = data.page?.url || "";
      const segments = url.split("/").filter(Boolean);
      let slug;
      if (segments.length === 5) {
        const [, year, month, day, s] = segments;
        slug = `${year}-${month}-${day}-${s}`;
      } else {
        slug = segments[segments.length - 1] || "";
      }
      if (!slug) return false;
      const ogPath = resolve(__dirname, "..", ".cache", "og", `${slug}.png`);
      return existsSync(ogPath);
    },
  },
};
