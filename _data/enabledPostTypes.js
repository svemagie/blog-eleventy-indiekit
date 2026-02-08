import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CONTENT_DIR = process.env.CONTENT_DIR || "/data/content";

// Standard post types for any Indiekit deployment
const ALL_POST_TYPES = [
  { type: "article", label: "Articles", path: "/articles/", createUrl: "/posts/create?type=article" },
  { type: "note", label: "Notes", path: "/notes/", createUrl: "/posts/create?type=note" },
  { type: "photo", label: "Photos", path: "/photos/", createUrl: "/posts/create?type=photo" },
  { type: "bookmark", label: "Bookmarks", path: "/bookmarks/", createUrl: "/posts/create?type=bookmark" },
  { type: "like", label: "Likes", path: "/likes/", createUrl: "/posts/create?type=like" },
  { type: "reply", label: "Replies", path: "/replies/", createUrl: "/posts/create?type=reply" },
  { type: "repost", label: "Reposts", path: "/reposts/", createUrl: "/posts/create?type=repost" },
];

/**
 * Returns the list of enabled post types.
 *
 * Resolution order:
 * 1. .indiekit/post-types.json in content dir (written by Indiekit or deployer)
 * 2. POST_TYPES env var (comma-separated: "article,note,photo")
 * 3. All standard post types (default)
 */
export default function () {
  // 1. Try config file
  try {
    const configPath = resolve(CONTENT_DIR, ".indiekit", "post-types.json");
    const raw = readFileSync(configPath, "utf8");
    const types = JSON.parse(raw);
    if (Array.isArray(types)) {
      // Array of type strings: ["article", "note"]
      return ALL_POST_TYPES.filter((pt) => types.includes(pt.type));
    }
    // Array of objects with at least { type }
    return types;
  } catch {
    // File doesn't exist — fall through
  }

  // 2. Try env var
  const envTypes = process.env.POST_TYPES;
  if (envTypes) {
    const types = envTypes.split(",").map((t) => t.trim().toLowerCase());
    return ALL_POST_TYPES.filter((pt) => types.includes(pt.type));
  }

  // 3. Default — all standard types
  return ALL_POST_TYPES;
}
