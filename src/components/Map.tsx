/* (c) 2024 - Loris Dc - WildEye Project */
"use client";

import { useEffect, useRef, useCallback, useMemo, useDeferredValue } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppStore } from "@/lib/store";
import { getObservationEmoji, MAPBOX_TOKEN, MAP_STYLE } from "@/lib/constants";
import { buildObservationZones, zonesToGeoJSON } from "@/lib/observation-zones";
import { isObservationInTimeRange } from "@/lib/time-range";
import { Observation, Category } from "@/lib/types";
import styles from "./Map.module.css";

const CATEGORY_COLORS: Record<Category, string> = {
  cristal: "#a78bfa",
  faune: "#fbbf24",
  flore: "#34d399",
};

const EMOJI_IMAGE_PREFIX = "taxon-emoji-";

function getEmojiImageId(emoji: string) {
  return `${EMOJI_IMAGE_PREFIX}${Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16) ?? "0")
    .join("-")}`;
}

function createEmojiImage(emoji: string) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return new ImageData(size, size);

  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "42px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
  ctx.shadowColor = "rgba(10, 15, 13, 0.78)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillText(emoji, size / 2, size / 2 + 1);

  return ctx.getImageData(0, 0, size, size);
}

function ensureObservationEmojiImages(map: mapboxgl.Map, observations: Observation[]) {
  observations.forEach((obs) => {
    const emoji = getObservationEmoji(obs);
    const imageId = getEmojiImageId(emoji);
    if (!map.hasImage(imageId)) {
      map.addImage(imageId, createEmojiImage(emoji));
    }
  });
}

function observationsToGeoJSON(observations: Observation[]) {
  return {
    type: "FeatureCollection" as const,
    features: observations.map((obs) => ({
      type: "Feature" as const,
      id: obs.id,
      geometry: {
        type: "Point" as const,
        coordinates: [obs.longitude_blurred, obs.latitude_blurred],
      },
      properties: {
        emoji_key: getEmojiImageId(getObservationEmoji(obs)),
        custom_id: obs.id,
        category: obs.category,
        species_name: obs.species_name,
        description: obs.description,
        observed_at: obs.observed_at,
        created_at: obs.created_at,
        source_name: obs.source_name,
        location_name: obs.location_name,
        scientific_name: obs.scientific_name,
        family: obs.family,
        color: CATEGORY_COLORS[obs.category],
        emoji: getObservationEmoji(obs),
      },
    })),
  };
}

function formatPopupDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const sourceReady = useRef(false);
  const observationsRef = useRef<Observation[]>([]);
  const filteredObservationsRef = useRef<Observation[]>([]);
  const mapDataUpdateTimer = useRef<number | null>(null);

  const observations = useAppStore((s) => s.observations);
  const filters = useAppStore((s) => s.filters);
  const timeRange = useAppStore((s) => s.timeRange);
  const selectObservation = useAppStore((s) => s.selectObservation);
  const viewState = useAppStore((s) => s.viewState);
  const flyToTarget = useAppStore((s) => s.flyToTarget);
  const setFlyTo = useAppStore((s) => s.setFlyTo);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const isAddingObservation = useAppStore((s) => s.isAddingObservation);
  const setNewObservationCoords = useAppStore((s) => s.setNewObservationCoords);
  const openSidebar = useAppStore((s) => s.openSidebar);
  const isAdmin = useAppStore((s) => s.isAdmin);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();

  const filteredObservations = useMemo(
    () =>
      observations.filter((obs) => {
        const isPrivateLocal = obs.user_id === "local-user" && obs.visibility === "private";
        if (isPrivateLocal && !isAdmin) return false;
        if (!filters[obs.category]) return false;
        if (!isObservationInTimeRange(obs, timeRange)) return false;
        if (normalizedSearchQuery) {
          return (
            obs.species_name.toLowerCase().includes(normalizedSearchQuery) ||
            Boolean(obs.common_name?.toLowerCase().includes(normalizedSearchQuery)) ||
            obs.description.toLowerCase().includes(normalizedSearchQuery) ||
            Boolean(obs.location_name?.toLowerCase().includes(normalizedSearchQuery)) ||
            Boolean(obs.scientific_name?.toLowerCase().includes(normalizedSearchQuery)) ||
            Boolean(obs.family?.toLowerCase().includes(normalizedSearchQuery))
          );
        }
        return true;
      }),
    [filters, isAdmin, normalizedSearchQuery, observations, timeRange]
  );

  const observationGeoJSON = useMemo(
    () => observationsToGeoJSON(filteredObservations),
    [filteredObservations]
  );

  const observationZonesGeoJSON = useMemo(
    () => zonesToGeoJSON(buildObservationZones(filteredObservations)),
    [filteredObservations]
  );

  useEffect(() => {
    observationsRef.current = observations;
  }, [observations]);

  useEffect(() => {
    filteredObservationsRef.current = filteredObservations;
  }, [filteredObservations]);

  // Fly to target when set via geocoder
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom,
      duration: 2000,
      essential: true,
    });
    setFlyTo(null); // Reset after use
  }, [flyToTarget, setFlyTo]);

  const findObservationById = useCallback(
    (id: string) =>
      filteredObservationsRef.current.find((o) => o.id === id) ??
      observationsRef.current.find((o) => o.id === id) ??
      null,
    []
  );

  // Init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (!MAPBOX_TOKEN) {
      console.warn("Mapbox token manquant — mode démo visuel uniquement.");
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_TOKEN
        ? MAP_STYLE
        : {
            version: 8,
            sources: {
              "osm-tiles": {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "&copy; OpenStreetMap contributors",
              },
            },
            layers: [
              {
                id: "osm-tiles",
                type: "raster",
                source: "osm-tiles",
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
      antialias: true,
      projection: { name: "globe" },
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right"
    );

    map.on("load", () => {
      const currentObservations = filteredObservationsRef.current;
      ensureObservationEmojiImages(map, currentObservations);

      // 3D terrain
      if (MAPBOX_TOKEN) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });

        map.addLayer({
          id: "sky",
          type: "sky",
          paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0.0, 0.0],
            "sky-atmosphere-sun-intensity": 15,
          },
        });
      }

      // ── Recherche zones/polygones: same taxon, public coords, max 5km ──
      map.addSource("observation-zones", {
        type: "geojson",
        data: zonesToGeoJSON(buildObservationZones(currentObservations)),
      });

      // Fill layer for polygons
      map.addLayer({
        id: "observation-zones-fill",
        type: "fill",
        source: "observation-zones",
        filter: ["==", ["get", "type"], "polygon"],
        paint: {
          "fill-color": [
            "match",
            ["get", "category"],
            "cristal", CATEGORY_COLORS.cristal,
            "faune", CATEGORY_COLORS.faune,
            "flore", CATEGORY_COLORS.flore,
            "#34d399",
          ],
          "fill-opacity": 0.18,
        },
      });

      // Outline for polygons
      map.addLayer({
        id: "observation-zones-outline",
        type: "line",
        source: "observation-zones",
        filter: ["==", ["get", "type"], "polygon"],
        paint: {
          "line-color": [
            "match",
            ["get", "category"],
            "cristal", CATEGORY_COLORS.cristal,
            "faune", CATEGORY_COLORS.faune,
            "flore", CATEGORY_COLORS.flore,
            "#34d399",
          ],
          "line-width": 1.5,
          "line-opacity": 0.4,
          "line-dasharray": [2, 2],
        },
      });

      // Label layer for zones
      map.addLayer({
        id: "observation-zones-labels",
        type: "symbol",
        source: "observation-zones",
        filter: ["==", ["get", "type"], "polygon"],
        layout: {
          "text-field": ["get", "display_label"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-offset": [0, 0.5],
          "text-anchor": "top",
          "symbol-placement": "point",
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(10, 15, 13, 0.85)",
          "text-halo-width": 2,
          "text-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9, 0,
            11, 1
          ],
        },
      });

      map.addLayer({
        id: "observation-links",
        type: "line",
        source: "observation-zones",
        filter: ["==", ["get", "type"], "link"],
        paint: {
          "line-color": [
            "match",
            ["get", "category"],
            "cristal", CATEGORY_COLORS.cristal,
            "faune", CATEGORY_COLORS.faune,
            "flore", CATEGORY_COLORS.flore,
            "#34d399",
          ],
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            1,
            10,
            2.5,
            14,
            4,
          ],
          "line-opacity": [
            "interpolate",
            ["linear"],
            ["get", "distance_meters"],
            0,
            0.72,
            5000,
            0.15,
          ],
          "line-blur": 0.35,
        },
      });

      // ── GeoJSON + Clustering Source ──
      map.addSource("observations", {
        type: "geojson",
        data: observationsToGeoJSON(currentObservations),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 60,
        clusterProperties: {
          cristal_count: ["+", ["case", ["==", ["get", "category"], "cristal"], 1, 0]],
          faune_count: ["+", ["case", ["==", ["get", "category"], "faune"], 1, 0]],
          flore_count: ["+", ["case", ["==", ["get", "category"], "flore"], 1, 0]],
        },
      });

      // ── Cluster circles ──
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "observations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#34d399", // < 10
            10,
            "#fbbf24", // 10-30
            30,
            "#fb7185", // > 30
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20, // < 10
            10,
            28, // 10-30
            30,
            36, // > 30
          ],
          "circle-opacity": 0.85,
          "circle-stroke-width": 3,
          "circle-stroke-color": "rgba(10, 15, 13, 0.5)",
        },
      });

      // Cluster count label
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "observations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#0a0f0d",
        },
      });

      map.addLayer({
        id: "unclustered-observation-emoji",
        type: "symbol",
        source: "observations",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["get", "emoji_key"],
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            0.42,
            10,
            0.56,
            14,
            0.74,
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      sourceReady.current = true;

      // ── Interactions ──
      // Click cluster → zoom in
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("observations") as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom: zoom ?? 10, duration: 600 });
        });
      });

      map.on("click", "observation-links", (e) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const props = feat.properties!;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 12, closeButton: true, maxWidth: "240px" })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-family: var(--font-sans); line-height: 1.5;">
              <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">Zone d'activité</div>
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${escapeHtml(props.emoji)} ${escapeHtml(props.label)}</div>
              <div style="font-size: 12px; opacity: 0.82;">${props.type === "link" ? `${escapeHtml(props.distance_meters)} m` : "Zone délimitée"} · ${escapeHtml(props.source_label)}</div>
            </div>`
          )
          .addTo(map);
      });

      map.on("click", "observation-zones-fill", (e) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const props = feat.properties!;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 12, closeButton: true, maxWidth: "240px" })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-family: var(--font-sans); line-height: 1.5;">
              <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">Zone d'activité</div>
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${escapeHtml(props.emoji)} ${escapeHtml(props.label)}</div>
              <div style="font-size: 12px; opacity: 0.82;">Secteur d'observations groupées · ${escapeHtml(props.source_label)}</div>
            </div>`
          )
          .addTo(map);
      });

      // Click point → show popup + sidebar detail
      const pointLayers = ["unclustered-observation-emoji"];
      map.on("click", "unclustered-observation-emoji", (e) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const coords = (feat.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const props = feat.properties!;
        const observation = findObservationById(String(props.custom_id));
        if (!observation) return;

        // Show popup
        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 16, closeButton: true, maxWidth: "240px" })
          .setLngLat(coords)
          .setHTML(
            `<div style="font-family: var(--font-sans); line-height: 1.5;">
              <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">${escapeHtml(props.emoji)} ${props.category === "cristal" ? "Cristaux" : props.category === "faune" ? "Faune" : "Flore"}</div>
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">${escapeHtml(props.emoji)} ${escapeHtml(props.species_name)}</div>
              ${props.scientific_name && props.scientific_name !== props.species_name ? `<div style="font-size: 11px; opacity: 0.68; font-style: italic; margin-bottom: 4px;">${escapeHtml(props.scientific_name)}</div>` : ""}
              <div style="font-size: 11px; opacity: 0.75; margin-bottom: 6px;">Observé le ${escapeHtml(formatPopupDate(props.observed_at as string))}${props.source_name ? ` · ${escapeHtml(props.source_name)}` : ""}</div>
              ${props.family || props.location_name ? `<div style="font-size: 12px; opacity: 0.8;">${props.family ? `Famille : ${escapeHtml(props.family)}` : ""}${props.family && props.location_name ? " · " : ""}${props.location_name ? `Localité : ${escapeHtml(props.location_name)}` : ""}</div>` : ""}
            </div>`
          )
          .addTo(map);

        openSidebar();
        selectObservation(observation);
      });

      // Cursor pointer on interactive layers
      const interactiveLayers = ["observation-links", "observation-zones-fill", "clusters", ...pointLayers];
      interactiveLayers.forEach((layer) => {
        map.on("mouseenter", layer, () => {
          const canvas = map.getCanvas();
          if (canvas) canvas.style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          const canvas = map.getCanvas();
          if (canvas) canvas.style.cursor = "";
        });
      });
    });

    mapRef.current = map;

    return () => {
      if (mapDataUpdateTimer.current !== null) {
        window.clearTimeout(mapDataUpdateTimer.current);
        mapDataUpdateTimer.current = null;
      }
      map.remove();
      mapRef.current = null;
      sourceReady.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data when observations/filters change
  useEffect(() => {
    if (!mapRef.current || !sourceReady.current) return;
    if (mapDataUpdateTimer.current !== null) {
      window.clearTimeout(mapDataUpdateTimer.current);
    }

    mapDataUpdateTimer.current = window.setTimeout(() => {
      const map = mapRef.current;
      if (!map || !sourceReady.current) return;

      ensureObservationEmojiImages(map, filteredObservations);
      const obsSource = map.getSource("observations") as mapboxgl.GeoJSONSource | undefined;
      const zoneSource = map.getSource("observation-zones") as mapboxgl.GeoJSONSource | undefined;
      if (obsSource) obsSource.setData(observationGeoJSON);
      if (zoneSource) zoneSource.setData(observationZonesGeoJSON);
    }, 80);

    return () => {
      if (mapDataUpdateTimer.current !== null) {
        window.clearTimeout(mapDataUpdateTimer.current);
        mapDataUpdateTimer.current = null;
      }
    };
  }, [filteredObservations, observationGeoJSON, observationZonesGeoJSON]);

  const selectedObservation = useAppStore((s) => s.selectedObservation);

  // Fly to selected observation
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedObservation || !sourceReady.current) return;

    map.flyTo({
      center: [selectedObservation.longitude_blurred, selectedObservation.latitude_blurred],
      zoom: 14,
      pitch: 55,
      duration: 4500,
      essential: true,
    });
  }, [selectedObservation]);

  // Fly to locations selected from the header (search box, etc).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;

    // If an observation is selected, we let the selectedObservation effect handle the movement
    if (selectedObservation) return;

    map.flyTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
      duration: 1200, // Slightly slower than before but faster than detail
      essential: true,
    });
  }, [viewState, selectedObservation]);

  // Map click → set coords for new observation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: mapboxgl.MapMouseEvent) => {
      if (!isAddingObservation) return;
      setNewObservationCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      openSidebar();
    };

    map.on("click", handler);
    const canvas = map.getCanvas();
    if (canvas) canvas.style.cursor = isAddingObservation ? "crosshair" : "";

    return () => {
      map.off("click", handler);
      const canvas = map.getCanvas();
      if (canvas) canvas.style.cursor = "";
    };
  }, [isAddingObservation, setNewObservationCoords, openSidebar]);

  return (
    <div className={styles.mapWrapper}>
      <div ref={mapContainer} className={styles.mapContainer} />
      <div className={styles.gradientOverlay} />
      {isAddingObservation && (
        <div className={styles.addOverlay}>
          <div className={styles.addOverlayContent}>
            <span className={styles.addOverlayIcon}>📍</span>
            <span>Cliquez sur la carte pour placer votre observation</span>
          </div>
        </div>
      )}
    </div>
  );
}
