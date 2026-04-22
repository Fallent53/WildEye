/* (c) 2026 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import { readCachedExternalObservations, syncExternalObservations } from "@/lib/external-sync";
import { fetchAllExternalObservations } from "@/lib/external-data";
import { getExternalDateRange } from "@/lib/time-range";
import { enrichObservationList } from "@/lib/observation-quality";
import { BoundingBox, Category, TimeRangeFilter } from "@/lib/types";

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

const CATEGORIES = new Set<Category>(["cristal", "faune", "flore"]);

function parseLimit(value: string | null) {
  const limit = Number(value);
  if (!Number.isFinite(limit)) return 900;
  return Math.max(100, Math.min(Math.round(limit), 1200));
}

function parseCategories(value: string | null) {
  if (!value) return undefined;
  const categories = value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is Category => CATEGORIES.has(item as Category));

  return categories.length > 0 ? categories : undefined;
}

function parseBbox(value: string | null): BoundingBox | undefined {
  if (!value) return undefined;
  const parts = value.split(",").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return undefined;

  const [west, south, east, north] = parts;
  if (west < -180 || west > 180 || east < -180 || east > 180) return undefined;
  if (south < -90 || south > 90 || north < -90 || north > 90 || south >= north) return undefined;

  return [west, south, east, north];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedRange = url.searchParams.get("range") as TimeRangeFilter | null;
  const range = requestedRange && TIME_RANGES.has(requestedRange) ? requestedRange : "month";
  const bbox = parseBbox(url.searchParams.get("bbox"));
  const categories = parseCategories(url.searchParams.get("categories"));
  const limit = parseLimit(url.searchParams.get("limit"));

  try {
    let observations = await readCachedExternalObservations(range, { bbox, categories, limit });

    if (observations.length === 0) {
      await syncExternalObservations({
        range,
        gbifLimit: 260,
        inatLimit: 260,
        obisLimit: 120,
      });
      observations = await readCachedExternalObservations(range, { bbox, categories, limit });
    }

    return NextResponse.json({
      observations,
      total: observations.length,
      cache: observations.length > 0 ? "hit" : "empty",
    });
  } catch {
    let observations = await fetchAllExternalObservations({
      gbifLimit: 260,
      inatLimit: 260,
      obisLimit: 120,
      dateRange: getExternalDateRange(range),
    });

    if (categories?.length) {
      observations = observations.filter((obs) => categories.includes(obs.category));
    }

    if (bbox) {
      const [west, south, east, north] = bbox;
      observations = observations.filter((obs) => {
        const inLatitude = obs.latitude_blurred >= south && obs.latitude_blurred <= north;
        const inLongitude =
          west <= east
            ? obs.longitude_blurred >= west && obs.longitude_blurred <= east
            : obs.longitude_blurred >= west || obs.longitude_blurred <= east;
        return inLatitude && inLongitude;
      });
    }

    observations = enrichObservationList(observations)
      .sort((a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime())
      .slice(0, limit);

    return NextResponse.json({
      observations,
      total: observations.length,
      cache: "live-fallback",
    });
  }
}
