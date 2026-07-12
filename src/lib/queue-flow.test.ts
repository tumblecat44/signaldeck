import { describe, expect, it } from "vitest";
import { searchHackerNews } from "./hn";
import { applyEntitlement, rankQueue } from "./signals";

/**
 * Integration-style test: real HN HTTP + shipped scoring/gating.
 * Skips only if network is blocked.
 */
describe("queue flow (HN + score + gate)", () => {
  it("fetches HN hits and applies free entitlement gate", async () => {
    let raw;
    try {
      raw = await searchHackerNews(["SaaS", "looking for"], { hitsPerPage: 10 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/fetch|network|ENOTFOUND|failed/i.test(msg)) {
        console.warn("skip network:", msg);
        return;
      }
      throw e;
    }
    expect(Array.isArray(raw)).toBe(true);
    expect(raw.length).toBeGreaterThan(0);
    expect(raw[0].id.startsWith("hn-")).toBe(true);
    expect(raw[0].url.length).toBeGreaterThan(5);

    const ranked = rankQueue(raw, ["SaaS", "looking for"], 10);
    const free = applyEntitlement(ranked, false, 3);
    expect(free.queue.length).toBeLessThanOrEqual(3);
    expect(Object.values(free.drafts).every((d) => d === null)).toBe(true);

    const paid = applyEntitlement(ranked, true, 3);
    if (paid.queue.length > 0) {
      const draft = paid.drafts[paid.queue[0].id];
      expect(draft && draft.body.length > 10).toBe(true);
    }
  }, 20_000);
});
