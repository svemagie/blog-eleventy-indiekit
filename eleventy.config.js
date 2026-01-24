import pluginWebmentions from "@chrisburnell/eleventy-cache-webmentions";
import pluginRss from "@11ty/eleventy-plugin-rss";
import embedEverything from "eleventy-plugin-embed-everything";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import sitemap from "@quasibit/eleventy-plugin-sitemap";
import markdownIt from "markdown-it";
import { minify } from "html-minifier-terser";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteUrl = process.env.SITE_URL || "https://example.com";

export default function (eleventyConfig) {
  // Ignore output directory (prevents re-processing generated files via symlink)
  eleventyConfig.ignores.add("_site");
  eleventyConfig.ignores.add("_site/**");

  // Configure markdown-it with linkify enabled (auto-convert URLs to links)
  const md = markdownIt({
    html: true,
    linkify: true,  // Auto-convert URLs to clickable links
    typographer: true,
  });
  eleventyConfig.setLibrary("md", md);

  // RSS plugin for feed filters (dateToRfc822, absoluteUrl, etc.)
  // Custom feed templates in feed.njk and feed-json.njk use these filters
  eleventyConfig.addPlugin(pluginRss);

  // JSON encode filter for JSON feed
  eleventyConfig.addFilter("jsonEncode", (value) => {
    return JSON.stringify(value);
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

  // HTML minification for production builds
  eleventyConfig.addTransform("htmlmin", async function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return await minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        html5: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
      });
    }
    return content;
  });

  // Copy static assets to output
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");

  // Watch for content changes
  eleventyConfig.addWatchTarget("./content/");
  eleventyConfig.addWatchTarget("./css/");

  // Webmentions plugin configuration
  const wmDomain = siteUrl.replace("https://", "").replace("http://", "");
  eleventyConfig.addPlugin(pluginWebmentions, {
    domain: siteUrl,
    feed: `https://webmention.io/api/mentions.jf2?domain=${wmDomain}&token=${process.env.WEBMENTION_IO_TOKEN}`,
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

  // Webmention filters
  eleventyConfig.addFilter("webmentionsForUrl", function (webmentions, url) {
    if (!webmentions || !url) return [];
    const absoluteUrl = url.startsWith("http")
      ? url
      : `${siteUrl}${url}`;
    return webmentions.filter(
      (wm) =>
        wm["wm-target"] === absoluteUrl ||
        wm["wm-target"] === absoluteUrl.replace(/\/$/, "")
    );
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

  // Replies collection - posts with in_reply_to property
  eleventyConfig.addCollection("replies", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter((item) => item.data.in_reply_to)
      .sort((a, b) => b.date - a.date);
  });

  // Reposts collection - posts with repost_of property
  eleventyConfig.addCollection("reposts", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter((item) => item.data.repost_of)
      .sort((a, b) => b.date - a.date);
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
      .getFilteredByGlob("content/posts/**/*.md")
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
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
