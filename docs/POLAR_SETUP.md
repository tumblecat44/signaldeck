# Polar setup (blocks paid users until done)

Live app: https://kc-kappa.vercel.app  
Checkout currently returns **503** until env vars exist.

## 10-minute checklist

1. Sign in at https://polar.sh → create organization **SignalDeck**
2. **Products** → New product  
   - Name: SignalDeck Pro  
   - Price: **$29/month** (or founding **$19** one-time while testing)
3. Copy **Product ID** (UUID)
4. **Settings → Developers → Access tokens** → create **Organization Access Token** with products/checkouts/orders/subscriptions/webhooks scopes
5. **Settings → Webhooks** → endpoint  
   `https://kc-kappa.vercel.app/api/webhook/polar`  
   events: `order.paid`, `subscription.active`, `subscription.created`  
   Copy signing secret
6. On machine:

```bash
cd /Users/dgsw67/orca/projects/kc
npx vercel env add POLAR_ACCESS_TOKEN production
npx vercel env add POLAR_PRODUCT_ID production
npx vercel env add NEXT_PUBLIC_POLAR_PRODUCT_ID production
npx vercel env add POLAR_WEBHOOK_SECRET production
npx vercel env add NEXT_PUBLIC_APP_URL production
# value: https://kc-kappa.vercel.app
npx vercel deploy --prod --yes
```

7. Smoke test: open `/app` → email → Upgrade → complete Polar checkout → `/success` → regenerate queue → Pro unlocked

## Proof files for goal

After each paid customer, export Polar order row or screenshot into:

`{SCRATCH}/paying-users/01.json` … `03.json`

Suggested JSON:

```json
{
  "email": "buyer@example.com",
  "orderId": "…",
  "amountCents": 2900,
  "currency": "usd",
  "paidAt": "2026-…",
  "source": "polar"
}
```
