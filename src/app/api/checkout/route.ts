import { Checkout } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";

const token = process.env.POLAR_ACCESS_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const polarCheckout = token
  ? Checkout({
      accessToken: token,
      successUrl: `${appUrl}/success?checkout_id={CHECKOUT_ID}`,
      returnUrl: `${appUrl}/app`,
      server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
    })
  : null;

export async function GET(req: NextRequest) {
  const productId =
    req.nextUrl.searchParams.get("products") ||
    process.env.POLAR_PRODUCT_ID ||
    process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;

  // Static checkout link fallback (created in Polar dashboard)
  if (!token) {
    const link = process.env.POLAR_CHECKOUT_LINK;
    if (link) {
      const email = req.nextUrl.searchParams.get("customerEmail");
      const url = new URL(link);
      if (email) url.searchParams.set("customer_email", email);
      return NextResponse.redirect(url.toString());
    }
    return NextResponse.json(
      {
        error:
          "Polar is not configured. Set POLAR_ACCESS_TOKEN + product id, or POLAR_CHECKOUT_LINK.",
      },
      { status: 503 },
    );
  }

  if (!productId) {
    return NextResponse.json(
      { error: "Missing product id (products query or POLAR_PRODUCT_ID)" },
      { status: 400 },
    );
  }

  // Ensure products query param is present for Polar Checkout helper
  const url = req.nextUrl.clone();
  if (!url.searchParams.getAll("products").length) {
    url.searchParams.set("products", productId);
  }
  const forwarded = new NextRequest(url, req);
  return polarCheckout!(forwarded);
}
