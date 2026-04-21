"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import styles from "./LocationHeader.module.css";

const LOCATION_PRESETS = [
  { id: "france", label: "France", longitude: 2.8, latitude: 46.5, zoom: 5.4, pitch: 42, bearing: -8 },
  { id: "world", label: "Monde", longitude: 12, latitude: 24, zoom: 1.55, pitch: 0, bearing: 0 },
  { id: "alps", label: "Alpes", longitude: 6.55, latitude: 45.25, zoom: 7.1, pitch: 55, bearing: -12 },
  { id: "pyrenees", label: "Pyrénées", longitude: 0.7, latitude: 42.9, zoom: 7, pitch: 50, bearing: -8 },
  { id: "massif-central", label: "Massif central", longitude: 2.65, latitude: 45.2, zoom: 7, pitch: 45, bearing: -10 },
  { id: "vosges", label: "Vosges", longitude: 7.03, latitude: 48.02, zoom: 8.3, pitch: 45, bearing: -8 },
  { id: "corse", label: "Corse", longitude: 9.06, latitude: 42.08, zoom: 7.4, pitch: 50, bearing: -10 },
  { id: "himalaya", label: "Himalaya", longitude: 86.92, latitude: 27.98, zoom: 5.4, pitch: 55, bearing: -18 },
  { id: "andes", label: "Andes", longitude: -70.2, latitude: -32.8, zoom: 4.8, pitch: 52, bearing: 12 },
  { id: "rockies", label: "Rocheuses", longitude: -111.6, latitude: 44.8, zoom: 5.2, pitch: 52, bearing: 10 },
  { id: "japan", label: "Japon", longitude: 138.25, latitude: 36.2, zoom: 5.2, pitch: 45, bearing: -8 },
];

export default function LocationHeader() {
  const [selectedId, setSelectedId] = useState("france");
  const setViewState = useAppStore((s) => s.setViewState);
  const startAddObservation = useAppStore((s) => s.startAddObservation);
  const isAddingObservation = useAppStore((s) => s.isAddingObservation);

  if (isAddingObservation) return null;

  const goToLocation = (id: string) => {
    setSelectedId(id);
    const preset = LOCATION_PRESETS.find((item) => item.id === id);
    if (!preset) return;

    setViewState({
      longitude: preset.longitude,
      latitude: preset.latitude,
      zoom: preset.zoom,
      pitch: preset.pitch,
      bearing: preset.bearing,
    });
  };

  return (
    <header className={styles.locationHeader} aria-label="Navigation par localisation">
      <div className={styles.selectWrap}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 18C12.8 14.8 15 11.7 15 8.4C15 5.5 12.8 3.2 10 3.2C7.2 3.2 5 5.5 5 8.4C5 11.7 7.2 14.8 10 18Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="8.4" r="1.9" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        <select
          value={selectedId}
          onChange={(event) => goToLocation(event.target.value)}
          className={styles.locationSelect}
          aria-label="Choisir une localisation"
        >
          {LOCATION_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>
      <button type="button" className={styles.placeBtn} onClick={startAddObservation}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Placer un point
      </button>
    </header>
  );
}
