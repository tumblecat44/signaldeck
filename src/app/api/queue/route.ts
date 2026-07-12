import { NextRequest, NextResponse } from "next/server";
import { searchHackerNews } from "@/lib/hn";
import { applyEntitlement, rankQueue } from "@/lib/signals";
import { isEmailPaid } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      keywords?: string[];
      email?: string;
    };
    const keywords = (body.keywords ?? [])
      .map((k) => String(k).trim())
      .filter(Boolean)
      .slice(0, 12);
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "Add at least one keyword" },
        { status: 400 },
      );
    }

    const paid = email ? await isEmailPaid(email) : false;
    const raw = await searchHackerNews(keywords, { hitsPerPage: 30 });
    const ranked = rankQueue(raw, keywords, 10);
    const gated = applyEntitlement(ranked, paid, 3);

    return NextResponse.json({
      paid,
      keywords,
      ...gated,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "queue failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
