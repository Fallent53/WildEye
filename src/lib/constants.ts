/* (c) 2026 - Loris Dc - WildEye Project */
import { getTaxonEmoji } from "./taxon-icons";
import { Category, Observation } from "./types";

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  cristal: {
    label: "Cristaux & Minéraux",
    emoji: "🔮",
    color: "var(--color-cristal)",
    bgColor: "var(--color-cristal-bg)",
  },
  faune: {
    label: "Faune Sauvage",
    emoji: "🐾",
    color: "var(--color-faune)",
    bgColor: "var(--color-faune-bg)",
  },
  flore: {
    label: "Flore Remarquable",
    emoji: "🌿",
    color: "var(--color-flore)",
    bgColor: "var(--color-flore-bg)",
  },
};

export function getObservationEmoji(obs: Pick<
  Observation,
  | "category"
  | "taxon_emoji"
  | "animal_emoji"
  | "common_name"
  | "species_name"
  | "scientific_name"
  | "animal_group"
  | "taxon_class"
  | "family"
>) {
  return getTaxonEmoji(obs);
}

export const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAP_STYLE = "mapbox://styles/mapbox/outdoors-v12";

export const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [-5.5, 41.0],
  [9.8, 51.2],
];

export const DEFAULT_VIEW = {
  longitude: 2.8,
  latitude: 46.5,
  zoom: 5.5,
  pitch: 45,
  bearing: -10,
};
