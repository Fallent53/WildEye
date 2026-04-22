/* (c) 2026 - Loris Dc - WildEye Project */
/**
 * ═══════════════════════════════════════════════════════════
 * WildEye — External Data Sources
 * Fetches real biodiversity observations from GBIF, iNaturalist, and OBIS
 * ═══════════════════════════════════════════════════════════
 */

import { Category, Observation } from "./types";
import { getFrenchTaxonName, standardizeAnySpecies } from "./species-catalog";

// ── GBIF API ─────────────────────────────────────────────
// Global Biodiversity Information Facility
// 209M+ occurrences in France alone — no API key needed

interface GBIFOccurrence {
  key: number;
  taxonKey?: number;
  acceptedTaxonKey?: number;
  speciesKey?: number;
  scientificName: string;
  acceptedScientificName?: string;
  vernacularName?: string;
  species?: string;
  genericName?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  decimalLatitude: number;
  decimalLongitude: number;
  eventDate?: string;
  year?: number;
  month?: number;
  day?: number;
  basisOfRecord?: string;
  modified?: string;
  lastCrawled?: string;
  publisher?: string;
  locality?: string;
  stateProvince?: string;
  occurrenceRemarks?: string;
  media?: Array<{ identifier?: string; type?: string }>;
}

interface GBIFVernacularName {
  vernacularName?: string;
  language?: string;
  country?: string;
}

interface GBIFResponse {
  offset: number;
  limit: number;
  count: number;
  results: GBIFOccurrence[];
}

interface OBISOccurrence {
  id?: string;
  occurrenceID?: string;
  scientificName?: string;
  acceptedNameUsage?: string;
  species?: string;
  kingdom?: string;
  class?: string;
  order?: string;
  family?: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  eventDate?: string;
  date_year?: number;
  datasetName?: string;
  institutionCode?: string;
  locality?: string;
  waterBody?: string;
  basisOfRecord?: string;
  license?: string;
}

interface OBISResponse {
  total?: number;
  results?: OBISOccurrence[];
}

const gbifFrenchNameCache = new Map<number, Promise<string | undefined>>();

function getGBIFTaxonLookupKey(occ: GBIFOccurrence) {
  return occ.speciesKey ?? occ.acceptedTaxonKey ?? occ.taxonKey;
}

function isProbablyScientificName(value?: string | null) {
  if (!value) return false;
  return /^[A-Z][a-z]+(?:\s[a-z-]+){1,2}$/.test(value.trim());
}

async function fetchGBIFFrenchVernacularName(taxonKey?: number) {
  if (!taxonKey) return undefined;
  const cached = gbifFrenchNameCache.get(taxonKey);
  if (cached) return cached;

  const request = fetch(`https://api.gbif.org/v1/species/${taxonKey}/vernacularNames?limit=50`)
    .then(async (res) => {
      if (!res.ok) return undefined;
      const data: { results?: GBIFVernacularName[] } | GBIFVernacularName[] = await res.json();
      const names = Array.isArray(data) ? data : data.results ?? [];
      const french =
        names.find((name) => ["fra", "fre", "fr"].includes(name.language?.toLowerCase() ?? "")) ??
        names.find((name) => name.country?.toUpperCase() === "FR");
      return french?.vernacularName;
    })
    .catch(() => undefined);

  gbifFrenchNameCache.set(taxonKey, request);
  return request;
}

function classifyGBIF(occ: GBIFOccurrence): Category {
  const kingdom = occ.kingdom?.toLowerCase() ?? "";
  const phylum = occ.phylum?.toLowerCase() ?? "";
  const cls = occ.class?.toLowerCase() ?? "";

  // Plantae → Flore
  if (kingdom === "plantae" || kingdom === "fungi") return "flore";
  // Animalia → Faune
  if (kingdom === "animalia") return "faune";
  // Mineral/geological — GBIF doesn't have minerals directly,
  // but we can detect crystal-related families
  if (phylum.includes("mineral") || cls.includes("mineral")) return "cristal";

  return "faune";
}

