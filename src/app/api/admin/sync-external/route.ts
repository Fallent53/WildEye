/* (c) 2026 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { syncExternalObservations } from "@/lib/external-sync";
import { TimeRangeFilter } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIME_RANGES = new Set<TimeRangeFilter>([
  "day",
  "week",
  "month",
  "year",
  "five-years",
  "all",
]);

function isCronAuthorized(request: Request) {
  const secret = process.env.EXTERNAL_SYNC_SECRET;
  const header = request.headers.get("x-sync-secret");
  return Boolean(secret && header && header === secret);
}

async function isAuthorized(request: Request) {
  return isCronAuthorized(request) || (await isAdminSessionValid());
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: { range?: TimeRangeFilter; gbifLimit?: number; inatLimit?: number; obisLimit?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const range = body.range && TIME_RANGES.has(body.range) ? body.range : "month";
  const result = await syncExternalObservations({
    range,
    gbifLimit: Math.min(Math.max(Number(body.gbifLimit) || 520, 1), 2000),
    inatLimit: Math.min(Math.max(Number(body.inatLimit) || 520, 1), 2000),
    obisLimit: Math.min(Math.max(Number(body.obisLimit) || 240, 1), 1200),
  });

  return NextResponse.json({ ok: true, ...result });
}
