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
      // Convert stale /content/ permalinks from pre-beta.37 posts to canonical format
      if (data.permalink && typeof data.permalink === "string") {
        const contentMatch = data.permalink.match(
          /^\/content\/([^/]+)\/(\d{4})-(\d{2})-(\d{2})-(.+?)\/?$/
        );
        if (contentMatch) {
          const [, type, year, month, day, slug] = contentMatch;
          return `/${type}/${year}/${month}/${day}/${slug}/`;
        }
        // Valid non-/content/ permalink — use as-is
        return data.permalink;
      }

      // No frontmatter permalink — compute from file path
      const inputPath = data.page?.inputPath || "";
      const match = inputPath.match(
        /content\/([^/]+)\/(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/
      );
      if (match) {
        const [, type, year, month, day, slug] = match;
        return `/${type}/${year}/${month}/${day}/${slug}/`;
      }

      // For non-matching files (pages, root files), let Eleventy decide
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