function gbifToObservation(occ: GBIFOccurrence): Observation {
  const blurOffset = 0.003 + Math.random() * 0.002;
  const blurAngle = Math.random() * Math.PI * 2;
  const rawSpeciesName =
    occ.species ?? occ.genericName ?? occ.acceptedScientificName ?? occ.scientificName;
  const category = classifyGBIF(occ);
  const standardized = standardizeAnySpecies({
    category: category,
    vernacularName: occ.vernacularName,
    scientificName: occ.acceptedScientificName ?? occ.scientificName,
    fallbackName: rawSpeciesName,
    group: occ.class,
    family: occ.family,
  });
  const dates = normalizeObservationDates(
    occ.eventDate ?? buildDateFromParts(occ.year, occ.month, occ.day),
    occ.modified ?? occ.lastCrawled ?? occ.eventDate ?? buildDateFromParts(occ.year, occ.month, occ.day)
  );

  return {
    id: `gbif-${occ.key}`,
    observed_at: dates.observed_at,
    created_at: dates.created_at,
    category,
    species_name: standardized?.vernacularName ?? occ.vernacularName ?? rawSpeciesName,
    common_name: standardized?.vernacularName ?? occ.vernacularName,
    description: buildGBIFDescription(occ),
    longitude: occ.decimalLongitude,
    latitude: occ.decimalLatitude,
    longitude_blurred: occ.decimalLongitude + Math.cos(blurAngle) * blurOffset,
    latitude_blurred: occ.decimalLatitude + Math.sin(blurAngle) * blurOffset,
    photo_url: occ.media?.[0]?.identifier ?? null,
    user_id: "gbif",
    source_name: "GBIF",
    source_url: `https://www.gbif.org/occurrence/${occ.key}`,
    observer_name: occ.publisher,
    location_name: occ.locality ?? occ.stateProvince,
    scientific_name: standardized?.scientificName ?? occ.acceptedScientificName ?? occ.scientificName,
    taxon_class: occ.class,
    taxon_order: occ.order,
    animal_group: standardized?.group ?? occ.class,
    animal_emoji: standardized?.emoji,
    habitat_hint: standardized?.habitatHint,
    activity_hint: standardized?.activityHint,
    sensitivity_label: standardized?.sensitivityLabel,
    family: standardized?.family ?? occ.family,
    quality_label:
      occ.basisOfRecord === "HUMAN_OBSERVATION"
        ? "Observation humaine GBIF, coordonnées sans anomalie"
        : occ.basisOfRecord,
    verification_label:
      "Donnée source : présence signalée par un jeu de données GBIF. Identification à confirmer via la fiche source.",
    source_kind: "gbif",
    external_id: String(occ.key),
    wiki_url: standardized?.scientificName ? `http://en.wikipedia.org/wiki/${standardized.scientificName.replace(" ", "_")}` : undefined,
  };
}

async function enrichGBIFObservationWithFrenchName(occ: GBIFOccurrence, observation: Observation) {
  if (!["faune", "flore"].includes(observation.category)) return observation;

  const scientificName = occ.acceptedScientificName ?? occ.species ?? occ.scientificName;
  const localFrenchName =
    getFrenchTaxonName(scientificName) ?? getFrenchTaxonName(occ.scientificName);

  if (localFrenchName) {
    return {
      ...observation,
      species_name: localFrenchName,
      common_name: localFrenchName,
    };
  }

  if (observation.common_name && !isProbablyScientificName(observation.common_name)) return observation;

  const frenchName = await fetchGBIFFrenchVernacularName(getGBIFTaxonLookupKey(occ));

  if (!frenchName) return observation;

  return {
    ...observation,
    species_name: frenchName,
    common_name: frenchName,
  };
}

function buildDateFromParts(year?: number, month?: number, day?: number): string | undefined {
  if (!year) return undefined;
  return `${year}-${String(month ?? 1).padStart(2, "0")}-${String(day ?? 1).padStart(2, "0")}`;
}

