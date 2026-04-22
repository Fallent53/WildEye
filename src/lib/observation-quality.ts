/* (c) 2026 - Loris Dc - WildEye Project */
import { Observation } from "./types";

const MARINE_HINTS = [
  "marine",
  "sea",
  "ocean",
  "pelagic",
  "coastal",
  "poisson",
  "fish",
  "crustace",
  "mollusc",
  "obis",
];

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function includesAny(value: string, needles: string[]) {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle));
}

function scoreObservation(obs: Observation) {
  let score = 55; // Base score
  const source = obs.source_kind;
  const quality = `${obs.quality_label ?? ""} ${obs.verification_label ?? ""}`.toLowerCase();

  // Source & Verification Bonuses
  if (source === "inaturalist") {
    score += quality.includes("recherche") || quality.includes("research") ? 30 : 10;
    if (quality.includes("needs_id")) score -= 15;
  } else if (source === "gbif") {
    score += quality.includes("coordinate") ? 15 : 25;
  } else if (source === "obis") {
    score += 20;
  } else if (source === "local") {
    score += obs.verification_status === "verified" ? 30 : -5;
  }

  // Completeness Bonuses
  if (hasText(obs.photo_url)) score += 12;
  if (hasText(obs.scientific_name)) score += 8;
  if (hasText(obs.family)) score += 4;
  if (hasText(obs.description) && obs.description.length > 10) score += 5;
  if (hasText(obs.observer_name) && !obs.is_anonymous) score += 5;

  // Penalties
  if (obs.privacy_level === "protected") score -= 5;
  if (obs.verification_status === "pending") score -= 20;
  if (obs.verification_status === "rejected") score -= 50;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function reliabilityLabel(score: number) {
  if (score >= 88) return "Tres fiable";
  if (score >= 72) return "Fiable";
  if (score >= 55) return "A confirmer";
  return "Fragile";
}

function detectAnomalies(obs: Observation) {
  const flags: string[] = [];
  const observedAt = new Date(obs.observed_at).getTime();
  const createdAt = new Date(obs.created_at).getTime();

  if (!Number.isFinite(observedAt)) flags.push("Date d'observation invalide");
  if (!Number.isFinite(createdAt)) flags.push("Date de publication invalide");
  if (Number.isFinite(observedAt) && Number.isFinite(createdAt) && createdAt < observedAt) {
    flags.push("Mise en ligne avant observation");
  }

  if (Number.isFinite(observedAt) && observedAt > Date.now() + 86400000) {
    flags.push("Observation dans le futur");
  }

  if (
    !Number.isFinite(obs.longitude_blurred) ||
    !Number.isFinite(obs.latitude_blurred) ||
    Math.abs(obs.longitude_blurred) > 180 ||
    Math.abs(obs.latitude_blurred) > 90
  ) {
    flags.push("Coordonnees invalides");
  }

  const joinedTaxon = [
    obs.source_kind,
    obs.species_name,
    obs.common_name,
    obs.scientific_name,
    obs.family,
    obs.animal_group,
    obs.habitat_hint,
  ]
    .filter(Boolean)
    .join(" ");

  if (obs.source_kind === "obis" || includesAny(joinedTaxon, MARINE_HINTS)) {
    if (obs.latitude_blurred > 42 && obs.longitude_blurred > -6 && obs.longitude_blurred < 10) {
      flags.push("Taxon marin a verifier hors littoral");
    }
  }

  return flags.slice(0, 3);
}

export function enrichObservationQuality(obs: Observation): Observation {
  const anomaly_flags = detectAnomalies(obs);
  const reliability_score = Math.max(0, scoreObservation(obs) - anomaly_flags.length * 20);

  return {
    ...obs,
    reliability_score,
    reliability_label: anomaly_flags.length > 0 ? "A verifier" : reliabilityLabel(reliability_score),
    anomaly_flags,
  };
}

export function enrichObservationList(observations: Observation[]) {
  return observations.map(enrichObservationQuality);
}
