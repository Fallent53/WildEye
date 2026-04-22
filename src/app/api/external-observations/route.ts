/* (c) 2026 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import { readCachedExternalObservations, syncExternalObservations } from "@/lib/external-sync";
import { fetchAllExternalObservations } from "@/lib/external-data";
import { getExternalDateRange } from "@/lib/time-range";
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedRange = url.searchParams.get("range") as TimeRangeFilter | null;
  const range = requestedRange && TIME_RANGES.has(requestedRange) ? requestedRange : "month";

  try {
    let observations = await readCachedExternalObservations(range);

    if (observations.length === 0) {
      await syncExternalObservations({
        range,
        gbifLimit: 260,
        inatLimit: 260,
        obisLimit: 120,
      });
      observations = await readCachedExternalObservations(range);
    }

    return NextResponse.json({
      observations,
      cache: observations.length > 0 ? "hit" : "empty",
    });
  } catch {
    const observations = await fetchAllExternalObservations({
      gbifLimit: 260,
      inatLimit: 260,
      obisLimit: 120,
      dateRange: getExternalDateRange(range),
    });

    return NextResponse.json({
      observations,
      cache: "live-fallback",
    });
  }
}