function normalizeDate(date?: string): string {
  if (!date) return new Date().toISOString();
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function normalizeObservationDates(observedDate?: string, createdDate?: string) {
  const observed = new Date(normalizeDate(observedDate));
  const created = new Date(normalizeDate(createdDate ?? observedDate));
  const now = new Date();

  if (observed > now) observed.setTime(now.getTime());
  if (created < observed) created.setTime(observed.getTime());

  return {
    observed_at: observed.toISOString(),
    created_at: created.toISOString(),
  };
}

function buildGBIFDescription(occ: GBIFOccurrence): string {
  // Only return human notes, scientific taxonomy is now handled via dedicated fields
  return occ.occurrenceRemarks || "";
}

export async function fetchGBIFObservations(options?: {
  limit?: number;
  offset?: number;
  bbox?: { swLng: number; swLat: number; neLng: number; neLat: number };
  kingdom?: string;
  taxonKey?: number;
  country?: string | null;
  dateRange?: { from: string; to: string };
}): Promise<Observation[]> {
  const {
    limit = 50,
    offset = 0,
    bbox,
    kingdom,
    taxonKey,
    country = "FR",
    dateRange,
  } = options ?? {};

  const params = new URLSearchParams({
    limit: String(Math.min(limit, 300)),
    offset: String(offset),
    hasCoordinate: "true",
    hasGeospatialIssue: "false",
    basisOfRecord: "HUMAN_OBSERVATION",
    occurrenceStatus: "PRESENT",
  });

  if (country) {
    params.set("country", country);
  }

  if (dateRange) {
    params.set("eventDate", `${dateRange.from},${dateRange.to}`);
  }

  if (bbox) {
    // GBIF uses format: decimalLatitude,decimalLongitude
    params.set("decimalLatitude", `${bbox.swLat},${bbox.neLat}`);
    params.set("decimalLongitude", `${bbox.swLng},${bbox.neLng}`);
  }

  if (kingdom) {
    // Animalia=1, Plantae=6, Fungi=5
    const kingdomKeys: Record<string, string> = { animalia: "1", plantae: "6", fungi: "5" };
    const key = kingdomKeys[kingdom.toLowerCase()];
    if (key) params.set("kingdomKey", key);
  }

  if (taxonKey) {
    params.set("taxonKey", String(taxonKey));
  }

  try {
    const res = await fetch(
      `https://api.gbif.org/v1/occurrence/search?${params.toString()}`
    );
    if (!res.ok) throw new Error(`GBIF API error: ${res.status}`);
    const data: GBIFResponse = await res.json();
    return Promise.all(
      data.results.map(async (occ) =>
        enrichGBIFObservationWithFrenchName(occ, gbifToObservation(occ))
      )
    );
  } catch (err) {
    console.warn("[WildEye] GBIF fetch failed:", err);
    return [];
  }
}

async function fetchGBIFObservationPages(options: Parameters<typeof fetchGBIFObservations>[0] & {
  totalLimit: number;
}) {
  const { totalLimit, ...baseOptions } = options;
  const pageSize = Math.min(300, totalLimit);
  const pageCount = Math.ceil(totalLimit / pageSize);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, pageIndex) =>
      fetchGBIFObservations({
        ...baseOptions,
        limit: Math.min(pageSize, totalLimit - pageIndex * pageSize),
        offset: pageIndex * pageSize,
      })
    )
  );

  return pages.flat();
}

// ── iNaturalist API ──────────────────────────────────────
// Citizen science platform — 7M+ observations in France
// Free API, no key required

interface INatObservation {
  id: number;
  uri?: string;
  species_guess: string | null;
  description: string | null;
  created_at: string;
  observed_on: string;
  place_guess: string | null;
  quality_grade: string;
  location: string; // "lat,lng"
  geojson?: { type: string; coordinates: [number, number] };
  taxon?: {
    id: number;
    name: string;
    rank: string;
    iconic_taxon_name: string;
    preferred_common_name?: string;
    default_photo?: { medium_url?: string; url?: string };
    wikipedia_url?: string;
  };
  photos?: Array<{
    id: number;
    url: string;
    license_code?: string;
    original_dimensions?: { width: number; height: number };
  }>;
  user?: {
    login: string;
    name: string;
  };
}

interface INatResponse {
  total_results: number;
  results: INatObservation[];
}

function classifyINat(obs: INatObservation): Category {
  const iconic = obs.taxon?.iconic_taxon_name?.toLowerCase() ?? "";
  // Plantae & Fungi → Flore
  if (["plantae", "fungi"].includes(iconic)) return "flore";
  // All animals
  if (
    [
      "animalia",
      "aves",
      "mammalia",
      "reptilia",
      "amphibia",
      "actinopterygii",
      "insecta",
      "arachnida",
      "mollusca",
    ].includes(iconic)
  )
    return "faune";
  return "faune";
}

