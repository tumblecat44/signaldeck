import { promises as fs } from "fs";
import path from "path";
import { getPolarClient } from "./polar";

export type PaidCustomer = {
  email: string;
  customerId?: string;
  orderId?: string;
  amountCents?: number;
  currency?: string;
  paidAt: string;
  source: "polar_webhook" | "polar_api" | "manual";
};

const DATA_DIR = path.join(process.cwd(), "data");
const PAID_FILE = path.join(DATA_DIR, "paid-customers.json");

async function readLocal(): Promise<PaidCustomer[]> {
  try {
    const raw = await fs.readFile(PAID_FILE, "utf8");
    const parsed = JSON.parse(raw) as PaidCustomer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal(rows: PaidCustomer[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PAID_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function recordPaidCustomer(
  row: PaidCustomer,
): Promise<PaidCustomer[]> {
  const rows = await readLocal();
  const email = row.email.trim().toLowerCase();
  const without = rows.filter((r) => r.email.toLowerCase() !== email);
  without.push({ ...row, email });
  without.sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  try {
    await writeLocal(without);
  } catch {
    // Vercel serverless FS may be read-only after write attempt fails — still return in-memory merge
  }
  return without;
}

export async function listPaidCustomers(): Promise<PaidCustomer[]> {
  return readLocal();
}

export async function isEmailPaid(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const manual = (process.env.PAID_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (manual.includes(normalized)) return true;

  const local = await readLocal();
  if (local.some((r) => r.email.toLowerCase() === normalized)) return true;

  const polar = getPolarClient();
  if (!polar) return false;

  try {
    // Prefer list customers filtered by email when available
    const list = await polar.customers.list({
      email: normalized,
      limit: 10,
    });
    const items =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (list as any)?.result?.items ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (list as any)?.items ??
      [];
    for (const c of items) {
      const e = String(c.email ?? "").toLowerCase();
      if (e !== normalized) continue;
      // active subscription or any paid marker
      if (c.id) {
        try {
          const state = await polar.customers.getState({ id: c.id });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const active = (state as any)?.activeSubscriptions ?? [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const grants = (state as any)?.grantedBenefits ?? [];
          if (
            (Array.isArray(active) && active.length > 0) ||
            (Array.isArray(grants) && grants.length > 0)
          ) {
            await recordPaidCustomer({
              email: normalized,
              customerId: c.id,
              paidAt: new Date().toISOString(),
              source: "polar_api",
            });
            return true;
          }
        } catch {
          // fall through
        }
      }
    }
  } catch {
    return false;
  }
  return false;
}

export function countDistinctPaid(rows: PaidCustomer[]): number {
  return new Set(rows.map((r) => r.email.toLowerCase())).size;
}
