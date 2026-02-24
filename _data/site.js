/**
 * Site configuration for Eleventy
 *
 * Configure via environment variables in Cloudron app settings.
 * All values have sensible defaults for initial deployment.
 */

// Parse social links from env (format: "name|url|icon,name|url|icon")
function parseSocialLinks(envVar) {
  if (!envVar) return [];
  return envVar.split(",").map((link) => {
    const [name, url, icon] = link.split("|").map((s) => s.trim());
    // Bluesky requires "me atproto" for verification
    const rel = url.includes("bsky.app") ? "me atproto" : "me";
    return { name, url, rel, icon: icon || name.toLowerCase() };
  });
}

// Get fediverse handle for fediverse:creator meta tag
// Prefers the site's own ActivityPub identity over external Mastodon account
function getFediverseCreator() {
  // Primary: site's own ActivityPub actor (canonical fediverse identity)
  const apHandle = process.env.ACTIVITYPUB_HANDLE;
  if (apHandle) {
    const domain = (process.env.SITE_URL || "https://example.com").replace(/^https?:\/\//, "");
    return `@${apHandle}@${domain}`;
  }
  // Fallback: external Mastodon account (syndication target)
  const instance = process.env.MASTODON_INSTANCE?.replace("https://", "") || "";
  const user = process.env.MASTODON_USER || "";
  if (instance && user) {
    return `@${user}@${instance}`;
  }
  return "";
}

// Auto-generate social links from feed config when SITE_SOCIAL is not set
function buildSocialFromFeeds() {
  const links = [];
  const github = process.env.GITHUB_USERNAME;
  if (github) {
    links.push({ name: "GitHub", url: `https://github.com/${github}`, rel: "me", icon: "github" });
  }
  const bskyHandle = process.env.BLUESKY_HANDLE;
  if (bskyHandle) {
    links.push({ name: "Bluesky", url: `https://bsky.app/profile/${bskyHandle}`, rel: "me atproto", icon: "bluesky" });
  }
  const mastoInstance = process.env.MASTODON_INSTANCE?.replace("https://", "");
  const mastoUser = process.env.MASTODON_USER;
  if (mastoInstance && mastoUser) {
    links.push({ name: "Mastodon", url: `https://${mastoInstance}/@${mastoUser}`, rel: "me", icon: "mastodon" });
  }
  const linkedin = process.env.LINKEDIN_USERNAME;
  if (linkedin) {
    links.push({ name: "LinkedIn", url: `https://linkedin.com/in/${linkedin}`, rel: "me", icon: "linkedin" });
  }
  const apHandle = process.env.ACTIVITYPUB_HANDLE;
  if (apHandle) {
    const siteUrl = process.env.SITE_URL || "https://example.com";
    links.push({ name: "ActivityPub", url: `${siteUrl}/activitypub/users/${apHandle}`, rel: "me", icon: "activitypub" });
  }
  return links;
}

// Ensure URL has trailing slash (Mastodon rel="me" verification uses strict string match)
const siteUrl = (process.env.SITE_URL || "https://example.com").replace(/\/$/, "") + "/";

export default {
  // Basic site info
  name: process.env.SITE_NAME || "My IndieWeb Blog",
  url: siteUrl,
  me: siteUrl,
  locale: process.env.SITE_LOCALE || "en",
  description:
    process.env.SITE_DESCRIPTION ||
    "An IndieWeb-powered blog with Micropub support",

  // Author info (shown in h-card, about page, etc.)
  author: {
    name: process.env.AUTHOR_NAME || "Blog Author",
    url: siteUrl,
    avatar: process.env.AUTHOR_AVATAR || "/images/default-avatar.svg",
    title: process.env.AUTHOR_TITLE || "",
    bio: process.env.AUTHOR_BIO || "Welcome to my IndieWeb blog.",
    location: process.env.AUTHOR_LOCATION || "",
    locality: process.env.AUTHOR_LOCALITY || "",
    region: process.env.AUTHOR_REGION || "",
    country: process.env.AUTHOR_COUNTRY || "",
    org: process.env.AUTHOR_ORG || "",
    pronoun: process.env.AUTHOR_PRONOUN || "",
    categories: process.env.AUTHOR_CATEGORIES?.split(",").map(s => s.trim()) || [],
    keyUrl: process.env.AUTHOR_KEY_URL || "",
    email: process.env.AUTHOR_EMAIL || "",
  },

  // Social links (for rel="me" and h-card)
  // Set SITE_SOCIAL env var as: "GitHub|https://github.com/user|github,Mastodon|https://mastodon.social/@user|mastodon"
  // Falls back to auto-generating from feed config (GITHUB_USERNAME, BLUESKY_HANDLE, etc.)
  social: parseSocialLinks(process.env.SITE_SOCIAL).length > 0
    ? parseSocialLinks(process.env.SITE_SOCIAL)
    : buildSocialFromFeeds(),

  // Feed integrations (usernames for data fetching)
  feeds: {
    github: process.env.GITHUB_USERNAME || "",
    bluesky: process.env.BLUESKY_HANDLE || "",
    mastodon: {
      instance: process.env.MASTODON_INSTANCE?.replace("https://", "") || "",
      username: process.env.MASTODON_USER || "",
    },
  },

  // Webmentions configuration
  webmentions: {
    domain: process.env.SITE_URL?.replace("https://", "").replace("http://", "") || "example.com",
  },

  // Fediverse creator for meta tag (e.g., @rick@rmendes.net)
  fediverseCreator: getFediverseCreator(),

  // Support/monetization configuration (used in _textcasting JSON Feed extension)
  support: {
    url: process.env.SUPPORT_URL || null,
    stripe: process.env.SUPPORT_STRIPE_URL || null,
    lightning: process.env.SUPPORT_LIGHTNING_ADDRESS || null,
    paymentPointer: process.env.SUPPORT_PAYMENT_POINTER || null,
  },
};
