/**
 * Computed data resolved during the data cascade.
 *
 * Eleventy 3.x parallel rendering causes `page.url` and `page.fileSlug`
 * to return values from OTHER pages being processed concurrently.
 * This affects both templates and eleventyComputed functions.
 *
 * Fix: ALL computed values derive from `page.inputPath` (the physical file
 * path on disk), which is always correct regardless of parallel rendering.
 * NEVER use `page.url` or `page.fileSlug` here.
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

    // OG image slug — derive from inputPath (physical file), NOT page.url.
    // page.url suffers from Eleventy 3.x parallel rendering race conditions
    // where it can return the URL of a DIFFERENT page being processed concurrently.
    // inputPath is the physical file path, which is always correct.
    // OG images are generated as {yyyy}-{MM}-{dd}-{slug}.png by lib/og.js.
    ogSlug: (data) => {
      const inputPath = data.page?.inputPath || "";
      const match = inputPath.match(
        /content\/([^/]+)\/(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/,
      );
      if (match) {
        const [, , year, month, day, slug] = match;
        return `${year}-${month}-${day}-${slug}`;
      }
      // Fallback for pages/root files: use last path segment
      const segments = inputPath.split("/").filter(Boolean);
      const last = segments[segments.length - 1] || "";
      return last.replace(/\.md$/, "");
    },

    hasOgImage: (data) => {
      const inputPath = data.page?.inputPath || "";
      const match = inputPath.match(
        /content\/([^/]+)\/(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/,
      );
      let slug;
      if (match) {
        const [, , year, month, day, s] = match;
        slug = `${year}-${month}-${day}-${s}`;
      } else {
        const segments = inputPath.split("/").filter(Boolean);
        const last = segments[segments.length - 1] || "";
        slug = last.replace(/\.md$/, "");
      }
      if (!slug) return false;
      const ogPath = resolve(__dirname, "..", ".cache", "og", `${slug}.png`);
      return existsSync(ogPath);
    },
  },
};
