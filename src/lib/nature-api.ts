/**
 * Service to interact with the iNaturalist API for species search and data enrichment.
 */

export interface RemoteTaxon {
  id: number;
  name: string; // Scientific name
  preferred_common_name?: string;
  rank: string;
  rank_level: number;
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

export interface INatAutocompleteResponse {
  total_results: number;
  results: RemoteTaxon[];
}

/**
 * Searches for species using iNaturalist autocomplete API.
 * Filtered for active (non-extinct) species and localized in French.
 */
export async function searchSpecies(query: string): Promise<RemoteTaxon[]> {
  if (!query || query.trim().length < 2) return [];

  const url = new URL("https://api.inaturalist.org/v1/taxa/autocomplete");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("locale", "fr");
  url.searchParams.set("is_active", "true"); // Exclude extinct species
  url.searchParams.set("per_page", "8");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
      // iNaturalist prefers a meaningful User-Agent
      // (Simplified for browser use, but good to know)
    });

    if (!response.ok) {
      console.error("iNaturalist API error:", response.statusText);
      return [];
    }

    const data: INatAutocompleteResponse = await response.json();
    return data.results;
  } catch (err) {
    console.error("Failed to fetch from iNaturalist:", err);
    return [];
  }
}
