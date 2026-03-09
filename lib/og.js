/**
 * OpenGraph image generation for posts without photos.
 * Uses Satori (layout → SVG) + @resvg/resvg-js (SVG → PNG).
 * Generated images are cached in .cache/og/ and passthrough-copied to output.
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { resolve, join, basename, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  bg: "#09090b",
  title: "#f4f4f5",
  date: "#a1a1aa",
  siteName: "#71717a",
  accent: "#3b82f6",
  badge: "#2563eb",
  badgeText: "#ffffff",
};

const POST_TYPE_MAP = {
  articles: "Article",
  notes: "Note",
  bookmarks: "Bookmark",
  photos: "Photo",
  likes: "Like",
  replies: "Reply",
  reposts: "Repost",
  pages: "Page",
  videos: "Video",
  audio: "Audio",
  jams: "Jam",
  rsvps: "RSVP",
  events: "Event",
};

function loadFonts() {
  const fontsDir = resolve(
    __dirname,
    "..",
    "node_modules",
    "@fontsource",
    "inter",
    "files",
  );
  return [
    {
      name: "Inter",
      data: readFileSync(join(fontsDir, "inter-latin-400-normal.woff")),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: readFileSync(join(fontsDir, "inter-latin-700-normal.woff")),
      weight: 700,
      style: "normal",
    },
  ];
}

function computeHash(title, date, postType, siteName) {
  return createHash("md5")
    .update(`${title}|${date}|${postType}|${siteName}`)
    .digest("hex")
    .slice(0, 12);
}

function detectPostType(filePath) {
  const parts = filePath.split("/");
  const contentIdx = parts.indexOf("content");
  if (contentIdx >= 0 && contentIdx + 1 < parts.length) {
    const typeDir = parts[contentIdx + 1];
    if (POST_TYPE_MAP[typeDir]) return POST_TYPE_MAP[typeDir];
  }
  return "Post";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Use the full filename (with date prefix) as the OG image slug.
 * This matches the URL path segment directly, avoiding Eleventy's page.fileSlug
 * race condition in Nunjucks parallel rendering.
 */
function toOgSlug(filename) {
  return filename;
}

function truncateTitle(title, max = 120) {
  if (!title || title.length <= max) return title || "Untitled";
  return title.slice(0, max).trim() + "\u2026";
}

