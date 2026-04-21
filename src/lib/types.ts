export type Category = "cristal" | "faune" | "flore";
export type Locale = "fr" | "en";
export type SortOrder = "newest" | "oldest";
export type TimeRangeFilter = "day" | "week" | "month" | "year" | "five-years" | "all";
export type ObservationVisibility = "public" | "private";
export type ObservationPrivacyLevel = "standard" | "protected";
export type SpeciesProposalStatus = "pending" | "approved" | "merged" | "rejected";

export interface LocalizedText {
  fr: string;
  en?: string;
}

export interface SpeciesProposal {
  id: string;
  created_at: string;
  proposed_name: string;
  category: Category;
  note?: string;
  nearby_existing_name?: string;
  status: SpeciesProposalStatus;
  submitted_by: string;
}

export interface UserProfile {
  id: string;
  name: string;
}

export interface Observation {
  id: string;
  /** Date the observation actually happened. */
  observed_at: string;
  /** Date the observation was published/imported in the app or source. */
  created_at: string;
  category: Category;
  species_name: string;
  description: string;
  longitude: number;
  latitude: number;
  /** Blurred coords for public display */
  longitude_blurred: number;
  latitude_blurred: number;
  photo_url: string | null;
  user_id: string;
  source_name?: string;
  source_url?: string;
  observer_name?: string;
  location_name?: string;
  common_name?: string;
  scientific_name?: string;
  taxon_rank?: string;
  taxon_class?: string;
  taxon_order?: string;
  animal_group?: string;
  animal_emoji?: string;
  taxon_emoji?: string;
  habitat_hint?: string;
  activity_hint?: string;
  sensitivity_label?: string;
  family?: string;
  quality_label?: string;
  verification_label?: string;
  source_kind?: "demo" | "gbif" | "inaturalist" | "obis" | "reference" | "local";
  external_id?: string;
  visibility?: ObservationVisibility;
  privacy_level?: ObservationPrivacyLevel;
  is_anonymous?: boolean;
  verification_status?: "pending" | "verified" | "rejected";
  moderation_note?: string;
  wiki_url?: string;
  // Specific for Minerals (cristal)
  crystal_system?: string;
  luster?: string;
  hardness?: string;
  associated_minerals?: string;
}

export interface FilterState {
  cristal: boolean;
  faune: boolean;
  flore: boolean;
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}
