import { Webhooks } from "@polar-sh/nextjs";
import { recordPaidCustomer } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

async function handlePaid(payload: {
  type?: string;
  data?: Record<string, unknown>;
}) {
  const type = String(payload?.type ?? "");
  const data = (payload?.data ?? {}) as Record<string, unknown>;
  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const email = String(
    customer.email ?? data.email ?? "",
  ).toLowerCase();
  if (!email) return;

  const amountRaw =
    data.totalAmount ?? data.amount ?? data.netAmount ?? 0;
  const amountCents = Number(amountRaw) || 0;
  const currency = String(data.currency ?? "usd");
  const customerId = customer.id ? String(customer.id) : undefined;
  const orderId = data.id ? String(data.id) : undefined;

  // Accept paid orders and active subscriptions
  const interesting =
    type.includes("order.paid") ||
    type.includes("subscription.active") ||
    type.includes("subscription.created") ||
    type.includes("benefit_grant.created");

  if (!interesting && amountCents <= 0) return;

  await recordPaidCustomer({
    email,
    customerId,
    orderId,
    amountCents: amountCents > 0 ? amountCents : undefined,
    currency,
    paidAt: new Date().toISOString(),
    source: "polar_webhook",
  });
}

const secret = process.env.POLAR_WEBHOOK_SECRET;

export const POST = secret
  ? Webhooks({
      webhookSecret: secret,
      onOrderPaid: async (payload) => {
        await handlePaid(payload as { type?: string; data?: Record<string, unknown> });
      },
      onSubscriptionActive: async (payload) => {
        await handlePaid(payload as { type?: string; data?: Record<string, unknown> });
      },
      onPayload: async (payload) => {
        // Fallback catch-all for grant events
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = payload as any;
        if (
          String(p?.type ?? "").includes("benefit_grant") ||
          String(p?.type ?? "").includes("order.paid")
        ) {
          await handlePaid(p);
        }
      },
    })
  : async () =>
      Response.json(
        { error: "POLAR_WEBHOOK_SECRET not configured" },
        { status: 503 },
      );
