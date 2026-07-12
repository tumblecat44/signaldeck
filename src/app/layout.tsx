import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalDeck — weekly reply-worthy sales queue",
  description:
    "For solo B2B builders: a short weekly queue of public buy/pain threads with first-reply drafts. Not another keyword alert firehose.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mx-auto min-h-screen max-w-5xl px-4 py-6">
          <header className="mb-10 flex items-center justify-between gap-4">
            <a href="/" className="text-lg font-bold tracking-tight text-[var(--text)] no-underline">
              SignalDeck
            </a>
            <nav className="flex items-center gap-3 text-sm">
              <a href="/#pricing" className="muted no-underline hover:text-[var(--accent)]">
                Pricing
              </a>
              <a href="/faq" className="muted no-underline hover:text-[var(--accent)]">
                FAQ
              </a>
              <a href="/app" className="btn btn-ghost !py-2 !text-sm no-underline">
                Open app
              </a>
            </nav>
          </header>
          {children}
          <footer className="mt-16 border-t border-[var(--border)] pt-6 text-sm muted">
            SignalDeck · Polar-powered · Built for solo outbound, not alert spam.
          </footer>
        </div>
      </body>
    </html>
  );
}
