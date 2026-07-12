"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const sp = useSearchParams();
  const checkoutId =
    sp.get("checkout_id") || sp.get("checkoutId") || sp.get("CHECKOUT_ID");
  const [status, setStatus] = useState<string>("Confirming payment…");
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const e = localStorage.getItem("signaldeck_email") || "";
      setEmail(e);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    async function run() {
      if (!checkoutId && !email) {
        setStatus("Payment received. Enter the same email in the app to unlock Pro.");
        return;
      }
      try {
        const res = await fetch("/api/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutId, email }),
        });
        const json = (await res.json()) as {
          paid?: boolean;
          email?: string;
          error?: string;
        };
        if (json.paid) {
          if (json.email) {
            try {
              localStorage.setItem("signaldeck_email", json.email);
            } catch {
              /* ignore */
            }
          }
          setStatus("Pro unlocked. Generate your full queue.");
        } else {
          setStatus(
            json.error ||
              "Checkout not marked paid yet — open the app with your checkout email in a minute.",
          );
        }
      } catch {
        setStatus("Could not confirm automatically — open the app with your paid email.");
      }
    }
    void run();
  }, [checkoutId, email]);

  return (
    <main className="card mx-auto max-w-lg p-8 text-center">
      <p className="badge mb-3">Payment</p>
      <h1 className="mb-3 text-2xl font-bold">Thanks for supporting SignalDeck</h1>
      <p className="mb-6 muted">{status}</p>
      {checkoutId ? (
        <p className="mb-4 font-mono text-xs muted">checkout: {checkoutId}</p>
      ) : null}
      <a href="/app" className="btn btn-primary no-underline">
        Go to app
      </a>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="card p-8">Loading…</main>}>
      <SuccessInner />
    </Suspense>
  );
}
