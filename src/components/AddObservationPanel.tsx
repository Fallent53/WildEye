"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { Category } from "@/lib/types";
import {
  findBestAnimalSuggestion,
  findAnimalSpecies,
  getAnimalSuggestions,
  standardizeAnimalSpecies,
} from "@/lib/species-catalog";
import { validateContent } from "@/lib/moderation";
import { searchSpecies, RemoteTaxon } from "@/lib/nature-api";
import { getEmojiFromHierarchy } from "@/lib/taxon-icons";
import styles from "./AddObservationPanel.module.css";

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function inputDateToIso(value: string) {
  return new Date(`${value}T12:00:00.000Z`).toISOString();
}

export default function AddObservationPanel() {
  const newObservationCoords = useAppStore((s) => s.newObservationCoords);
  const addObservation = useAppStore((s) => s.addObservation);
  const addSpeciesProposal = useAppStore((s) => s.addSpeciesProposal);
  const cancelAddObservation = useAppStore((s) => s.cancelAddObservation);
  const userProfile = useAppStore((s) => s.userProfile);
  const openAccountPanel = useAppStore((s) => s.openAccountPanel);

  const [category, setCategory] = useState<Category>("faune");
  const [speciesName, setSpeciesName] = useState("");
  const [observedDate, setObservedDate] = useState(getTodayInputValue);
  const [description, setDescription] = useState("");
  const [crystalSystem, setCrystalSystem] = useState("");
  const [luster, setLuster] = useState("");
  const [hardness, setHardness] = useState("");
  const [associatedMinerals, setAssociatedMinerals] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [proposalSent, setProposalSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search states
  const [remoteSuggestions, setRemoteSuggestions] = useState<RemoteTaxon[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const selectedRemoteTaxon = useRef<RemoteTaxon | null>(null);

  const animalSuggestions = category === "faune" ? getAnimalSuggestions(speciesName) : [];
  const trimmedSpeciesName = speciesName.trim();
  const exactAnimalMatch =
    category === "faune"
      ? findAnimalSpecies(trimmedSpeciesName)
      : undefined;
  const canProposeSpecies =
    trimmedSpeciesName.length >= 2 &&
    (category !== "faune" || (!exactAnimalMatch && animalSuggestions.length === 0 && remoteSuggestions.length === 0));

  // Debounced Remote Search
  useEffect(() => {
    if (category !== "faune" || trimmedSpeciesName.length < 3) {
      setRemoteSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchSpecies(trimmedSpeciesName);
      setRemoteSuggestions(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [category, trimmedSpeciesName]);

  const selectAnimalSuggestion = (vernacularName: string) => {
    setSpeciesName(vernacularName);
    selectedRemoteTaxon.current = null;
  };

  const selectRemoteSuggestion = (taxon: RemoteTaxon) => {
    setSpeciesName(taxon.preferred_common_name || taxon.name);
    selectedRemoteTaxon.current = taxon;
    setRemoteSuggestions([]);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const handleSpeciesProposal = () => {
    if (!canProposeSpecies) return;

    const vName = validateContent(trimmedSpeciesName);
    const vDesc = validateContent(description);

    if (!vName.isValid || !vDesc.isValid) {
      alert(`Contenu inapproprié détecté (${[...vName.foundWords, ...vDesc.foundWords].join(", ")}). Merci de rester respectueux.`);
      return;
    }

    const nearbyExisting = category === "faune" ? findBestAnimalSuggestion(trimmedSpeciesName) : undefined;

    addSpeciesProposal({
      proposed_name: trimmedSpeciesName,
      category,
      note: description.trim() || undefined,
      nearby_existing_name: nearbyExisting?.vernacularName,
    });
    setProposalSent(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciesName.trim() || !observedDate || !newObservationCoords) return;

    const vName = validateContent(speciesName);
    const vDesc = validateContent(description);

    if (!vName.isValid || !vDesc.isValid) {
      alert(`Contenu inapproprié détecté (${[...vName.foundWords, ...vDesc.foundWords].join(", ")}). Merci de rester respectueux.`);
      return;
    }

    // Determine details from remote taxon if selected, otherwise try local
    const remote = selectedRemoteTaxon.current;
    
    const animalMatch =
      category === "faune"
        ? (remote ? {
            vernacularName: remote.preferred_common_name || remote.name,
            scientificName: remote.name,
            group: remote.rank,
            family: remote.ancestors?.find(a => a.rank === 'family')?.name,
            emoji: getEmojiFromHierarchy(remote.name, remote.ancestors, remote.preferred_common_name),
            photoUrl: remote.default_photo?.medium_url
          } : standardizeAnimalSpecies({
            fallbackName:
              findBestAnimalSuggestion(speciesName)?.vernacularName ?? speciesName.trim(),
          }))
        : undefined;

    const normalizedName = animalMatch?.vernacularName ?? speciesName.trim();

    setIsSubmitting(true);
    setTimeout(() => {
      addObservation({
        observed_at: inputDateToIso(observedDate),
        category,
        species_name: normalizedName,
        common_name: category === "faune" ? normalizedName : undefined,
        scientific_name:
          category === "faune" ? animalMatch?.scientificName : undefined,
        animal_group: category === "faune" ? animalMatch?.group : undefined,
        animal_emoji: category === "faune" ? animalMatch?.emoji : undefined,
        habitat_hint: category === "faune" ? (animalMatch as any).habitatHint : undefined,
        activity_hint: category === "faune" ? (animalMatch as any).activityHint : undefined,
        sensitivity_label: category === "faune" ? (animalMatch as any).sensitivityLabel : undefined,
        family: category === "faune" ? animalMatch?.family : undefined,
        quality_label: remote ? "Donnée Mondiale (iNaturalist)" : "Contribution locale",
        verification_label: remote 
          ? "Espèce vérifiée via le catalogue mondial iNaturalist." 
          : "Observation partagée par un membre, non validée par une source externe.",
        description: description.trim() || `Observation de ${normalizedName}.`,
        longitude: newObservationCoords.lng,
        latitude: newObservationCoords.lat,
        // Use remote photo if user didn't upload one
        photo_url: photoUrl || (animalMatch as any).photoUrl || null,
        crystal_system: category === "cristal" ? crystalSystem : undefined,
        luster: category === "cristal" ? luster : undefined,
        hardness: category === "cristal" ? hardness : undefined,
        associated_minerals: category === "cristal" ? associatedMinerals : undefined,
      });
      // Reset form
      setSpeciesName("");
      setDescription("");
      setCrystalSystem("");
      setLuster("");
      setHardness("");
      setAssociatedMinerals("");
      setPhotoUrl(null);
      setObservedDate(getTodayInputValue());
      setCategory("faune");
      setProposalSent(false);
      setIsSubmitting(false);
      selectedRemoteTaxon.current = null;
    }, 400);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={cancelAddObservation}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Annuler
        </button>
        <h2 className={styles.title}>Nouvelle observation</h2>
      </div>

      {!newObservationCoords ? (
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>📍</div>
          <p className={styles.placeholderText}>
            Cliquez sur la carte pour placer votre observation
          </p>
          <p className={styles.placeholderHint}>
            La position sera automatiquement floutée (±300-500m) pour protéger le site.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Coordinates feedback */}
          <div className={styles.coordsBanner}>
            <span className={styles.coordsIcon}>✓</span>
            <div>
              <div className={styles.coordsLabel}>Position sélectionnée</div>
              <div className={styles.coordsValue}>
                {newObservationCoords.lat.toFixed(4)}°N, {newObservationCoords.lng.toFixed(4)}°E
              </div>
            </div>
          </div>

          {/* Category selector */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Catégorie</legend>
            <div className={styles.categoryRow}>
              {(["cristal", "faune", "flore"] as Category[]).map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.categoryBtn} ${category === cat ? styles.categoryActive : ""}`}
                    onClick={() => {
                        setCategory(cat);
                        setRemoteSuggestions([]);
                    }}
                    style={
                      {
                        "--cat-color": cfg.color,
                        "--cat-bg": cfg.bgColor,
                      } as React.CSSProperties
                    }
                  >
                    {cfg.label.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Species name */}
          <div className={styles.field}>
            <label htmlFor="species-name" className={styles.label}>
              Nom de l&apos;espèce / minéral
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="species-name"
                type="text"
                className={styles.input}
                placeholder={
                  category === "cristal"
                    ? "ex: Quartz fumé, Fluorine..."
                    : category === "faune"
                      ? "Cherchez n'importe quelle espèce..."
                      : "ex: Edelweiss, Gentiane..."
                }
                value={speciesName}
                onChange={(e) => {
                  setSpeciesName(e.target.value);
                  setProposalSent(false);
                  if (selectedRemoteTaxon.current && e.target.value !== (selectedRemoteTaxon.current.preferred_common_name || selectedRemoteTaxon.current.name)) {
                      selectedRemoteTaxon.current = null;
                  }
                }}
                autoFocus
                required
              />
              {(animalSuggestions.length > 0 || remoteSuggestions.length > 0 || isSearching) && (
                <div className={styles.suggestionList}>
                  {animalSuggestions.length > 0 && (
                    <>
                      <div className={styles.suggestionSectionTitle}>Catalogue Local</div>
                      {animalSuggestions.map((species) => (
                        <button
                          key={species.scientificName}
                          type="button"
                          className={styles.suggestionItem}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectAnimalSuggestion(species.vernacularName)}
                        >
                          <div className={styles.suggestionIcon}>{species.emoji}</div>
                          <div className={styles.suggestionContent}>
                            <span className={styles.suggestionMain}>{species.vernacularName}</span>
                            <span className={styles.suggestionSub}>{species.scientificName}</span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {remoteSuggestions.length > 0 && (
                    <>
                      <div className={styles.suggestionSectionTitle}>Recherche Mondiale</div>
                      {remoteSuggestions.map((taxon) => (
                        <button
                          key={taxon.id}
                          type="button"
                          className={styles.suggestionItem}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectRemoteSuggestion(taxon)}
                        >
                          {taxon.default_photo ? (
                            <img src={taxon.default_photo.square_url} className={styles.suggestionThumb} alt="" />
                          ) : (
                            <div className={styles.suggestionIcon}>🍃</div>
                          )}
                          <div className={styles.suggestionContent}>
                            <span className={styles.suggestionMain}>{taxon.preferred_common_name || taxon.name}</span>
                            <span className={styles.suggestionSub}>{taxon.name}</span>
                          </div>
                          <span className={styles.suggestionMeta}>
                            {getEmojiFromHierarchy(taxon.name, taxon.ancestors, taxon.preferred_common_name)}
                          </span>
                        </button>
                      ))}
                    </>
                  )}

                  {isSearching && (
                    <div className={styles.loadingSpinner}>
                      <div className={styles.spinnerSmall} />
                      <span>Chargement...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {canProposeSpecies && (
              <div className={styles.speciesProposalBox}>
                <span>Introuvable dans le catalogue ?</span>
                <button
                  type="button"
                  className={styles.proposalBtn}
                  onClick={handleSpeciesProposal}
                  disabled={proposalSent}
                >
                  {proposalSent ? "Proposition envoyée" : "Ajouter une espèce"}
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label htmlFor="observed-date" className={styles.label}>
              Date d&apos;observation
            </label>
            <input
              id="observed-date"
              type="date"
              className={styles.input}
              value={observedDate}
              max={getTodayInputValue()}
              onChange={(e) => setObservedDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label htmlFor="obs-description" className={styles.label}>
              Description <span className={styles.optional}>(optionnel)</span>
            </label>
            <textarea
              id="obs-description"
              className={styles.textarea}
              placeholder="Décrivez votre observation : conditions, nombre, comportement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {category === "cristal" && (
            <div className={styles.mineralFields}>
              <div className={styles.field}>
                <label htmlFor="crystal-system" className={styles.label}>
                  Système cristallin <span className={styles.optional}>(ex: Cubique, Hexagonal)</span>
                </label>
                <input
                  id="crystal-system"
                  type="text"
                  className={styles.input}
                  value={crystalSystem}
                  onChange={(e) => setCrystalSystem(e.target.value)}
                  placeholder="Système cristallin"
                />
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="luster" className={styles.label}>Éclat</label>
                  <input
                    id="luster"
                    type="text"
                    className={styles.input}
                    value={luster}
                    onChange={(e) => setLuster(e.target.value)}
                    placeholder="ex: Vitreux"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="hardness" className={styles.label}>Dureté</label>
                  <input
                    id="hardness"
                    type="text"
                    className={styles.input}
                    value={hardness}
                    onChange={(e) => setHardness(e.target.value)}
                    placeholder="ex: 7.0"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="associated-minerals" className={styles.label}>Minéraux associés</label>
                <input
                  id="associated-minerals"
                  type="text"
                  className={styles.input}
                  value={associatedMinerals}
                  onChange={(e) => setAssociatedMinerals(e.target.value)}
                  placeholder="ex: Quartz, Calcite"
                />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="observation-photo" className={styles.label}>
              Photo <span className={styles.optional}>(optionnel)</span>
            </label>
            {photoUrl ? (
              <div className={styles.photoPreviewWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.photoPreview} src={photoUrl} alt="Aperçu de l'observation" />
                <button
                  type="button"
                  className={styles.removePhotoBtn}
                  onClick={() => setPhotoUrl(null)}
                >
                  Retirer
                </button>
              </div>
            ) : (
              <label htmlFor="observation-photo" className={styles.photoDrop}>
                <span className={styles.photoDropIcon}>+</span>
                <span>Ajouter une photo</span>
              </label>
            )}
            <input
              id="observation-photo"
              type="file"
              className={styles.fileInput}
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Privacy notice */}
          <div className={styles.privacyNotice}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Les coordonnées exactes restent privées. Seule une position approximative sera partagée.</span>
          </div>

          {userProfile.name === "Explorateur Anonyme" && (
            <div className={styles.nameNotice}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
              </svg>
              <span>
                Vous apparaissez comme <strong>{userProfile.name}</strong>. 
                <button type="button" className={styles.nameNoticeBtn} onClick={openAccountPanel}>
                  Changer mon pseudo
                </button>
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!speciesName.trim() || !observedDate || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner} />
                Publication...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Publier l&apos;observation
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
