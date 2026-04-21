/* (c) 2026 - Loris Dc - WildEye Project */
import { getObservationEmoji } from "./constants";
import { Category, Observation } from "./types";

export interface ObservationZone {
  id: string;
  type: "link" | "polygon";
  category: Category;
  label: string;
  emoji: string;
  points: [number, number][]; // [lng, lat]
  sourceLabel: string;
  distanceMeters?: number;
}

const MAX_ZONE_DISTANCE_METERS = 5000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const earthRadius = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function normalizeTaxon(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTaxonKey(obs: Observation) {
  const name = obs.scientific_name ?? obs.common_name ?? obs.species_name;
  return `${obs.category}:${normalizeTaxon(name)}`;
}

function getTaxonLabel(obs: Observation) {
  return obs.common_name ?? obs.species_name;
}

function sourceLabelFromList(observations: Observation[]) {
  const sources = observations.map((o) => o.source_name).filter(Boolean);
  const unique = [...new Set(sources)];
  if (unique.length === 0) return "contributions";
  return unique.length === 1 ? unique[0]! : `${unique.length} sources`;
}

/**
 * Convex Hull algorithm (Monotone Chain)
 */
function computeConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;

  // Sort by x (longitude), then y (latitude)
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const crossProduct = (a: [number, number], b: [number, number], c: [number, number]) => {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  };

  const upper: [number, number][] = [];
  for (const p of sorted) {
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  const lower: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  upper.pop();
  lower.pop();
  return [...upper, ...lower, upper[0]]; // Close the polygon
}

export function buildObservationZones(observations: Observation[]): ObservationZone[] {
  const taxonGroups = new Map<string, Observation[]>();

  observations.forEach((obs) => {
    if (obs.user_id === "local-user" && obs.visibility === "private") return;
    const key = getTaxonKey(obs);
    const group = taxonGroups.get(key) ?? [];
    group.push(obs);
    taxonGroups.set(key, group);
  });

  const allZones: ObservationZone[] = [];

  taxonGroups.forEach((items, taxonKey) => {
    if (items.length < 2) return;

    // Clustering: group observations of the same species within distance
    const clusters: Observation[][] = [];
    const visited = new Set<string>();

    items.forEach((startObs) => {
      if (visited.has(startObs.id)) return;

      const cluster: Observation[] = [];
      const queue = [startObs];
      visited.add(startObs.id);

      while (queue.length > 0) {
        const current = queue.shift()!;
        cluster.push(current);

        items.forEach((candidate) => {
          if (visited.has(candidate.id)) return;
          const dist = distanceMeters(
            { latitude: current.latitude_blurred, longitude: current.longitude_blurred },
            { latitude: candidate.latitude_blurred, longitude: candidate.longitude_blurred }
          );

          if (dist <= MAX_ZONE_DISTANCE_METERS) {
            visited.add(candidate.id);
            queue.push(candidate);
          }
        });
      }

      if (cluster.length >= 2) {
        clusters.push(cluster);
      }
    });

    // Convert clusters to zones
    clusters.forEach((cluster, idx) => {
      const type = cluster.length === 2 ? "link" : "polygon";
      const coords = cluster.map((o) => [o.longitude_blurred, o.latitude_blurred] as [number, number]);

      if (type === "link") {
        const dist = distanceMeters(
          { latitude: cluster[0].latitude_blurred, longitude: cluster[0].longitude_blurred },
          { latitude: cluster[1].latitude_blurred, longitude: cluster[1].longitude_blurred }
        );
        allZones.push({
          id: `${taxonKey}-link-${idx}`,
          type: "link",
          category: cluster[0].category,
          label: getTaxonLabel(cluster[0]),
          emoji: getObservationEmoji(cluster[0]),
          points: coords,
          distanceMeters: Math.round(dist),
          sourceLabel: sourceLabelFromList(cluster),
        });
      } else {
        const hull = computeConvexHull(coords);
        allZones.push({
          id: `${taxonKey}-zone-${idx}`,
          type: "polygon",
          category: cluster[0].category,
          label: getTaxonLabel(cluster[0]),
          emoji: getObservationEmoji(cluster[0]),
          points: hull,
          sourceLabel: sourceLabelFromList(cluster),
        });
      }
    });
  });

  return allZones;
}

export function zonesToGeoJSON(zones: ObservationZone[]) {
  return {
    type: "FeatureCollection" as const,
    features: zones.map((zone) => ({
      type: "Feature" as const,
      geometry: zone.type === "link"
        ? { type: "LineString" as const, coordinates: zone.points }
        : { type: "Polygon" as const, coordinates: [zone.points] },
      properties: {
        id: zone.id,
        category: zone.category,
        label: zone.label,
        emoji: zone.emoji,
        type: zone.type,
        distance_meters: zone.distanceMeters,
        source_label: zone.sourceLabel,
        display_label: `Zone ${zone.label}`,
      },
    })),
  };
}

// Backward compatibility or for map usage
export function buildObservationLinks(observations: Observation[]) {
  return buildObservationZones(observations).filter((z) => z.type === "link");
}

export function linksToGeoJSON(links: any[]) {
  return zonesToGeoJSON(links as any);
}
