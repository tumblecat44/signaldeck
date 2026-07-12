export default function HomePage() {
  return (
    <main>
      <section className="mb-14 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="badge mb-4">Weekly sales queue · not keyword spam</p>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Ten threads worth replying to.
            <span className="block text-[var(--accent)]">Every week.</span>
          </h1>
          <p className="mb-6 max-w-xl text-lg muted">
            SignalDeck ranks public Hacker News conversations by buy / pain /
            compare intent for your keywords, then drafts a first reply — so
            solo B2B builders stop living in search tabs.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/app" className="btn btn-primary no-underline">
              Build my queue free
            </a>
            <a href="#pricing" className="btn btn-ghost no-underline">
              See Pro · $29/mo
            </a>
          </div>
          <p className="mt-4 text-sm muted">
            Free: top 3 scored signals. Pro: full top 10 + reply drafts.
          </p>
        </div>
        <div className="card p-5 shadow-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider muted">
            Sample queue
          </p>
          {[
            {
              score: 86,
              intent: "buy",
              title: "Looking for a lightweight tool to find outbound leads",
            },
            {
              score: 74,
              intent: "pain",
              title: "Keyword alerts are noise — need a short weekly list",
            },
            {
              score: 68,
              intent: "compare",
              title: "F5Bot vs something smarter for B2B founders?",
            },
          ].map((row) => (
            <div
              key={row.title}
              className="mb-3 rounded-xl border border-[var(--border)] bg-[#0a1018] p-3 last:mb-0"
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="badge">{row.intent}</span>
                <span className="font-mono text-[var(--accent)]">{row.score}</span>
              </div>
              <p className="text-sm leading-snug">{row.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14 grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Intent, not volume",
            d: "Scores buy / pain / compare language instead of dumping every keyword hit.",
          },
          {
            t: "Reply-ready",
            d: "Pro unlocks a first-draft message so you ship outreach the same day.",
          },
          {
            t: "Self-serve Polar",
            d: "Card checkout in under a minute. Cancel anytime. Built for global indie prices.",
          },
        ].map((f) => (
          <div key={f.t} className="card p-5">
            <h3 className="mb-2 font-semibold">{f.t}</h3>
            <p className="text-sm muted">{f.d}</p>
          </div>
        ))}
      </section>

      <section id="pricing" className="card mx-auto max-w-lg p-8 text-center">
        <p className="badge mb-3">Simple pricing</p>
        <h2 className="mb-2 text-3xl font-bold">Pro · $29 / month</h2>
        <p className="mb-2 text-sm text-[var(--accent)]">
          Founding price while we onboard the first customers — same Pro access.
        </p>
        <p className="mb-6 muted">
          Full weekly queue (10), reply drafts, unlimited keyword sets in the
          app. Free tier stays free forever for top 3.
        </p>
        <ul className="mb-6 space-y-2 text-left text-sm muted">
          <li>✓ Ranked buy/pain/compare signals from HN</li>
          <li>✓ First-reply drafts for each item</li>
          <li>✓ Polar Merchant of Record checkout</li>
        </ul>
        <a href="/app?upgrade=1" className="btn btn-primary no-underline">
          Start free → upgrade in app
        </a>
      </section>

      <section className="mt-14 max-w-2xl">
        <h2 className="mb-3 text-xl font-semibold">Not another 2024 alert bot</h2>
        <p className="muted">
          Keyword monitors already exist. SignalDeck is a{" "}
          <strong className="text-[var(--text)]">weekly sales queue</strong>:
          fewer items, higher intent, and a draft so the next action is reply —
          not scroll.
        </p>
      </section>
    </main>
  );
}
