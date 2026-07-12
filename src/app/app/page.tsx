"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ScoredSignal = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
  intent: string;
  reasons: string[];
  author?: string;
};

type ReplyDraft = {
  subject: string;
  body: string;
  whyNow: string;
};

type QueueResponse = {
  paid: boolean;
  locked: boolean;
  queue: ScoredSignal[];
  drafts: Record<string, ReplyDraft | null>;
  error?: string;
  generatedAt?: string;
};

const STORAGE_EMAIL = "signaldeck_email";
const STORAGE_KEYWORDS = "signaldeck_keywords";

export default function AppPage() {
  const [email, setEmail] = useState("");
  const [keywordsText, setKeywordsText] = useState(
    "SaaS, looking for tool, alternative to",
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QueueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const e = localStorage.getItem(STORAGE_EMAIL);
      const k = localStorage.getItem(STORAGE_KEYWORDS);
      if (e) setEmail(e);
      if (k) setKeywordsText(k);
    } catch {
      /* ignore */
    }
  }, []);

  const keywords = useMemo(
    () =>
      keywordsText
        .split(/[,|\n]/)
        .map((k) => k.trim())
        .filter(Boolean),
    [keywordsText],
  );

  const runQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem(STORAGE_EMAIL, email.trim().toLowerCase());
      localStorage.setItem(STORAGE_KEYWORDS, keywordsText);
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          email: email.trim().toLowerCase(),
        }),
      });
      const json = (await res.json()) as QueueResponse;
      if (!res.ok) throw new Error(json.error || "Queue failed");
      setData(json);
      if (json.queue[0]) setOpenId(json.queue[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [email, keywords, keywordsText]);

  const productQs = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID
    ? `products=${encodeURIComponent(process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID)}&`
    : "";
  const checkoutHref = `/api/checkout?${productQs}customerEmail=${encodeURIComponent(
    email.trim().toLowerCase(),
  )}`;

  return (
    <main className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="card h-fit space-y-4 p-5">
        <div>
          <h1 className="text-xl font-bold">Your queue</h1>
          <p className="text-sm muted">
            Keywords → ranked HN signals → (Pro) reply drafts
          </p>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block muted">Email (for Pro entitlement)</span>
          <input
            className="input"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block muted">Keywords (comma-separated)</span>
          <textarea
            className="input min-h-[100px]"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={loading || keywords.length === 0}
          onClick={() => void runQueue()}
        >
          {loading ? "Scoring…" : "Generate queue"}
        </button>
        <a
          href={checkoutHref}
          className="btn btn-ghost w-full no-underline"
          onClick={async (e) => {
            if (!email.trim()) {
              e.preventDefault();
              setError("Enter your email before checkout so we can unlock Pro.");
              return;
            }
            // Probe checkout config so we surface setup errors early
            e.preventDefault();
            try {
              const res = await fetch(checkoutHref, { redirect: "manual" });
              if (res.status >= 300 && res.status < 400) {
                const loc = res.headers.get("Location");
                if (loc) {
                  window.location.href = loc;
                  return;
                }
              }
              if (res.ok) {
                window.location.href = checkoutHref;
                return;
              }
              const j = (await res.json().catch(() => null)) as {
                error?: string;
              } | null;
              setError(
                j?.error ||
                  "Checkout not ready (Polar env missing on server). See docs/POLAR_SETUP.md",
              );
            } catch {
              window.location.href = checkoutHref;
            }
          }}
        >
          Upgrade Pro · $29/mo (Polar)
        </a>
        {data && (
          <p className="text-xs muted">
            Status:{" "}
            <strong className="text-[var(--text)]">
              {data.paid ? "Pro unlocked" : "Free (top 3)"}
            </strong>
            {data.generatedAt ? ` · ${new Date(data.generatedAt).toLocaleString()}` : ""}
          </p>
        )}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </aside>

      <section className="space-y-3">
        {!data && (
          <div className="card p-8 text-center muted">
            Set keywords and generate your first weekly-style queue.
          </div>
        )}
        {data?.locked && (
          <div className="card border-[var(--accent)] bg-[var(--accent-dim)] p-4 text-sm">
            More signals ranked —{" "}
            <a href={checkoutHref} className="font-semibold">
              unlock full top 10 + drafts with Pro
            </a>
            .
          </div>
        )}
        {data?.queue.map((s) => {
          const draft = data.drafts[s.id];
          const open = openId === s.id;
          return (
            <article key={s.id} className="card p-4">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => setOpenId(open ? null : s.id)}
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="badge">{s.intent}</span>
                    <span className="font-mono text-sm text-[var(--accent)]">
                      {s.score}
                    </span>
                  </div>
                  <h2 className="font-semibold leading-snug">{s.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm muted">{s.snippet}</p>
                </div>
              </button>
              {open && (
                <div className="mt-4 border-t border-[var(--border)] pt-4 text-sm">
                  <p className="mb-2 muted">
                    Why now: {s.reasons.join(" · ") || "scored intent"}
                  </p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-3 inline-block"
                  >
                    Open thread ↗
                  </a>
                  {draft ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[#0a1018] p-3">
                      <p className="mb-1 text-xs font-semibold uppercase muted">
                        Reply draft
                      </p>
                      <p className="mb-2 font-medium">{draft.subject}</p>
                      <pre className="whitespace-pre-wrap font-sans text-[var(--text)]">
                        {draft.body}
                      </pre>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-[var(--border)] p-3 muted">
                      Reply drafts are a Pro feature. Upgrade to unlock.
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