function inatToObservation(obs: INatObservation): Observation | null {
  const coords = obs.geojson?.coordinates;
  if (!coords) return null;

  const [lng, lat] = coords;
  const blurOffset = 0.003 + Math.random() * 0.002;
  const blurAngle = Math.random() * Math.PI * 2;

  const rawSpeciesName =
    obs.taxon?.preferred_common_name ??
    obs.taxon?.name ??
    obs.species_guess ??
    "Espèce non identifiée";
  const category = classifyINat(obs);
  const frenchTaxonName = getFrenchTaxonName(obs.taxon?.name);
  const standardized = standardizeAnySpecies({
    category: category,
    vernacularName: obs.taxon?.preferred_common_name ?? obs.species_guess,
    scientificName: obs.taxon?.name,
    fallbackName: rawSpeciesName,
    group: obs.taxon?.iconic_taxon_name,
  });

  const photoUrl =
    obs.photos?.[0]?.url?.replace("square", "medium") ??
    obs.taxon?.default_photo?.medium_url ??
    null;
  const dates = normalizeObservationDates(obs.observed_on ?? obs.created_at, obs.created_at);

  return {
    id: `inat-${obs.id}`,
    observed_at: dates.observed_at,
    created_at: dates.created_at,
    category,
    species_name: frenchTaxonName ?? standardized?.vernacularName ?? rawSpeciesName,
    common_name:
      frenchTaxonName ??
      standardized?.vernacularName ??
      obs.taxon?.preferred_common_name ??
      obs.species_guess ??
      undefined,
    description: buildINatDescription(obs),
    longitude: lng,
    latitude: lat,
    longitude_blurred: lng + Math.cos(blurAngle) * blurOffset,
    latitude_blurred: lat + Math.sin(blurAngle) * blurOffset,
    photo_url: photoUrl,
    user_id: obs.user?.login ?? "inaturalist",
    source_name: "iNaturalist",
    source_url: obs.uri ?? `https://www.inaturalist.org/observations/${obs.id}`,
    observer_name: obs.user?.name ?? obs.user?.login,
    location_name: obs.place_guess ?? undefined,
    scientific_name: standardized?.scientificName ?? obs.taxon?.name,
    taxon_rank: obs.taxon?.rank,
    animal_group: standardized?.group ?? obs.taxon?.iconic_taxon_name,
    animal_emoji: standardized?.emoji,
    habitat_hint: standardized?.habitatHint,
    activity_hint: standardized?.activityHint,
    sensitivity_label: standardized?.sensitivityLabel,
    family: standardized?.family,
    quality_label: obs.quality_grade === "research" ? "Grade recherche iNaturalist" : obs.quality_grade,
    verification_label:
      obs.quality_grade === "research"
        ? "Identification communautaire iNaturalist au grade recherche."
        : "Observation iNaturalist encore à consolider.",
    source_kind: "inaturalist",
    external_id: String(obs.id),
    wiki_url: obs.taxon?.wikipedia_url,
  };
}

function buildINatDescription(obs: INatObservation): string {
  // Only return the user-provided description
  return obs.description || "";
}

export async function fetchINatObservations(options?: {
  limit?: number;
  page?: number;
  iconicTaxa?: string[];
  qualityGrade?: "research" | "needs_id" | "casual";
  bbox?: { swLat: number; swLng: number; neLat: number; neLng: number };
  placeId?: string | null;
  dateRange?: { from: string; to: string };
}): Promise<Observation[]> {
  const {
    limit = 50,
    page = 1,
    iconicTaxa,
    qualityGrade = "research",
    bbox,
    placeId = "6753",
    dateRange,
  } = options ?? {};

  const params = new URLSearchParams({
    per_page: String(Math.min(limit, 200)),
    page: String(page),
    order: "desc",
    order_by: "observed_on",
    quality_grade: qualityGrade,
    photos: "true",
    geo: "true",
    locale: "fr",
  });

  if (placeId) {
    params.set("place_id", placeId);
  }

  if (dateRange) {
    params.set("d1", dateRange.from);
    params.set("d2", dateRange.to);
  }

  if (iconicTaxa?.length) {
    params.set("iconic_taxa", iconicTaxa.join(","));
  }

  if (bbox) {
    params.set("swlat", String(bbox.swLat));
    params.set("swlng", String(bbox.swLng));
    params.set("nelat", String(bbox.neLat));
    params.set("nelng", String(bbox.neLng));
  }

  try {
    const res = await fetch(
      `https://api.inaturalist.org/v1/observations?${params.toString()}`
    );
    if (!res.ok) throw new Error(`iNaturalist API error: ${res.status}`);
    const data: INatResponse = await res.json();
    return data.results.map(inatToObservation).filter(Boolean) as Observation[];
  } catch (err) {
    console.warn("[WildEye] iNaturalist fetch failed:", err);
    return [];
  }
}

