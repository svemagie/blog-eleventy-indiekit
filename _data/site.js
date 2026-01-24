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
    return { name, url, rel: "me", icon: icon || name.toLowerCase() };
  });
}

// Default social links if none configured
const defaultSocial = [
  {
    name: "GitHub",
    url: "https://github.com/",
    rel: "me",
    icon: "github",
  },
];

export default {
  // Basic site info
  name: process.env.SITE_NAME || "My IndieWeb Blog",
  url: process.env.SITE_URL || "https://example.com",
  me: process.env.SITE_URL || "https://example.com",
  locale: process.env.SITE_LOCALE || "en",
  description:
    process.env.SITE_DESCRIPTION ||
    "An IndieWeb-powered blog with Micropub support",

  // Author info (shown in h-card, about page, etc.)
  author: {
    name: process.env.AUTHOR_NAME || "Blog Author",
    url: process.env.SITE_URL || "https://example.com",
    avatar: process.env.AUTHOR_AVATAR || "/images/default-avatar.svg",
    title: process.env.AUTHOR_TITLE || "",
    bio: process.env.AUTHOR_BIO || "Welcome to my IndieWeb blog.",
    location: process.env.AUTHOR_LOCATION || "",
    email: process.env.AUTHOR_EMAIL || "",
  },

  // Social links (for rel="me" and footer)
  // Set SITE_SOCIAL env var as: "GitHub|https://github.com/user|github,Mastodon|https://mastodon.social/@user|mastodon"
  social: parseSocialLinks(process.env.SITE_SOCIAL) || defaultSocial,

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
};
