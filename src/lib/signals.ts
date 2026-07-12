/**
 * Pure domain logic for SignalDeck: score buying intent and draft replies.
 * No I/O — unit-tested in isolation.
 */

export type SignalSource = "hn" | "manual";

export type RawSignal = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: SignalSource;
  author?: string;
  points?: number;
  createdAt?: string;
};

export type ScoredSignal = RawSignal & {
  score: number;
  intent: "buy" | "pain" | "compare" | "hire" | "noise";
  reasons: string[];
};

export type ReplyDraft = {
  subject: string;
  body: string;
  whyNow: string;
};

const BUY_PATTERNS: RegExp[] = [
  /\b(looking for|need a|searching for|recommend( a| me)?|any tools? for|what do you use)\b/i,
  /\b(switch(ing)? from|alternative to|vs\.?|compared to)\b/i,
  /\b(budget|pay for|pricing|worth paying|subscribe)\b/i,
  /\b(automate|save time|too manual|spreadsheet hell)\b/i,
];

const PAIN_PATTERNS: RegExp[] = [
  /\b(frustrated|hate|broken|doesn't work|pain|annoying|waste of time)\b/i,
  /\b(churn|no leads|can't find customers|zero traffic)\b/i,
];

const COMPARE_PATTERNS: RegExp[] = [
  /\b(vs\.?|versus|better than|instead of|alternative)\b/i,
];

const HIRE_PATTERNS: RegExp[] = [
  /\b(hiring|looking to hire|need a freelancer|contract)\b/i,
];

export function classifyIntent(text: string): {
  intent: ScoredSignal["intent"];
  reasons: string[];
  score: number;
} {
  const blob = text;
  const reasons: string[] = [];
  let score = 0;

  for (const re of BUY_PATTERNS) {
    if (re.test(blob)) {
      score += 28;
      reasons.push(`buy-signal: ${re.source.slice(0, 40)}`);
    }
  }
  for (const re of PAIN_PATTERNS) {
    if (re.test(blob)) {
      score += 18;
      reasons.push(`pain: ${re.source.slice(0, 40)}`);
    }
  }
  for (const re of COMPARE_PATTERNS) {
    if (re.test(blob)) {
      score += 22;
      reasons.push(`compare: ${re.source.slice(0, 40)}`);
    }
  }
  for (const re of HIRE_PATTERNS) {
    if (re.test(blob)) {
      score += 12;
      reasons.push(`hire: ${re.source.slice(0, 40)}`);
    }
  }

  let intent: ScoredSignal["intent"] = "noise";
  if (score >= 28 && BUY_PATTERNS.some((r) => r.test(blob))) intent = "buy";
  else if (COMPARE_PATTERNS.some((r) => r.test(blob)) && score >= 20)
    intent = "compare";
  else if (PAIN_PATTERNS.some((r) => r.test(blob)) && score >= 18)
    intent = "pain";
  else if (HIRE_PATTERNS.some((r) => r.test(blob))) intent = "hire";

  if (score > 100) score = 100;
  return { intent, reasons: reasons.slice(0, 4), score };
}

export function scoreSignal(raw: RawSignal, keywords: string[]): ScoredSignal {
  const hay = `${raw.title}\n${raw.snippet}`;
  const { intent, reasons, score: base } = classifyIntent(hay);
  let score = base;

  const lower = hay.toLowerCase();
  for (const kw of keywords) {
    const k = kw.trim().toLowerCase();
    if (k && lower.includes(k)) {
      score = Math.min(100, score + 15);
      reasons.push(`keyword: ${kw.trim()}`);
    }
  }

  if ((raw.points ?? 0) >= 20) {
    score = Math.min(100, score + 8);
    reasons.push("traction: high points");
  }

  return { ...raw, score, intent, reasons: reasons.slice(0, 5) };
}

export function rankQueue(
  signals: RawSignal[],
  keywords: string[],
  limit = 10,
): ScoredSignal[] {
  return signals
    .map((s) => scoreSignal(s, keywords))
    .filter((s) => s.intent !== "noise" || s.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function draftReply(
  signal: ScoredSignal,
  productName = "SignalDeck",
): ReplyDraft {
  const topic = signal.title.slice(0, 80);
  const whyNow =
    signal.reasons[0] ??
    `Public thread shows active interest (${signal.intent}).`;

  if (signal.intent === "compare" || signal.intent === "buy") {
    return {
      subject: `Re: ${topic}`,
      whyNow,
      body: [
        `Hey${signal.author ? ` ${signal.author}` : ""} — saw your note about “${topic}”.`,
        ``,
        `I built ${productName} for solo B2B builders who need a short weekly queue of reply-worthy threads (not raw keyword spam).`,
        ``,
        `If useful, happy to show a 2‑min demo or share a free week of the queue for your keywords.`,
        ``,
        `—`,
      ].join("\n"),
    };
  }

  if (signal.intent === "pain") {
    return {
      subject: `Quick idea on: ${topic}`,
      whyNow,
      body: [
        `Hey — the pain you described (“${topic}”) is exactly why I shipped a tiny weekly sales queue tool.`,
        ``,
        `It ranks public threads by buy/pain intent and drafts a first reply so you don’t live in search all week.`,
        ``,
        `Want me to run your keywords once and send the top 10?`,
        ``,
        `—`,
      ].join("\n"),
    };
  }

  return {
    subject: `Saw your post: ${topic}`,
    whyNow,
    body: [
      `Hey — stumbled on your post. If you’re still exploring options, I run a focused weekly queue for outbound-ready conversations.`,
      ``,
      `Happy to share whether anything in this week’s batch matches what you need.`,
      ``,
      `—`,
    ].join("\n"),
  };
}

/** Free tier: first N only, drafts redacted */
export function applyEntitlement(
  queue: ScoredSignal[],
  paid: boolean,
  freeLimit = 3,
): {
  queue: ScoredSignal[];
  drafts: Record<string, ReplyDraft | null>;
  locked: boolean;
} {
  if (paid) {
    const drafts: Record<string, ReplyDraft> = {};
    for (const s of queue) drafts[s.id] = draftReply(s);
    return { queue, drafts, locked: false };
  }
  const limited = queue.slice(0, freeLimit);
  const drafts: Record<string, ReplyDraft | null> = {};
  // Tease: first free item gets a draft so value is obvious; rest locked
  limited.forEach((s, i) => {
    drafts[s.id] = i === 0 ? draftReply(s) : null;
  });
  return { queue: limited, drafts, locked: queue.length > freeLimit };
}