async function fetchINatObservationPages(options: Parameters<typeof fetchINatObservations>[0] & {
  totalLimit: number;
}) {
  const { totalLimit, ...baseOptions } = options;
  const pageSize = Math.min(200, totalLimit);
  const pageCount = Math.ceil(totalLimit / pageSize);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, pageIndex) =>
      fetchINatObservations({
        ...baseOptions,
        limit: Math.min(pageSize, totalLimit - pageIndex * pageSize),
        page: pageIndex + 1,
      })
    )
  );

  return pages.flat();
}

// ── OBIS API ──────────────────────────────────────────────
// Ocean Biodiversity Information System — global marine occurrence records.

function classifyOBIS(occ: OBISOccurrence): Category {
  const kingdom = occ.kingdom?.toLowerCase() ?? "";
  if (kingdom === "plantae" || kingdom === "fungi" || kingdom === "chromista") return "flore";
  return "faune";
}

function obisToObservation(occ: OBISOccurrence): Observation | null {
  if (typeof occ.decimalLongitude !== "number" || typeof occ.decimalLatitude !== "number") {
    return null;
  }

  const rawSpeciesName = occ.species ?? occ.acceptedNameUsage ?? occ.scientificName;
  if (!rawSpeciesName) return null;

  const category = classifyOBIS(occ);
  const scientificName = occ.acceptedNameUsage ?? occ.scientificName ?? rawSpeciesName;
  const standardized = standardizeAnySpecies({
    category: category,
    scientificName,
    fallbackName: rawSpeciesName,
    group: occ.class,
    family: occ.family,
  });
  const frenchTaxonName = getFrenchTaxonName(scientificName);
  const blurOffset = 0.003 + Math.random() * 0.002;
  const blurAngle = Math.random() * Math.PI * 2;
  const id = occ.id ?? occ.occurrenceID ?? `${scientificName}-${occ.decimalLongitude}-${occ.decimalLatitude}`;
  const observedAt = occ.eventDate ?? (occ.date_year ? `${occ.date_year}-01-01` : undefined);
  const dates = normalizeObservationDates(observedAt, observedAt);

  return {
    id: `obis-${id}`,
    observed_at: dates.observed_at,
    created_at: dates.created_at,
    category,
    species_name: frenchTaxonName ?? standardized?.vernacularName ?? rawSpeciesName,
    common_name: frenchTaxonName ?? standardized?.vernacularName,
    description: buildOBISDescription(),
    longitude: occ.decimalLongitude,
    latitude: occ.decimalLatitude,
    longitude_blurred: occ.decimalLongitude + Math.cos(blurAngle) * blurOffset,
    latitude_blurred: occ.decimalLatitude + Math.sin(blurAngle) * blurOffset,
    photo_url: null,
    user_id: "obis",
    source_name: "OBIS",
    source_url: occ.id ? `https://obis.org/occurrence/${occ.id}` : "https://obis.org/",
    observer_name: occ.institutionCode,
    location_name: occ.locality ?? occ.waterBody,
    scientific_name: standardized?.scientificName ?? scientificName,
    taxon_class: occ.class,
    taxon_order: occ.order,
    animal_group: standardized?.group ?? occ.class,
    animal_emoji: standardized?.emoji,
    habitat_hint: "Observation marine issue d'OBIS",
    activity_hint: undefined,
    sensitivity_label: undefined,
    family: standardized?.family ?? occ.family,
    quality_label: occ.basisOfRecord,
    verification_label:
      "Donnée marine OBIS publiée par un fournisseur scientifique. À vérifier via le jeu de données source.",
    source_kind: "obis",
    external_id: String(id),
  };
}

function buildOBISDescription(): string {
  // OBIS is purely scientific records, mostly without human notes
  return "";
}

export async function fetchOBISObservations(options?: {
  limit?: number;
  offset?: number;
  dateRange?: { from: string; to: string };
}): Promise<Observation[]> {
  const { limit = 50, offset = 0, dateRange } = options ?? {};

  const params = new URLSearchParams({
    size: String(Math.min(limit, 200)),
    from: String(offset),
  });

  if (dateRange) {
    params.set("startdate", dateRange.from);
    params.set("enddate", dateRange.to);
  }

  try {
    const res = await fetch(`https://api.obis.org/v3/occurrence?${params.toString()}`);
    if (!res.ok) throw new Error(`OBIS API error: ${res.status}`);
    const data: OBISResponse = await res.json();
    return (data.results ?? []).map(obisToObservation).filter(Boolean) as Observation[];
  } catch (err) {
    console.warn("[WildEye] OBIS fetch failed:", err);
    return [];
  }
}

