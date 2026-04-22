/* (c) 2026 - Loris Dc - WildEye Project */
import { Category, Observation, ObservationPrivacyLevel, ObservationVisibility } from "./types";
import { isImageSafe, validateContent } from "./moderation";

const CATEGORIES = new Set<Category>(["cristal", "faune", "flore"]);
const VISIBILITIES = new Set<ObservationVisibility>(["public", "private"]);
const PRIVACY_LEVELS = new Set<ObservationPrivacyLevel>(["standard", "protected"]);

export type ObservationInput = Omit<
  Observation,
  "id" | "created_at" | "user_id" | "owner_ref" | "longitude_blurred" | "latitude_blurred"
>;

export function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function normalizeOptionalText(value: unknown, maxLength: number) {
  const normalized = normalizeText(value, maxLength);
  return normalized || undefined;
}

export function normalizeOptionalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const url = value.trim();

  if (url.startsWith("data:image/")) {
    return url.length <= 500_000 && isImageSafe(url) ? url : null;
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return isImageSafe(url) ? url.slice(0, 2048) : null;
  } catch {
    return null;
  }
}

export function normalizeObservedDate(value: unknown, now = new Date()) {
  const parsed = typeof value === "string" ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return now;
  return parsed > now ? now : parsed;
}

export function getBlurredCoordinates(
  longitude: number,
  latitude: number,
  privacyLevel: ObservationPrivacyLevel
) {
  const blurOffset =
    privacyLevel === "protected"
      ? 0.018 + Math.random() * 0.025
      : 0.003 + Math.random() * 0.002;
  const blurAngle = Math.random() * Math.PI * 2;

  return {
    longitude_blurred: longitude + Math.cos(blurAngle) * blurOffset,
    latitude_blurred: latitude + Math.sin(blurAngle) * blurOffset,
  };
}

export function validateObservationInput(body: Partial<ObservationInput>) {
  const now = new Date();
  const category = body.category;
  if (!category || !CATEGORIES.has(category)) {
    throw new Error("Catégorie invalide.");
  }

  const species_name = normalizeText(body.species_name, 120);
  if (!species_name) throw new Error("Nom d'observation manquant.");

  const description = normalizeText(body.description, 2000);
  const moderated = [validateContent(species_name), validateContent(description)];
  const foundWords = moderated.flatMap((result) => result.foundWords);
  if (foundWords.length > 0) {
    throw new Error("Contenu inapproprié détecté.");
  }

  const longitude = Number(body.longitude);
  const latitude = Number(body.latitude);
  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error("Coordonnées invalides.");
  }

  const observedAt = normalizeObservedDate(body.observed_at, now);
  const privacy_level: ObservationPrivacyLevel = PRIVACY_LEVELS.has(body.privacy_level ?? "standard")
    ? body.privacy_level ?? "standard"
    : "standard";
  const visibility: ObservationVisibility = VISIBILITIES.has(body.visibility ?? "public")
    ? body.visibility ?? "public"
    : "public";

  return {
    observed_at: observedAt.toISOString(),
    created_at: now.toISOString(),
    category,
    species_name,
    common_name: normalizeOptionalText(body.common_name, 120),
    scientific_name: normalizeOptionalText(body.scientific_name, 160),
    animal_group: normalizeOptionalText(body.animal_group, 120),
    animal_emoji: normalizeOptionalText(body.animal_emoji, 32),
    habitat_hint: normalizeOptionalText(body.habitat_hint, 300),
    activity_hint: normalizeOptionalText(body.activity_hint, 300),
    sensitivity_label: normalizeOptionalText(body.sensitivity_label, 160),
    family: normalizeOptionalText(body.family, 160),
    quality_label: normalizeOptionalText(body.quality_label, 160),
    verification_label: normalizeOptionalText(body.verification_label, 300),
    description,
    longitude,
    latitude,
    photo_url: normalizeOptionalUrl(body.photo_url),
    source_name: "Contribution locale",
    source_kind: "local" as const,
    source_url: normalizeOptionalUrl(body.source_url),
    observer_name: normalizeOptionalText(body.observer_name, 120) ?? "Anonyme",
    visibility,
    privacy_level,
    is_anonymous: Boolean(body.is_anonymous),
    verification_status: "pending" as const,
    crystal_system: normalizeOptionalText(body.crystal_system, 120),
    luster: normalizeOptionalText(body.luster, 120),
    hardness: normalizeOptionalText(body.hardness, 40),
    associated_minerals: normalizeOptionalText(body.associated_minerals, 240),
  };
}

export function validateObservationPatch(body: {
  visibility?: unknown;
  is_anonymous?: unknown;
  privacy_level?: unknown;
  observer_name?: unknown;
}) {
  const patch: {
    visibility?: ObservationVisibility;
    is_anonymous?: boolean;
    privacy_level?: ObservationPrivacyLevel;
    observer_name?: string;
  } = {};

  if (body.visibility !== undefined) {
    if (!VISIBILITIES.has(body.visibility as ObservationVisibility)) {
      throw new Error("Visibilité invalide.");
    }
    patch.visibility = body.visibility as ObservationVisibility;
  }

  if (body.is_anonymous !== undefined) {
    patch.is_anonymous = Boolean(body.is_anonymous);
    patch.observer_name = patch.is_anonymous
      ? "Anonyme"
      : normalizeOptionalText(body.observer_name, 120) ?? "Explorateur Anonyme";
  }

  if (body.privacy_level !== undefined) {
    if (!PRIVACY_LEVELS.has(body.privacy_level as ObservationPrivacyLevel)) {
      throw new Error("Niveau de confidentialité invalide.");
    }
    patch.privacy_level = body.privacy_level as ObservationPrivacyLevel;
  }

  return patch;
}
