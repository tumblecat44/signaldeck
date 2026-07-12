export const metadata = {
  title: "SignalDeck for indie hackers — weekly outbound queue",
  description:
    "Solo founders: stop drowning in keyword alerts. Get a ranked weekly queue of reply-worthy HN threads.",
};

export default function ForIndieHackersPage() {
  return (
    <main className="max-w-2xl">
      <p className="badge mb-3">For solo builders</p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">
        Outbound without living in search tabs
      </h1>
      <p className="mb-6 text-lg muted">
        You already build in public. SignalDeck turns public HN conversations
        into a short list scored for buy/pain intent — with reply drafts when
        you go Pro.
      </p>
      <ol className="mb-8 list-decimal space-y-3 pl-5 text-sm">
        <li>Drop 3–5 keywords (your niche + “looking for” phrases).</li>
        <li>Generate a ranked queue from Hacker News.</li>
        <li>Free: top 3. Pro: full 10 + drafts. Checkout via Polar.</li>
      </ol>
      <div className="flex flex-wrap gap-3">
        <a href="/app" className="btn btn-primary no-underline">
          Open the app
        </a>
        <a href="/vs/f5bot" className="btn btn-ghost no-underline">
          vs alert bots
        </a>
      </div>
    </main>
  );
}