async function fetchOBISObservationPages(options: Parameters<typeof fetchOBISObservations>[0] & {
  totalLimit: number;
}) {
  const { totalLimit, ...baseOptions } = options;
  const pageSize = Math.min(200, totalLimit);
  const pageCount = Math.ceil(totalLimit / pageSize);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, pageIndex) =>
      fetchOBISObservations({
        ...baseOptions,
        limit: Math.min(pageSize, totalLimit - pageIndex * pageSize),
        offset: pageIndex * pageSize,
      })
    )
  );

  return pages.flat();
}

// ── Combined Fetch ───────────────────────────────────────
// Fetches real records from multiple global sources, deduplicates, and merges.

// GBIF and iNaturalist are biodiversity sources, so minerals are filled from a
// conservative local reference set of well-known French mountain occurrences.
const MINERAL_REFERENCE_DATA: Array<{
  id: string;
  mineral: string;
  scientificName: string;
  description: string;
  locationName: string;
  lng: number;
  lat: number;
  observedAt: string;
  sourceUrl: string;
  family: string;
}> = [
  {
    id: "mineral-oisans-quartz-fume",
    mineral: "Quartz fumé",
    scientificName: "Quartz, variété fumée",
    description: "Cristaux alpins associés aux fissures de granite du massif de l'Oisans.",
    locationName: "Oisans, Isère",
    lng: 6.06,
    lat: 45.02,
    observedAt: "2025-10-11",
    sourceUrl: "https://fr.wikipedia.org/wiki/Quartz_(min%C3%A9ral)",
    family: "Silicates",
  },
  {
    id: "mineral-mont-blanc-adulaire",
    mineral: "Adulaire",
    scientificName: "Orthose, variété adulaire",
    description: "Cristaux clairs fréquents dans les fentes alpines du massif du Mont-Blanc.",
    locationName: "Massif du Mont-Blanc, Haute-Savoie",
    lng: 6.86,
    lat: 45.91,
    observedAt: "2025-09-22",
    sourceUrl: "https://fr.wikipedia.org/wiki/Adulaire",
    family: "Feldspaths",
  },
  {
    id: "mineral-belledonne-axinite",
    mineral: "Axinite",
    scientificName: "Axinite-(Fe)",
    description: "Cristaux bruns tabulaires signalés dans les zones métamorphiques de Belledonne.",
    locationName: "Chaîne de Belledonne, Isère",
    lng: 5.99,
    lat: 45.18,
    observedAt: "2025-08-30",
    sourceUrl: "https://fr.wikipedia.org/wiki/Axinite",
    family: "Sorosilicates",
  },
  {
    id: "mineral-chamonix-fluorine",
    mineral: "Fluorine violette",
    scientificName: "Fluorite",
    description: "Cristaux violets en association avec quartz et minéraux alpins.",
    locationName: "Vallée de Chamonix, Haute-Savoie",
    lng: 6.89,
    lat: 45.93,
    observedAt: "2025-08-03",
    sourceUrl: "https://fr.wikipedia.org/wiki/Fluorine",
    family: "Halogénures",
  },
  {
    id: "mineral-beaufortain-epidote",
    mineral: "Épidote",
    scientificName: "Epidote",
    description: "Amas vert pistache dans les roches métamorphiques du Beaufortain.",
    locationName: "Beaufortain, Savoie",
    lng: 6.59,
    lat: 45.70,
    observedAt: "2025-07-19",
    sourceUrl: "https://fr.wikipedia.org/wiki/%C3%89pidote",
    family: "Sorosilicates",
  },
  {
    id: "mineral-ecrins-anatase",
    mineral: "Anatase",
    scientificName: "Anatase",
    description: "Micro-cristaux bleu acier observables sur quartz dans les fentes alpines.",
    locationName: "Massif des Écrins, Hautes-Alpes",
    lng: 6.36,
    lat: 44.93,
    observedAt: "2025-07-08",
    sourceUrl: "https://fr.wikipedia.org/wiki/Anatase",
    family: "Oxydes",
  },
  {
    id: "mineral-pyrenees-siderite",
    mineral: "Sidérite",
    scientificName: "Sidérite",
    description: "Carbonate de fer associé à des filons hydrothermaux pyrénéens.",
    locationName: "Ariège, Pyrénées",
    lng: 1.47,
    lat: 42.76,
    observedAt: "2025-06-14",
    sourceUrl: "https://fr.wikipedia.org/wiki/Sid%C3%A9rite",
    family: "Carbonates",
  },
  {
    id: "mineral-sancy-amethyste",
    mineral: "Améthyste",
    scientificName: "Quartz, variété améthyste",
    description: "Quartz violet lié aux contextes volcaniques du Massif central.",
    locationName: "Massif du Sancy, Puy-de-Dôme",
    lng: 2.82,
    lat: 45.53,
    observedAt: "2025-05-29",
    sourceUrl: "https://fr.wikipedia.org/wiki/Am%C3%A9thyste",
    family: "Silicates",
  },
  {
    id: "mineral-cantal-calcite",
    mineral: "Calcite",
    scientificName: "Calcite",
    description: "Cristallisations carbonatées dans fractures et cavités du volcanisme cantalien.",
    locationName: "Monts du Cantal, Cantal",
    lng: 2.75,
    lat: 45.06,
    observedAt: "2025-05-02",
    sourceUrl: "https://fr.wikipedia.org/wiki/Calcite",
    family: "Carbonates",
  },
  {
    id: "mineral-vosges-grenat",
    mineral: "Grenat almandin",
    scientificName: "Almandin",
    description: "Grenats rouge sombre présents dans certains gneiss et micaschistes vosgiens.",
    locationName: "Hautes Vosges",
    lng: 7.00,
    lat: 48.04,
    observedAt: "2025-04-17",
    sourceUrl: "https://fr.wikipedia.org/wiki/Almandin",
    family: "Nésosilicates",
  },
  {
    id: "mineral-corse-actinote",
    mineral: "Actinote",
    scientificName: "Actinote",
    description: "Aiguilles vertes dans roches métamorphiques alpines corses.",
    locationName: "Massif du Cinto, Corse",
    lng: 9.02,
    lat: 42.28,
    observedAt: "2025-03-26",
    sourceUrl: "https://fr.wikipedia.org/wiki/Actinote",
    family: "Inosilicates",
  },
  {
    id: "mineral-queyras-rutile",
    mineral: "Rutile",
    scientificName: "Rutile",
    description: "Cristaux aciculaires inclus ou libres dans roches métamorphiques alpines.",
    locationName: "Queyras, Hautes-Alpes",
    lng: 6.80,
    lat: 44.73,
    observedAt: "2025-03-09",
    sourceUrl: "https://fr.wikipedia.org/wiki/Rutile",
    family: "Oxydes",
  },
];

