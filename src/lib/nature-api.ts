/* (c) 2026 - Loris Dc - WildEye Project */
/**
 * Service to interact with the iNaturalist and Wikidata APIs.
 */

import { Category } from "./types";

export interface RemoteTaxon {
  id: number;
  name: string; // Scientific name
  preferred_common_name?: string;
  rank: string;
  rank_level: number;
  iconic_taxon_name?: string; // e.g. 'Plantae', 'Fungi', 'Animalia'
  default_photo?: {
    square_url: string;
    medium_url: string;
    attribution: string;
  };
  ancestors?: Array<{
    name: string;
    rank: string;
  }>;
}

export interface RemoteMineral {
  id: string; // QID
  label: string;
  description?: string;
  url: string;
}

export interface INatAutocompleteResponse {
  total_results: number;
  results: RemoteTaxon[];
}

/**
 * Searches for species using iNaturalist autocomplete API.
 * Filtered by category (Fauna or Flora).
 */
export async function searchSpecies(query: string, category: Category): Promise<RemoteTaxon[]> {
  if (!query || query.trim().length < 2) return [];

  const url = new URL("https://api.inaturalist.org/v1/taxa/autocomplete");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("locale", "fr");
  url.searchParams.set("is_active", "true");
  url.searchParams.set("per_page", "8");

  // Filter based on category
  if (category === "faune") {
    url.searchParams.set("iconic_taxa", "1"); // Animalia
  } else if (category === "flore") {
    // Plantae, Fungi, Chromista (Seaweeds)
    url.searchParams.set("iconic_taxa", "47126,47170,48220");
  }

  try {
    const response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) return [];
    const data: INatAutocompleteResponse = await response.json();
    return data.results;
  } catch (err) {
    console.error("Failed to fetch from iNaturalist:", err);
    return [];
  }
}

/**
 * Searches for minerals and crystals using the Wikidata Search API.
 */
export async function searchMinerals(query: string): Promise<RemoteMineral[]> {
  if (!query || query.trim().length < 2) return [];

  // Search Wikidata for items with the query in French
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("search", query.trim());
  url.searchParams.set("language", "fr");
  url.searchParams.set("format", "json");
  url.searchParams.set("type", "item");
  url.searchParams.set("origin", "*"); // CORS
  url.searchParams.set("limit", "8");

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return [];
    const data = await response.json();

    if (!data.search) return [];

    return (data.search as any[]).map(item => ({
      id: item.id,
      label: item.label,
      description: item.description,
      url: `https://www.wikidata.org/wiki/${item.id}`
    }));
  } catch (err) {
    console.error("Failed to fetch from Wikidata:", err);
    return [];
  }
}
