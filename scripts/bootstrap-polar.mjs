#!/usr/bin/env node
/**
 * Bootstrap Polar product + print Vercel env commands.
 * Usage:
 *   POLAR_ACCESS_TOKEN=polar_oat_... node scripts/bootstrap-polar.mjs
 * Optional: POLAR_SERVER=sandbox
 */
import { Polar } from "@polar-sh/sdk";

const token = process.env.POLAR_ACCESS_TOKEN;
if (!token) {
  console.error("Set POLAR_ACCESS_TOKEN first");
  process.exit(1);
}

const server = process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";
const polar = new Polar({ accessToken: token, server });

const product = await polar.products.create({
  name: "SignalDeck Pro",
  description:
    "Weekly ranked sales queue + reply drafts for solo B2B builders.",
  recurringInterval: "month",
  prices: [
    {
      amountType: "fixed",
      priceAmount: 2900,
      priceCurrency: "usd",
    },
  ],
});

console.log("Created product:", product.id);
console.log("\nAdd to Vercel Production:");
console.log(`POLAR_ACCESS_TOKEN=${token}`);
console.log(`POLAR_PRODUCT_ID=${product.id}`);
console.log(`NEXT_PUBLIC_POLAR_PRODUCT_ID=${product.id}`);
console.log(`NEXT_PUBLIC_APP_URL=https://kc-kappa.vercel.app`);
console.log(`POLAR_SERVER=${server}`);
console.log("\nThen: npx vercel deploy --prod --yes");