function mineralReferenceToObservation(item: (typeof MINERAL_REFERENCE_DATA)[number]): Observation {
  const blurOffset = 0.004;
  const blurAngle = item.id.length;

  return {
    id: item.id,
    observed_at: new Date(item.observedAt).toISOString(),
    created_at: new Date(`${item.observedAt}T12:00:00.000Z`).toISOString(),
    category: "cristal",
    species_name: item.mineral,
    description: item.description,
    longitude: item.lng,
    latitude: item.lat,
    longitude_blurred: item.lng + Math.cos(blurAngle) * blurOffset,
    latitude_blurred: item.lat + Math.sin(blurAngle) * blurOffset,
    photo_url: null,
    user_id: "mineral-reference",
    source_name: "Référence minéralogique",
    source_kind: "reference",
    source_url: item.sourceUrl,
    observer_name: "Donnée publique synthétisée",
    location_name: item.locationName,
    scientific_name: item.scientificName,
    family: item.family,
    quality_label: "Localité publique approximative",
    verification_label:
      "Référence de contexte minéralogique, pas une observation naturaliste récente.",
    external_id: item.id,
  };
}

export function fetchMineralReferenceObservations(): Observation[] {
  return MINERAL_REFERENCE_DATA.map(mineralReferenceToObservation);
}

const MOUNTAIN_TAXA = [
  { taxonKey: 5220170, label: "Rupicapra rupicapra" },
  { taxonKey: 2441055, label: "Capra ibex" },
  { taxonKey: 2437377, label: "Marmota marmota" },
  { taxonKey: 2480649, label: "Gypaetus barbatus" },
  { taxonKey: 2480506, label: "Aquila chrysaetos" },
  { taxonKey: 5227679, label: "Lagopus muta" },
  { taxonKey: 3140685, label: "Leontopodium nivale" },
] as const;

