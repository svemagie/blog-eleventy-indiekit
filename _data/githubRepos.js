/**
 * GitHub Repos Data
 * Fetches public repositories from GitHub API
 */

import EleventyFetch from "@11ty/eleventy-fetch";

export default async function () {
  const username = process.env.GITHUB_USERNAME || "";

  try {
    // Fetch public repos, sorted by updated date
    const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&type=owner`;

    const repos = await EleventyFetch(url, {
      duration: "1h", // Cache for 1 hour
      type: "json",
      fetchOptions: {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Eleventy-Site",
        },
      },
    });

    // Filter and transform repos
    return repos
      .filter((repo) => !repo.fork && !repo.private) // Exclude forks and private repos
      .map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        topics: repo.topics || [],
        updated_at: repo.updated_at,
        created_at: repo.created_at,
      }))
      .slice(0, 10); // Limit to 10 repos
  } catch (error) {
    console.error("Error fetching GitHub repos:", error.message);
    return [];
  }
}
