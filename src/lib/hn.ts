import type { RawSignal } from "./signals";

type AlgoliaHit = {
  objectID: string;
  title?: string;
  story_title?: string;
  url?: string | null;
  story_url?: string | null;
  author?: string;
  points?: number;
  comment_text?: string;
  story_text?: string;
  created_at?: string;
};

/**
 * Fetch public HN/Algolia search hits. No API key required.
 */
export async function searchHackerNews(
  keywords: string[],
  opts?: { hitsPerPage?: number },
): Promise<RawSignal[]> {
  const hitsPerPage = opts?.hitsPerPage ?? 25;
  const query =
    keywords.map((k) => k.trim()).filter(Boolean).join(" ") ||
    "looking for tool SaaS";

  const url = new URL("https://hn.algolia.com/api/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("tags", "(story,comment)");
  url.searchParams.set("hitsPerPage", String(hitsPerPage));

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HN search failed: ${res.status}`);
  }
  const data = (await res.json()) as { hits?: AlgoliaHit[] };
  const hits = data.hits ?? [];

  return hits.map((h): RawSignal => {
    const title = h.title || h.story_title || "(no title)";
    const snippet = (h.comment_text || h.story_text || title)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 400);
    const link =
      h.url ||
      h.story_url ||
      `https://news.ycombinator.com/item?id=${h.objectID}`;
    return {
      id: `hn-${h.objectID}`,
      title,
      url: link,
      snippet,
      source: "hn",
      author: h.author,
      points: h.points,
      createdAt: h.created_at,
    };
  });
}
