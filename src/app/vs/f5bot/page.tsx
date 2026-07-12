export const metadata = {
  title: "SignalDeck vs F5Bot — weekly queue, not alert firehose",
  description:
    "F5Bot emails keyword hits. SignalDeck ranks buy/pain intent and drafts replies for solo B2B builders.",
};

export default function VsF5BotPage() {
  return (
    <main className="prose prose-invert max-w-2xl">
      <p className="badge mb-3">Comparison</p>
      <h1 className="mb-4 text-3xl font-bold">SignalDeck vs keyword alert bots</h1>
      <p className="muted mb-6">
        Alert tools (F5Bot-style monitors) win when you want volume. SignalDeck
        wins when you want a short list you will actually reply to this week.
      </p>
      <div className="card mb-6 overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a1018] muted">
            <tr>
              <th className="p-3"></th>
              <th className="p-3">Keyword alerts</th>
              <th className="p-3">SignalDeck</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Output", "Many emails", "Top ~10 ranked"],
              ["Scoring", "Keyword match", "Buy / pain / compare intent"],
              ["Next action", "You write from scratch", "Pro: first-reply draft"],
              ["Price", "Varies", "$29/mo Pro · free top 3"],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-[var(--border)]">
                <td className="p-3 font-medium">{row[0]}</td>
                <td className="p-3 muted">{row[1]}</td>
                <td className="p-3">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href="/app" className="btn btn-primary no-underline">
        Try the free queue
      </a>
    </main>
  );
}