function extractBodyText(raw) {
  const body = raw
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~`>]/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (!body) return "Untitled";
  return body.length > 120 ? body.slice(0, 120).trim() + "\u2026" : body;
}

function buildCard(title, dateStr, postType, siteName) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        backgroundColor: COLORS.bg,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              width: "6px",
              height: "100%",
              backgroundColor: COLORS.accent,
              flexShrink: 0,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "60px",
              flex: 1,
              overflow: "hidden",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { display: "flex" },
                        children: [
                          {
                            type: "span",
                            props: {
                              style: {
                                backgroundColor: COLORS.badge,
                                color: COLORS.badgeText,
                                fontSize: "16px",
                                fontWeight: 700,
                                fontFamily: "Inter",
                                padding: "6px 16px",
                                borderRadius: "999px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              },
                              children: postType,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          color: COLORS.title,
                          fontSize: "48px",
                          fontWeight: 700,
                          fontFamily: "Inter",
                          lineHeight: 1.2,
                          overflow: "hidden",
                        },
                        children: truncateTitle(title),
                      },
                    },
                    dateStr
                      ? {
                          type: "div",
                          props: {
                            style: {
                              color: COLORS.date,
                              fontSize: "24px",
                              fontWeight: 400,
                              fontFamily: "Inter",
                            },
                            children: formatDate(dateStr),
                          },
                        }
                      : null,
                  ].filter(Boolean),
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    color: COLORS.siteName,
                    fontSize: "20px",
                    fontWeight: 400,
                    fontFamily: "Inter",
                  },
                  children: siteName,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function scanContentFiles(contentDir) {
  const files = [];
  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === ".indiekit") continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }
  walk(contentDir);
  return files;
}

/**
 * Generate OG images for all content posts without photos.
 * @param {string} contentDir - Path to content/ directory
 * @param {string} cacheDir - Path to .cache/ directory
 * @param {string} siteName - Site name for the card
 * @param {number} batchSize - Max images to generate (0 = unlimited)
 * @returns {{ hasMore: boolean }} Whether more images need generation
 */
export async function generateOgImages(contentDir, cacheDir, siteName, batchSize = 0) {
  const ogDir = join(cacheDir, "og");
  mkdirSync(ogDir, { recursive: true });

  const manifestPath = join(ogDir, "manifest.json");
  let manifest = {};
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    // First run
  }

  const fonts = loadFonts();
  const mdFiles = scanContentFiles(contentDir);

  let generated = 0;
  let skipped = 0;
  // Seed with existing manifest so unscanned entries survive batch writes
  const newManifest = { ...manifest };
  const SAVE_INTERVAL = 10;
  // GC every 5 images to keep WASM native memory bounded.
  // Satori (Yoga WASM) + Resvg (Rust WASM) allocate ~50-100 MB native memory
  // per image that V8 doesn't track. Without aggressive GC, native memory
  // grows unbounded and OOM-kills the process in constrained containers.
  const GC_INTERVAL = 5;
  const hasGC = typeof global.gc === "function";
  let peakRss = 0;

  for (const filePath of mdFiles) {
    const raw = readFileSync(filePath, "utf8");
    const { data: fm } = matter(raw);

    if (fm.photo || fm.image) {
      skipped++;
      continue;
    }

    const slug = toOgSlug(basename(filePath, ".md"));
    const title = fm.title || fm.name || extractBodyText(raw);
    const date = fm.published || fm.date || "";
    const postType = detectPostType(filePath);
    const hash = computeHash(title, date, postType, siteName);

    if (manifest[slug]?.hash === hash && existsSync(join(ogDir, `${slug}.png`))) {
      newManifest[slug] = manifest[slug];
      skipped++;
      continue;
    }

    const card = buildCard(title, date, postType, siteName);
    const svg = await satori(card, { width: WIDTH, height: HEIGHT, fonts });
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: WIDTH },
    });
    const pngBuffer = resvg.render().asPng();

    writeFileSync(join(ogDir, `${slug}.png`), pngBuffer);
    newManifest[slug] = { title: slug, hash };
    generated++;

    // Save manifest periodically to preserve progress on OOM kill
    if (generated % SAVE_INTERVAL === 0) {
      writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));
    }

    // Force GC to reclaim Satori/Resvg WASM native memory.
    // V8 doesn't track native heap (Satori Yoga WASM + Resvg Rust WASM),
    // so without frequent GC the JS wrappers accumulate and native memory
    // grows unbounded. Every 5 images keeps peak RSS under ~400 MB.
    if (hasGC && generated % GC_INTERVAL === 0) {
      global.gc();
      const rss = process.memoryUsage().rss;
      if (rss > peakRss) peakRss = rss;
    }

    // Batch limit: stop after N images so the caller can re-spawn
    // (fully releasing WASM native memory between batches)
    if (batchSize > 0 && generated >= batchSize) {
      break;
    }
  }

  const hasMore = batchSize > 0 && generated >= batchSize;

  if (hasGC) global.gc();
  writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));
  const mem = process.memoryUsage();
  if (mem.rss > peakRss) peakRss = mem.rss;
  console.log(
    `[og] Generated ${generated} images, skipped ${skipped} (cached or have photos)` +
    (hasMore ? ` [batch, more remain]` : ``) +
    ` | RSS: ${(mem.rss / 1024 / 1024).toFixed(0)} MB, peak: ${(peakRss / 1024 / 1024).toFixed(0)} MB, heap: ${(mem.heapUsed / 1024 / 1024).toFixed(0)} MB`,
  );

  return { hasMore };
}
