import { NextRequest, NextResponse } from "next/server";
import { getPolarClient } from "@/lib/polar";
import { recordPaidCustomer, isEmailPaid } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

/**
 * After Polar checkout redirect: verify checkout and unlock email.
 * Source of truth = Polar API when token present.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      checkoutId?: string;
      email?: string;
    };
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const checkoutId = String(body.checkoutId ?? "").trim();

    if (!email && !checkoutId) {
      return NextResponse.json(
        { error: "email or checkoutId required" },
        { status: 400 },
      );
    }

    const polar = getPolarClient();
    if (!polar) {
      // Without Polar token, only env/local list works
      if (email && (await isEmailPaid(email))) {
        return NextResponse.json({ paid: true, email, source: "local" });
      }
      return NextResponse.json(
        {
          paid: false,
          error: "Polar not configured on server",
        },
        { status: 503 },
      );
    }

    if (checkoutId) {
      try {
        const checkout = await polar.checkouts.get({ id: checkoutId });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = checkout as any;
        const status = String(c.status ?? "");
        const paidLike =
          status === "succeeded" ||
          status === "confirmed" ||
          Boolean(c.paid) ||
          c.status === "complete";
        const cEmail = String(c.customerEmail ?? c.customer?.email ?? email).toLowerCase();
        const amount = Number(c.totalAmount ?? c.amount ?? 0);
        if (paidLike && cEmail) {
          await recordPaidCustomer({
            email: cEmail,
            customerId: c.customerId ? String(c.customerId) : undefined,
            orderId: checkoutId,
            amountCents: amount > 0 ? amount : undefined,
            currency: String(c.currency ?? "usd"),
            paidAt: new Date().toISOString(),
            source: "polar_api",
          });
          return NextResponse.json({
            paid: true,
            email: cEmail,
            status,
            amountCents: amount,
          });
        }
        return NextResponse.json({
          paid: false,
          status,
          email: cEmail || email,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "checkout lookup failed";
        return NextResponse.json({ paid: false, error: message }, { status: 400 });
      }
    }

    const paid = await isEmailPaid(email);
    return NextResponse.json({ paid, email });
  } catch (e) {
    const message = e instanceof Error ? e.message : "activate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
