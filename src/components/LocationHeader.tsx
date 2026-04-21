"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./LocationHeader.module.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
  context?: { id: string; text: string }[];
}

interface Props {
  onFlyTo: (lng: number, lat: number, zoom?: number) => void;
  onStartAddObservation: () => void;
  isAddingObservation: boolean;
}

export default function LocationHeader({ onFlyTo, onStartAddObservation, isAddingObservation }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&language=fr&limit=5`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setResults(data.features ?? []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  const handleFly = (feature: GeocodingFeature) => {
    const [lng, lat] = feature.center;
    // Guess a sensible zoom based on place type
    const type = feature.place_type[0];
    const zoom =
      type === "country"      ? 5 :
      type === "region"       ? 7.5 :
      type === "district"     ? 9.5 :
      type === "place"        ? 12.5 :   // ville
      type === "locality"     ? 13.5 :   // village / quartier
      type === "neighborhood" ? 14 :
      type === "poi"          ? 15 : 11;

    onFlyTo(lng, lat, zoom);
    setIsOpen(false);
    setQuery(feature.place_name.split(",")[0]); // Keep short label
    inputRef.current?.blur();
  };

  if (isAddingObservation) return null;

  return (
    <header className={styles.locationHeader} aria-label="Recherche de lieu">
      <div className={styles.searchWrap}>
        <div className={styles.inputWrap}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            id="geocoder-input"
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher un lieu…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            autoComplete="off"
            aria-label="Recherche de lieu"
          />
          {isLoading && <span className={styles.loader} aria-hidden="true" />}
          {query && !isLoading && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => { setQuery(""); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {isOpen && results.length > 0 && (
          <ul className={styles.resultList} role="listbox" aria-label="Résultats de recherche">
            {results.map((feature) => (
              <li key={feature.id} className={styles.resultItem} role="option">
                <span className={styles.resultLabel}>
                  <strong>{feature.place_name.split(",")[0]}</strong>
                  <span className={styles.resultSub}>
                    {feature.place_name.split(",").slice(1).join(",").trim()}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles.flyBtn}
                  onClick={() => handleFly(feature)}
                  aria-label={`Aller à ${feature.place_name}`}
                >
                  Aller →
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className={styles.placeBtn} onClick={onStartAddObservation}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Placer un point
      </button>
    </header>
  );
}
