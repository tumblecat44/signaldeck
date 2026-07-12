import { NextRequest, NextResponse } from "next/server";
import { isEmailPaid, listPaidCustomers } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  const paid = await isEmailPaid(email);
  return NextResponse.json({ email, paid });
}

/** Admin/debug: count paid (no PII dump in production without secret) */
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (
    process.env.ADMIN_KEY &&
    key === process.env.ADMIN_KEY
  ) {
    const rows = await listPaidCustomers();
    return NextResponse.json({
      count: new Set(rows.map((r) => r.email)).size,
      customers: rows,
    });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}