async function fetchMountainSpeciesObservations(options?: {
  dateRange?: { from: string; to: string };
}) {
  const pages = await Promise.all(
    MOUNTAIN_TAXA.map((taxon) =>
      fetchGBIFObservationPages({
        totalLimit: 45,
        taxonKey: taxon.taxonKey,
        country: "FR",
        dateRange: options?.dateRange,
      })
    )
  );

  return pages.flat();
}

export async function fetchAllExternalObservations(options?: {
  gbifLimit?: number;
  inatLimit?: number;
  obisLimit?: number;
  dateRange?: { from: string; to: string };
}): Promise<Observation[]> {
  const { gbifLimit = 180, inatLimit = 180, obisLimit = 120, dateRange } = options ?? {};

  const [
    gbifFranceFaune,
    gbifFranceFlore,
    gbifWorldFaune,
    gbifWorldFlore,
    gbifMountainSpecies,
    inatFranceFaune,
    inatFranceFlore,
    inatWorldFaune,
    inatWorldFlore,
    obisWorld,
  ] = await Promise.all([
    fetchGBIFObservationPages({ totalLimit: Math.floor(gbifLimit * 0.42), kingdom: "animalia", country: "FR", dateRange }),
    fetchGBIFObservationPages({ totalLimit: Math.floor(gbifLimit * 0.23), kingdom: "plantae", country: "FR", dateRange }),
    fetchGBIFObservationPages({ totalLimit: Math.floor(gbifLimit * 0.23), kingdom: "animalia", country: null, dateRange }),
    fetchGBIFObservationPages({ totalLimit: Math.ceil(gbifLimit * 0.12), kingdom: "plantae", country: null, dateRange }),
    fetchMountainSpeciesObservations({ dateRange }),
    fetchINatObservationPages({
      totalLimit: Math.floor(inatLimit * 0.42),
      placeId: "6753",
      iconicTaxa: ["Mammalia", "Aves", "Reptilia", "Amphibia", "Insecta", "Arachnida", "Mollusca"],
      dateRange,
    }),
    fetchINatObservationPages({
      totalLimit: Math.floor(inatLimit * 0.22),
      placeId: "6753",
      iconicTaxa: ["Plantae", "Fungi"],
      dateRange,
    }),
    fetchINatObservationPages({
      totalLimit: Math.floor(inatLimit * 0.2),
      placeId: null,
      iconicTaxa: ["Mammalia", "Aves", "Reptilia", "Amphibia", "Insecta", "Arachnida"],
      dateRange,
    }),
    fetchINatObservationPages({
      totalLimit: Math.ceil(inatLimit * 0.16),
      placeId: null,
      iconicTaxa: ["Plantae", "Fungi"],
      dateRange,
    }),
    fetchOBISObservationPages({ totalLimit: obisLimit, dateRange }),
  ]);

  const GENERIC_KINGDOMS = [
    "animalia",
    "plantae",
    "fungi",
    "chromista",
    "bacteria",
    "archaea",
    "viruses",
    "protozoa",
    "life",
    "incertae sedis",
    "espèce non identifiée",
  ];

  const all = [
    ...gbifFranceFaune,
    ...gbifFranceFlore,
    ...gbifWorldFaune,
    ...gbifWorldFlore,
    ...gbifMountainSpecies,
    ...inatFranceFaune,
    ...inatFranceFlore,
    ...inatWorldFaune,
    ...inatWorldFlore,
    ...obisWorld,
  ].filter((obs) => {
    if (!obs.species_name) return false;
    const lower = obs.species_name.toLowerCase().trim();
    if (GENERIC_KINGDOMS.includes(lower)) return false;

    if (obs.scientific_name) {
      const sciLower = obs.scientific_name.toLowerCase().trim();
      if (GENERIC_KINGDOMS.includes(sciLower)) return false;
    }

    return true;
  });

  // Simple dedup by proximity (within ~100m)
  const deduped: Observation[] = [];
  for (const obs of all) {
    const isDuplicate = deduped.some(
      (d) =>
        Math.abs(d.latitude - obs.latitude) < 0.001 &&
        Math.abs(d.longitude - obs.longitude) < 0.001 &&
        d.species_name === obs.species_name
    );
    if (!isDuplicate) deduped.push(obs);
  }

  return deduped.sort(
    (a, b) =>
      new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime()
  );
}
