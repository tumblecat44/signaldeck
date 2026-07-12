# SignalDeck

Weekly **reply-worthy sales queue** for solo B2B builders.  
Ranks public Hacker News threads by buy / pain / compare intent and drafts first replies (Pro).

**Live:** https://kc-kappa.vercel.app

## Stack

- Next.js App Router
- Polar (Merchant of Record) for checkout + webhooks
- HN Algolia public search (no API key)
- Vitest for pure scoring/draft domain tests

## Local

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

## Polar setup (required for paid)

1. Create org + product at [polar.sh](https://polar.sh) (subscription $29/mo or one-time founding price).
2. Create **Organization Access Token** → `POLAR_ACCESS_TOKEN`
3. Copy product id → `POLAR_PRODUCT_ID` and `NEXT_PUBLIC_POLAR_PRODUCT_ID`
4. Webhook to `https://YOUR_DOMAIN/api/webhook/polar` → `POLAR_WEBHOOK_SECRET`
5. Set `NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN`
6. `vercel env add` each var for Production, redeploy

Optional: `POLAR_CHECKOUT_LINK` static checkout URL if you skip API checkout.

Optional ops: `PAID_EMAILS=a@x.com,b@y.com` emergency unlock list.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm test` | Domain unit tests (scoring, drafts, free/pro gate) |
| `npm run build` | Production build |
| `npx vercel deploy --prod` | Deploy |

## Core paths

- `/` landing
- `/app` queue generator
- `/api/queue` score + gate
- `/api/checkout` Polar redirect
- `/api/webhook/polar` entitlement
- `/api/activate` post-checkout confirm
