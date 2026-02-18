import pluginWebmentions from "@chrisburnell/eleventy-cache-webmentions";
import pluginRss from "@11ty/eleventy-plugin-rss";
import embedEverything from "eleventy-plugin-embed-everything";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import sitemap from "@quasibit/eleventy-plugin-sitemap";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { minify } from "html-minifier-terser";
import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { generateOgImages } from "./lib/og.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteUrl = process.env.SITE_URL || "https://example.com";

export default function (eleventyConfig) {
  // Don't use .gitignore for determining what to process
  // (content/ is in .gitignore because it's a symlink, but we need to process it)
  eleventyConfig.setUseGitIgnore(false);

  // Ignore output directory (prevents re-processing generated files via symlink)
  eleventyConfig.ignores.add("_site");
  eleventyConfig.ignores.add("_site/**");
  eleventyConfig.ignores.add("/app/data/site");
  eleventyConfig.ignores.add("/app/data/site/**");
  eleventyConfig.ignores.add("node_modules");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add("README.md");

  // Ignore Pagefind output directory
  eleventyConfig.ignores.add("_pagefind");
  eleventyConfig.ignores.add("_pagefind/**");

  // Configure watch targets to exclude output directory
  eleventyConfig.watchIgnores.add("_site");
  eleventyConfig.watchIgnores.add("_site/**");
  eleventyConfig.watchIgnores.add("/app/data/site");
  eleventyConfig.watchIgnores.add("/app/data/site/**");
  eleventyConfig.watchIgnores.add("_pagefind");
  eleventyConfig.watchIgnores.add("_pagefind/**");

  // Configure markdown-it with linkify enabled (auto-convert URLs to links)
  const md = markdownIt({
    html: true,
    linkify: true,  // Auto-convert URLs to clickable links
    typographer: true,
  });
  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
    slugify: (s) => s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, ""),
    level: [2, 3, 4],
  });
  eleventyConfig.setLibrary("md", md);

  // Syntax highlighting for fenced code blocks (```lang)
  eleventyConfig.addPlugin(syntaxHighlight);

  // RSS plugin for feed filters (dateToRfc822, absoluteUrl, etc.)
  // Custom feed templates in feed.njk and feed-json.njk use these filters
  eleventyConfig.addPlugin(pluginRss);

  // JSON encode filter for JSON feed
  eleventyConfig.addFilter("jsonEncode", (value) => {
    return JSON.stringify(value);
  });

  // Guess MIME type from URL extension
  function guessMimeType(url, category) {
    const lower = (typeof url === "string" ? url : "").toLowerCase();
    if (category === "photo") {
      if (lower.includes(".png")) return "image/png";
      if (lower.includes(".gif")) return "image/gif";
      if (lower.includes(".webp")) return "image/webp";
      if (lower.includes(".svg")) return "image/svg+xml";
      return "image/jpeg";
    }
    if (category === "audio") {
      if (lower.includes(".ogg") || lower.includes(".opus")) return "audio/ogg";
      if (lower.includes(".flac")) return "audio/flac";
      if (lower.includes(".wav")) return "audio/wav";
      return "audio/mpeg";
    }
    if (category === "video") {
      if (lower.includes(".webm")) return "video/webm";
      if (lower.includes(".mov")) return "video/quicktime";
      return "video/mp4";
    }
    return "application/octet-stream";
  }

  // Extract URL string from value that may be a string or {url, alt} object
  function resolveMediaUrl(value) {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && value.url) return value.url;
    return null;
  }

  // Feed attachments filter — builds JSON Feed attachments array from post data
  eleventyConfig.addFilter("feedAttachments", (postData) => {
    const attachments = [];
    const processMedia = (items, category) => {
      const list = Array.isArray(items) ? items : [items];
      for (const item of list) {
        const rawUrl = resolveMediaUrl(item);
        if (!rawUrl) continue;
        const url = rawUrl.startsWith("http") ? rawUrl : `${siteUrl}${rawUrl}`;
        attachments.push({ url, mime_type: guessMimeType(rawUrl, category) });
      }
    };
    if (postData.photo) processMedia(postData.photo, "photo");
    if (postData.audio) processMedia(postData.audio, "audio");
    if (postData.video) processMedia(postData.video, "video");
    return attachments;
  });

  // Textcasting support filter — builds clean support object excluding null values
  eleventyConfig.addFilter("textcastingSupport", (support) => {
    if (!support) return {};
    const obj = {};
    if (support.url) obj.url = support.url;
    if (support.stripe) obj.stripe = support.stripe;
    if (support.lightning) obj.lightning = support.lightning;
    if (support.paymentPointer) obj.payment_pointer = support.paymentPointer;
    return obj;
  });

  // Protocol type filter — classifies a URL by its origin protocol/network
  eleventyConfig.addFilter("protocolType", (url) => {
    if (!url || typeof url !== "string") return "web";
    const lower = url.toLowerCase();
    if (lower.includes("bsky.app") || lower.includes("bluesky")) return "atmosphere";
    // Match Fediverse instances by known domain patterns (avoid overly broad "social")
    if (lower.includes("mastodon.") || lower.includes("mstdn.") || lower.includes("fosstodon.") ||
        lower.includes("pleroma.") || lower.includes("misskey.") || lower.includes("pixelfed.") ||
        lower.includes("fediverse")) return "fediverse";
    return "web";
  });

  // Email obfuscation filter - converts email to HTML entities
  // Blocks ~95% of spam harvesters while remaining valid for microformat parsers
  // Usage: {{ email | obfuscateEmail }} or {{ email | obfuscateEmail("href") }}
  eleventyConfig.addFilter("obfuscateEmail", (email, mode = "display") => {
    if (!email) return "";
    // Convert each character to HTML decimal entity
    const encoded = [...email].map(char => `&#${char.charCodeAt(0)};`).join("");
    if (mode === "href") {
      // For mailto: links, also encode the "mailto:" prefix
      const mailto = [...("mailto:")].map(char => `&#${char.charCodeAt(0)};`).join("");
      return mailto + encoded;
    }
    return encoded;
  });

  // Alias dateToRfc822 (plugin provides dateToRfc2822)
  eleventyConfig.addFilter("dateToRfc822", (date) => {
    return pluginRss.dateToRfc2822(date);
  });

  // Embed Everything - auto-embed YouTube, Vimeo, Bluesky, Mastodon, etc.
  eleventyConfig.addPlugin(embedEverything, {
    use: ["youtube", "vimeo", "twitter", "mastodon", "bluesky", "spotify", "soundcloud"],
    youtube: {
      options: {
        lite: false,
        recommendSelfOnly: true,
      },
    },
    mastodon: {
      options: {
        server: "mstdn.social",
      },
    },
  });

  // Custom transform to convert YouTube links to embeds
  eleventyConfig.addTransform("youtube-link-to-embed", function (content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }
    // Match <a> tags where href contains youtube.com/watch or youtu.be
    // Link text can be: URL, www.youtube..., youtube..., or youtube-related text
    const youtubePattern = /<a[^>]+href="https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)[^"]*"[^>]*>(?:https?:\/\/)?(?:www\.)?[^<]*(?:youtube|youtu\.be)[^<]*<\/a>/gi;

    content = content.replace(youtubePattern, (match, videoId) => {
      // Use standard YouTube iframe with exact oEmbed parameters
      return `</p><div class="video-embed"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="YouTube video"></iframe></div><p>`;
    });

    // Clean up empty <p></p> tags created by the replacement
    content = content.replace(/<p>\s*<\/p>/g, '');

    return content;
  });

  // Image optimization - transforms <img> tags automatically
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp", "jpeg"],
    widths: ["auto"],
    failOnError: false,
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "auto",
      alt: "",
    },
  });

  // Sitemap generation
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: siteUrl,
    },
  });

  // HTML minification — only during initial build, skip during watch rebuilds
  eleventyConfig.addTransform("htmlmin", async function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html") && process.env.ELEVENTY_RUN_MODE === "build") {
      return await minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        html5: true,
        decodeEntities: true,
        minifyCSS: false,
        minifyJS: false,
      });
    }
    return content;
  });

  // Copy static assets to output
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy({ ".cache/og": "og" });

  // Watch for content changes
  eleventyConfig.addWatchTarget("./content/");
  eleventyConfig.addWatchTarget("./css/");

  // Webmentions plugin configuration
  const wmDomain = siteUrl.replace("https://", "").replace("http://", "");
  eleventyConfig.addPlugin(pluginWebmentions, {
    domain: siteUrl,
    feed: `http://127.0.0.1:8080/webmentions/api/mentions?per-page=10000`,
    key: "children",
  });

  // Date formatting filter
  eleventyConfig.addFilter("dateDisplay", (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // ISO date filter
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    return new Date(dateObj).toISOString();
  });

  // Truncate filter
  eleventyConfig.addFilter("truncate", (str, len = 200) => {
    if (!str) return "";
    if (str.length <= len) return str;
    return str.slice(0, len).trim() + "...";
  });

  // Clean excerpt for OpenGraph - strips HTML, decodes entities, removes extra whitespace
  eleventyConfig.addFilter("ogDescription", (content, len = 200) => {
    if (!content) return "";
    // Strip HTML tags
    let text = content.replace(/<[^>]+>/g, ' ');
    // Decode common HTML entities
    text = text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&nbsp;/g, ' ');
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Truncate
    if (text.length > len) {
      text = text.slice(0, len).trim() + "...";
    }
    return text;
  });

  // Extract first image from content for OpenGraph fallback
  eleventyConfig.addFilter("extractFirstImage", (content) => {
    if (!content) return null;
    // Match <img> tags and extract src attribute
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      let src = imgMatch[1];
      // Skip data URIs and external placeholder images
      if (src.startsWith('data:')) return null;
      // Return the src (will be made absolute in template)
      return src;
    }
    return null;
  });

  // Head filter for arrays
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || n < 1) return array;
    return array.slice(0, n);
  });

  // Slugify filter
  eleventyConfig.addFilter("slugify", (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  // Hash filter for cache busting - generates MD5 hash of file content
  eleventyConfig.addFilter("hash", (filePath) => {
    try {
      const fullPath = resolve(__dirname, filePath.startsWith("/") ? `.${filePath}` : filePath);
      const content = readFileSync(fullPath);
      return createHash("md5").update(content).digest("hex").slice(0, 8);
    } catch {
      // Return timestamp as fallback if file not found
      return Date.now().toString(36);
    }
  });

  // Check if a generated OG image exists for this page slug
  eleventyConfig.addFilter("hasOgImage", (fileSlug) => {
    if (!fileSlug) return false;
    return existsSync(resolve(__dirname, ".cache", "og", `${fileSlug}.png`));
  });

  // Current timestamp filter (for client-side JS buildtime)
  eleventyConfig.addFilter("timestamp", () => Date.now());

  // Date filter (for sidebar dates)
  eleventyConfig.addFilter("date", (dateObj, format) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    const options = {};

    if (format.includes("MMM")) options.month = "short";
    if (format.includes("d")) options.day = "numeric";
    if (format.includes("yyyy")) options.year = "numeric";

    return date.toLocaleDateString("en-US", options);
  });

  // Webmention filters - with legacy URL support
  // This filter checks both current URL and any legacy URLs from redirects
  eleventyConfig.addFilter("webmentionsForUrl", function (webmentions, url, urlAliases) {
    if (!webmentions || !url) return [];

    // Build list of all URLs to check (current + legacy)
    const urlsToCheck = new Set();

    // Add current URL variations
    const absoluteUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;
    urlsToCheck.add(absoluteUrl);
    urlsToCheck.add(absoluteUrl.replace(/\/$/, ""));
    urlsToCheck.add(absoluteUrl.endsWith("/") ? absoluteUrl : `${absoluteUrl}/`);

    // Add legacy URLs from aliases (if provided)
    if (urlAliases?.aliases) {
      const normalizedUrl = url.replace(/\/$/, "");
      const oldUrls = urlAliases.aliases[normalizedUrl] || [];
      for (const oldUrl of oldUrls) {
        urlsToCheck.add(`${siteUrl}${oldUrl}`);
        urlsToCheck.add(`${siteUrl}${oldUrl}/`);
        urlsToCheck.add(`${siteUrl}${oldUrl}`.replace(/\/$/, ""));
      }
    }

    // Filter webmentions matching any of our URLs
    return webmentions.filter((wm) => urlsToCheck.has(wm["wm-target"]));
  });

  eleventyConfig.addFilter("webmentionsByType", function (mentions, type) {
    if (!mentions) return [];
    const typeMap = {
      likes: "like-of",
      reposts: "repost-of",
      bookmarks: "bookmark-of",
      replies: "in-reply-to",
      mentions: "mention-of",
    };
    const wmProperty = typeMap[type] || type;
    return mentions.filter((m) => m["wm-property"] === wmProperty);
  });

  // Post navigation — find previous/next post in a collection
  // (Nunjucks {% set %} inside {% for %} doesn't propagate, so we need filters)
  eleventyConfig.addFilter("previousInCollection", function (collection, page) {
    if (!collection || !page) return null;
    const index = collection.findIndex((p) => p.url === page.url);
    return index > 0 ? collection[index - 1] : null;
  });

  eleventyConfig.addFilter("nextInCollection", function (collection, page) {
    if (!collection || !page) return null;
    const index = collection.findIndex((p) => p.url === page.url);
    return index >= 0 && index < collection.length - 1
      ? collection[index + 1]
      : null;
  });

  // Collections for different post types
  // Note: content path is content/ due to symlink structure
  // "posts" shows ALL content types combined
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("notes", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/notes/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("articles", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/articles/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("bookmarks", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/bookmarks/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("photos", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/photos/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("likes", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/likes/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Replies collection - posts with inReplyTo/in_reply_to property
  // Supports both camelCase (Indiekit Eleventy preset) and underscore (legacy) names
  eleventyConfig.addCollection("replies", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter((item) => item.data.inReplyTo || item.data.in_reply_to)
      .sort((a, b) => b.date - a.date);
  });

  // Reposts collection - posts with repostOf/repost_of property
  // Supports both camelCase (Indiekit Eleventy preset) and underscore (legacy) names
  eleventyConfig.addCollection("reposts", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter((item) => item.data.repostOf || item.data.repost_of)
      .sort((a, b) => b.date - a.date);
  });

  // Pages collection - root-level slash pages (about, now, uses, etc.)
  // Includes both content/*.md (legacy) and content/pages/*.md (new post-type-page)
  // Created via Indiekit's page post type
  eleventyConfig.addCollection("pages", function (collectionApi) {
    const rootPages = collectionApi.getFilteredByGlob("content/*.md");
    const pagesDir = collectionApi.getFilteredByGlob("content/pages/*.md");
    return [...rootPages, ...pagesDir]
      .filter(page => !page.inputPath.includes('content.json') && !page.inputPath.includes('pages.json'))
      .sort((a, b) => (a.data.title || a.data.name || "").localeCompare(b.data.title || b.data.name || ""));
  });

  // All content combined for homepage feed
  eleventyConfig.addCollection("feed", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/**/*.md")
      .sort((a, b) => b.date - a.date)
      .slice(0, 20);
  });

  // Categories collection - deduplicated by slug to avoid duplicate permalinks
  eleventyConfig.addCollection("categories", function (collectionApi) {
    const categoryMap = new Map(); // slug -> original name (first seen)
    const slugify = (str) => str.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

    collectionApi.getAll().forEach((item) => {
      if (item.data.category) {
        const cats = Array.isArray(item.data.category) ? item.data.category : [item.data.category];
        cats.forEach((cat) => {
          if (cat && typeof cat === 'string' && cat.trim()) {
            const slug = slugify(cat.trim());
            if (slug && !categoryMap.has(slug)) {
              categoryMap.set(slug, cat.trim());
            }
          }
        });
      }
    });
    return [...categoryMap.values()].sort();
  });

  // Recent posts for sidebar
  eleventyConfig.addCollection("recentPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/**/*.md")
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  });

  // Generate OpenGraph images for posts without photos
  eleventyConfig.on("eleventy.before", async () => {
    const contentDir = resolve(__dirname, "content");
    const cacheDir = resolve(__dirname, ".cache");
    const siteName = process.env.SITE_NAME || "My IndieWeb Blog";
    try {
      await generateOgImages(contentDir, cacheDir, siteName);
    } catch (err) {
      console.error("[og] Image generation failed:", err.message);
    }
  });

  // Pagefind indexing + WebSub hub notification after each build
  eleventyConfig.on("eleventy.after", async ({ dir, runMode }) => {
    // Pagefind indexing
    try {
      console.log(`[pagefind] Indexing ${dir.output} (${runMode})...`);
      execFileSync("npx", ["pagefind", "--site", dir.output, "--glob", "**/*.html"], {
        stdio: "inherit",
        timeout: 60000,
      });
      console.log("[pagefind] Indexing complete");
    } catch (err) {
      console.error("[pagefind] Indexing failed:", err.message);
    }

    // WebSub hub notification — notify subscribers of feed updates
    const hubUrl = "https://websubhub.com/hub";
    const feedUrls = [
      `${siteUrl}/`,
      `${siteUrl}/feed.xml`,
      `${siteUrl}/feed.json`,
    ];
    for (const feedUrl of feedUrls) {
      try {
        const res = await fetch(hubUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `hub.mode=publish&hub.url=${encodeURIComponent(feedUrl)}`,
        });
        console.log(`[websub] Notified hub for ${feedUrl}: ${res.status}`);
      } catch (err) {
        console.error(`[websub] Hub notification failed for ${feedUrl}:`, err.message);
      }
    }
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: false,  // Disable to avoid Nunjucks interpreting {{ in content
    htmlTemplateEngine: "njk",
  };
}
