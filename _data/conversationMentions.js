import EleventyFetch from "@11ty/eleventy-fetch";

export default async function () {
  try {
    const data = await EleventyFetch(
      "http://127.0.0.1:8080/conversations/api/mentions?per-page=10000",
      { duration: "15m", type: "json" }
    );
    return data.children || [];
  } catch (e) {
    console.log(`[conversationMentions] API unavailable: ${e.message}`);
    return [];
  }
}
