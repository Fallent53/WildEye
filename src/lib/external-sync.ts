/* (c) 2026 - Loris Dc - WildEye Project */
import { getSupabaseAdmin } from "./supabase-admin";
import { fetchAllExternalObservations } from "./external-data";
import { getExternalDateRange } from "./time-range";
import { Observation, TimeRangeFilter } from "./types";

const EXTERNAL_CACHE_TABLE = "external_observations";

export type ExternalSyncOptions = {
  range?: TimeRangeFilter;
  gbifLimit?: number;
  inatLimit?: number;
  obisLimit?: number;
};

function sanitizeExternalObservation(obs: Observation) {
  const row = { ...obs };
  delete row.owner_ref;
  return {
    ...row,
    visibility: "public",
    verification_status: obs.verification_status ?? "verified",
    synced_at: new Date().toISOString(),
  };
}

export async function readCachedExternalObservations(range: TimeRangeFilter) {
  const start = getExternalDateRange(range)?.from;
  let query = getSupabaseAdmin()
    .from(EXTERNAL_CACHE_TABLE)
    .select("*")
    .eq("visibility", "public")
    .order("observed_at", { ascending: false })
    .limit(1200);

  if (start) {
    query = query.gte("observed_at", start);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Observation[];
}

export async function syncExternalObservations(options: ExternalSyncOptions = {}) {
  const range = options.range ?? "month";
  const observations = await fetchAllExternalObservations({
    gbifLimit: options.gbifLimit ?? 520,
    inatLimit: options.inatLimit ?? 520,
    obisLimit: options.obisLimit ?? 240,
    dateRange: getExternalDateRange(range),
  });

  const rows = observations.map(sanitizeExternalObservation);
  if (rows.length === 0) {
    return { synced: 0 };
  }

  const { error } = await getSupabaseAdmin()
    .from(EXTERNAL_CACHE_TABLE)
    .upsert(rows, { onConflict: "id" });

  if (error) throw error;
  return { synced: rows.length };
}
