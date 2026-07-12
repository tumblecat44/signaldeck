import { describe, expect, it } from "vitest";
import {
  applyEntitlement,
  classifyIntent,
  draftReply,
  rankQueue,
  scoreSignal,
  type RawSignal,
} from "./signals";

const sample = (over: Partial<RawSignal> = {}): RawSignal => ({
  id: "t1",
  title: "Looking for a tool to automate outbound",
  url: "https://example.com",
  snippet: "Need a SaaS alternative to spreadsheets",
  source: "manual",
  ...over,
});

describe("classifyIntent", () => {
  it("flags buy-intent language", () => {
    const r = classifyIntent("Looking for a tool to manage leads and pay for it");
    expect(r.intent).toBe("buy");
    expect(r.score).toBeGreaterThanOrEqual(28);
  });

  it("flags compare language", () => {
    const r = classifyIntent("F5Bot vs something smarter for founders");
    expect(["compare", "buy"]).toContain(r.intent);
    expect(r.score).toBeGreaterThan(0);
  });

  it("returns noise for empty chatter", () => {
    const r = classifyIntent("nice weather today");
    expect(r.intent).toBe("noise");
  });
});

describe("scoreSignal + rankQueue", () => {
  it("boosts keyword matches", () => {
    const s = scoreSignal(sample(), ["outbound", "SaaS"]);
    expect(s.score).toBeGreaterThan(scoreSignal(sample({ title: "hello", snippet: "world" }), ["outbound"]).score);
    expect(s.reasons.some((x) => x.startsWith("keyword"))).toBe(true);
  });

  it("returns at most limit items sorted by score", () => {
    const raw: RawSignal[] = [
      sample({ id: "a", title: "Looking for a tool for CRM", snippet: "recommend a tool" }),
      sample({ id: "b", title: "cats", snippet: "dogs" }),
      sample({
        id: "c",
        title: "alternative to HubSpot",
        snippet: "switching from spreadsheets",
      }),
    ];
    const q = rankQueue(raw, ["tool"], 2);
    expect(q.length).toBeLessThanOrEqual(2);
    if (q.length === 2) expect(q[0].score).toBeGreaterThanOrEqual(q[1].score);
  });
});

describe("draftReply + applyEntitlement", () => {
  it("produces a non-empty draft body for buy signals", () => {
    const scored = scoreSignal(sample(), ["tool"]);
    const d = draftReply(scored, "SignalDeck");
    expect(d.body.toLowerCase()).toContain("signaldeck");
    expect(d.subject.length).toBeGreaterThan(3);
  });

  it("locks drafts for free users and unlocks for paid", () => {
    const raw = Array.from({ length: 5 }, (_, i) =>
      sample({
        id: `id-${i}`,
        title: `Looking for a tool number ${i}`,
        snippet: "recommend a tool please",
      }),
    );
    const ranked = rankQueue(raw, ["tool"], 10);
    const free = applyEntitlement(ranked, false, 3);
    expect(free.queue.length).toBeLessThanOrEqual(3);
    expect(Object.values(free.drafts).every((d) => d === null)).toBe(true);
    expect(free.locked).toBe(ranked.length > 3);

    const paid = applyEntitlement(ranked, true, 3);
    expect(paid.locked).toBe(false);
    expect(Object.values(paid.drafts).every((d) => d && d.body.length > 10)).toBe(
      true,
    );
  });
});
