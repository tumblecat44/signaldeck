export const metadata = {
  title: "SignalDeck FAQ",
  description: "Pricing, Polar checkout, free tier, and how the weekly queue works.",
};

export default function FaqPage() {
  const items = [
    {
      q: "What do I get for free?",
      a: "Top 3 ranked HN signals for your keywords, plus one reply-draft teaser so you can feel the Pro output.",
    },
    {
      q: "What is Pro?",
      a: "$29/month via Polar: full top 10 queue and reply drafts for every item.",
    },
    {
      q: "Where do signals come from?",
      a: "Public Hacker News search (Algolia). No login required to generate a free queue.",
    },
    {
      q: "How does unlock work?",
      a: "Pay with the same email you enter in the app. Polar webhook + activate confirm Pro entitlement.",
    },
    {
      q: "Is this another keyword alert bot?",
      a: "No. Alerts maximize volume. SignalDeck maximizes reply-ready shortlists.",
    },
  ];
  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">FAQ</h1>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.q} className="card p-5">
            <h2 className="mb-2 font-semibold">{it.q}</h2>
            <p className="text-sm muted">{it.a}</p>
          </div>
        ))}
      </div>
      <a href="/app" className="btn btn-primary mt-8 no-underline">
        Open app
      </a>
    </main>
  );
}
