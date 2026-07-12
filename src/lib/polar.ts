import { Polar } from "@polar-sh/sdk";

export function getPolarClient() {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) return null;
  return new Polar({
    accessToken: token,
    server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
  });
}

export function polarConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_PRODUCT_ID,
  );
}

export function getProductId(): string | undefined {
  return process.env.POLAR_PRODUCT_ID;
}
