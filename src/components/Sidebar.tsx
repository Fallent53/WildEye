/* (c) 2026 - Loris Dc - WildEye Project */
"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { CATEGORY_CONFIG, getObservationEmoji } from "@/lib/constants";
import { isObservationInTimeRange, TIME_RANGE_OPTIONS } from "@/lib/time-range";
import { Category, Observation, SortOrder } from "@/lib/types";
import styles from "./Sidebar.module.css";

const AddObservationPanel = dynamic(() => import("./AddObservationPanel"), {
  ssr: false,
  loading: () => <div className={styles.panelLoading} />,
});

function CategoryBadge({ category, emoji }: { category: Category; emoji?: string }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span
      className={styles.badge}
      style={
        {
          "--badge-color": cfg.color,
          "--badge-bg": cfg.bgColor,
        } as React.CSSProperties
      }
    >
      {emoji ? `${emoji} ` : ""}{cfg.label}
    </span>
  );
}

function ObservationCard({ obs }: { obs: Observation }) {
  const selectObservation = useAppStore((s) => s.selectObservation);
  const cfg = CATEGORY_CONFIG[obs.category];
  const emoji = getObservationEmoji(obs);
  const displayName = obs.common_name ?? obs.species_name;

  const timeAgo = getTimeAgo(obs.observed_at);

  return (
    <button
      className={styles.card}
      onClick={() => selectObservation(obs)}
      style={
        { "--card-accent": cfg.color } as React.CSSProperties
      }
    >
      <div className={styles.cardHeader}>
        <CategoryBadge category={obs.category} emoji={emoji} />
        <span className={styles.cardTime}>{timeAgo}</span>
      </div>
      <div className={styles.cardMain}>
        {obs.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.cardPhoto} src={obs.photo_url} alt="" loading="lazy" />
        )}
        <div className={styles.cardText}>
          <h3 className={styles.cardTitle}>
            <span aria-hidden="true">{emoji}</span> {displayName}
          </h3>
          <p className={styles.cardScientific}>{formatScientificLine(obs)}</p>
          {formatSimpleInfo(obs) && (
            <p className={styles.cardSimpleInfo}>{formatSimpleInfo(obs)}</p>
          )}
        </div>
      </div>
    </button>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} an(s)`;
}

function getObservationYear(dateStr: string) {
  return new Date(dateStr).getFullYear();
}

function formatScientificLine(obs: Observation) {
  const scientificName = obs.scientific_name ?? obs.species_name;
  return `${scientificName} · Observé en ${getObservationYear(obs.observed_at)}`;
}

function formatLongDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function compactLocation(value?: string) {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 2) return value;
  return parts.slice(0, 2).join(", ");
}

function formatSimpleInfo(obs: Observation) {
  const details = [
    obs.family ? `Famille : ${obs.family}` : undefined,
    obs.location_name ? `Localité : ${compactLocation(obs.location_name)}` : undefined,
  ].filter(Boolean);

  return details.join(" · ");
}

function sortObservations(observations: Observation[], order: SortOrder) {
  return [...observations].sort((a, b) => {
    const diff =
      new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime();
    return order === "newest" ? diff : -diff;
  });
}

function isOwnObservation(obs: Observation, userProfile: { id: string; owner_ref?: string }) {
  return (
    (Boolean(obs.user_id) && obs.user_id === userProfile.id) ||
    (Boolean(obs.owner_ref) && obs.owner_ref === userProfile.owner_ref)
  );
}

function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3.25" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4 17C4.7 13.9 6.75 12.4 10 12.4C13.25 12.4 15.3 13.9 16 17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5L16 5V9.4C16 13.1 13.6 16.1 10 17.5C6.4 16.1 4 13.1 4 9.4V5L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 2H14V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.66663 9.33333L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2.66663 2H5.33329C6.04054 2 6.71881 2.28095 7.21891 2.78105C7.71901 3.28115 7.99996 3.95942 7.99996 4.66667V14C7.99996 13.2928 7.71901 12.6145 7.21891 12.1144C6.71881 11.6143 6.04054 11.3333 5.33329 11.3333H2.66663V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3334 2H10.6667C9.95946 2 9.28118 2.28095 8.78108 2.78105C8.28098 3.28115 8.00003 3.95942 8.00003 4.66667V14C8.00003 13.2928 8.28098 12.6145 8.78108 12.1144C9.28118 11.6143 9.95946 11.3333 10.6667 11.3333H13.3334V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Sidebar() {
  const observations = useAppStore((s) => s.observations);
  const filters = useAppStore((s) => s.filters);
  const toggleFilter = useAppStore((s) => s.toggleFilter);
  const timeRange = useAppStore((s) => s.timeRange);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const sortOrder = useAppStore((s) => s.sortOrder);
  const setSortOrder = useAppStore((s) => s.setSortOrder);
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const selectedObservation = useAppStore((s) => s.selectedObservation);
  const selectObservation = useAppStore((s) => s.selectObservation);
  const activePanel = useAppStore((s) => s.activePanel);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const openAccountPanel = useAppStore((s) => s.openAccountPanel);
  const deleteObservation = useAppStore((s) => s.deleteObservation);
  const isAdmin = useAppStore((s) => s.isAdmin);
  const setObservationVisibility = useAppStore((s) => s.setObservationVisibility);
  const setObservationAnonymous = useAppStore((s) => s.setObservationAnonymous);
  const setObservationPrivacyLevel = useAppStore((s) => s.setObservationPrivacyLevel);
  const userProfile = useAppStore((s) => s.userProfile);
  const setUserProfile = useAppStore((s) => s.setUserProfile);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();

  // Swipe gesture for mobile bottom sheet
  const touchStartY = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta < -30 && !isSidebarOpen) toggleSidebar(); // swipe up → open
    if (delta > 30 && isSidebarOpen) toggleSidebar();   // swipe down → close
  };

  const publicObservations = useMemo(
    () => observations.filter((obs) => obs.visibility !== "private" || isOwnObservation(obs, userProfile)),
    [observations, userProfile]
  );

  const myObservations = useMemo(
    () => sortObservations(observations.filter((obs) => isOwnObservation(obs, userProfile)), sortOrder),
    [observations, sortOrder, userProfile]
  );

  const filteredObs = useMemo(
    () =>
      publicObservations.filter((obs) => {
        if (!filters[obs.category]) return false;
        if (!isObservationInTimeRange(obs, timeRange)) return false;
        if (normalizedSearchQuery) {
          return (
            obs.species_name.toLowerCase().includes(normalizedSearchQuery) ||
            Boolean(obs.common_name?.toLowerCase().includes(normalizedSearchQuery)) ||
            obs.description.toLowerCase().includes(normalizedSearchQuery) ||
            Boolean(obs.location_name?.toLowerCase().includes(normalizedSearchQuery)) ||
            Boolean(obs.scientific_name?.toLowerCase().includes(normalizedSearchQuery)) ||
            Boolean(obs.animal_group?.toLowerCase().includes(normalizedSearchQuery)) ||
            Boolean(obs.family?.toLowerCase().includes(normalizedSearchQuery)) ||
            Boolean(obs.source_name?.toLowerCase().includes(normalizedSearchQuery)) ||
            Boolean(obs.habitat_hint?.toLowerCase().includes(normalizedSearchQuery))
          );
        }
        return true;
      }),
    [filters, normalizedSearchQuery, publicObservations, timeRange]
  );

  const sortedObs = useMemo(
    () => sortObservations(filteredObs, sortOrder),
    [filteredObs, sortOrder]
  );

  // ── Add Observation Panel ──
  if (activePanel === "add") {
    return (
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        <AddObservationPanel />
      </aside>
    );
  }

  if (activePanel === "account") {
    return (
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        <button className={styles.backBtn} onClick={() => setActivePanel("explore")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </button>
        <div className={styles.accountHeader}>
          <div className={styles.accountIcon}>
            <UserIcon />
          </div>
          <div>
            <h2 className={styles.accountTitle}>Mon Profil</h2>
            <p className={styles.accountSubtitle}>
              {myObservations.length} contribution{myObservations.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className={styles.profileSection}>
          <label htmlFor="user-pseudo" className={styles.profileLabel}>Votre pseudonyme (public)</label>
          <div className={styles.profileInputWrapper}>
            <input
              id="user-pseudo"
              type="text"
              className={styles.profileInput}
              value={userProfile.name}
              onChange={(e) => setUserProfile({ name: e.target.value })}
              placeholder="ex: Explorateur_73"
            />
          </div>
          <p className={styles.profileHint}>Ce nom sera affiché sur toutes vos observations publiques.</p>
        </div>

        <div className={styles.accountNotice}>
          <ShieldIcon />
          <span>Vous pouvez masquer, anonymiser ou rendre plus imprécises vos contributions sensibles.</span>
        </div>

        <div className={styles.listScroll}>
          {myObservations.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>+</span>
              <p>Aucune contribution locale</p>
              <p className={styles.emptyHint}>Ajoutez une observation pour la gérer ici.</p>
            </div>
          ) : (
            myObservations.map((obs) => <ObservationCard key={obs.id} obs={obs} />)
          )}
        </div>
      </aside>
    );
  }

  // ── Detail View ──
  if (selectedObservation) {
    const obs = selectedObservation;
    const cfg = CATEGORY_CONFIG[obs.category];
    const isOwn = isOwnObservation(obs, userProfile);
    const emoji = getObservationEmoji(obs);
    const displayName = obs.common_name ?? obs.species_name;
    const reliabilityText =
      typeof obs.reliability_score === "number"
        ? `${obs.reliability_label ?? "Fiable"} · ${obs.reliability_score}/100`
        : obs.quality_label;
    return (
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        <button className={styles.backBtn} onClick={() => selectObservation(null)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </button>
        <div className={styles.detailCard}>
          <div
            className={styles.detailHeader}
            style={{ "--accent": cfg.color } as React.CSSProperties}
          >
            <span className={styles.detailEmoji}>{emoji}</span>
            <div>
              <h2 className={styles.detailTitle}>{displayName}</h2>
              <p className={styles.detailScientific}>{formatScientificLine(obs)}</p>
              {reliabilityText && (
                <div className={styles.reliabilityPill}>
                  <ShieldIcon />
                  <span>{reliabilityText}</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.detailBody}>
            {obs.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.detailPhoto}
                src={obs.photo_url}
                alt={displayName}
                loading="lazy"
              />
            )}
            {obs.description && (
              <div className={styles.detailDescription}>
                <p>{obs.description}</p>
              </div>
            )}
            {obs.anomaly_flags && obs.anomaly_flags.length > 0 && (
              <div className={styles.anomalyBox}>
                <strong>Points a verifier</strong>
                {obs.anomaly_flags.map((flag) => (
                  <span key={flag}>{flag}</span>
                ))}
              </div>
            )}

            <div className={styles.infoGrid}>
              {obs.family && (
                <div className={styles.infoCard}>
                  <span>Famille</span>
                  <strong>{obs.family}</strong>
                </div>
              )}
              {obs.animal_group && (
                <div className={styles.infoCard}>
                  <span>Groupe</span>
                  <strong>{emoji} {obs.animal_group}</strong>
                </div>
              )}
              {obs.location_name && (
                <div className={styles.infoCard}>
                  <span>Localisation</span>
                  <strong>{compactLocation(obs.location_name)}</strong>
                </div>
              )}
              {obs.habitat_hint && (
                <div className={styles.infoCard}>
                  <span>Habitat</span>
                  <strong>{obs.habitat_hint}</strong>
                </div>
              )}
              {obs.activity_hint && (
                <div className={styles.infoCard}>
                  <span>Style de vie</span>
                  <strong>{obs.activity_hint}</strong>
                </div>
              )}
              {reliabilityText && (
                <div className={styles.infoCard}>
                  <span>Fiabilite</span>
                  <strong>{reliabilityText}</strong>
                </div>
              )}
              <div className={styles.infoCard}>
                <span>Observé le</span>
                <strong>{formatLongDate(obs.observed_at)}</strong>
              </div>
              {obs.source_name && (
                <div className={styles.infoCard}>
                  <span>Source</span>
                  <div className={styles.sourceBox}>
                    <strong>{obs.source_name}</strong>
                    {obs.source_url && (
                      <a href={obs.source_url} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                        <ExternalLinkIcon />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {obs.observer_name && (
                <div className={styles.infoCard}>
                  <span>Observateur</span>
                  <strong>{obs.observer_name}</strong>
                </div>
              )}
              {isOwn && (
                <>
                  <div className={styles.infoCard}>
                    <span>Visibilité</span>
                    <strong>{obs.visibility === "private" ? "Privée" : "Publique"}</strong>
                  </div>
                  <div className={styles.infoCard}>
                    <span>Identité</span>
                    <strong>{obs.is_anonymous ? "Anonyme" : "Compte"}</strong>
                  </div>
                </>
              )}
            </div>

            {obs.wiki_url && (
              <a href={obs.wiki_url} target="_blank" rel="noopener noreferrer" className={styles.wikiButton}>
                <BookIcon />
                En savoir plus sur Wikipédia
              </a>
            )}

            {isOwn && (
              <div className={styles.ownerControls}>
                <div className={styles.ownerHeader}>
                  <ShieldIcon />
                  <span>Votre contribution</span>
                </div>
                <div className={styles.controlGrid}>
                  <button
                    type="button"
                    className={obs.visibility === "private" ? styles.controlActive : ""}
                    onClick={() => setObservationVisibility(obs.id, obs.visibility === "private" ? "public" : "private")}
                  >
                    {obs.visibility === "private" ? "Rendre publique" : "Masquer"}
                  </button>
                  <button
                    type="button"
                    className={obs.privacy_level === "protected" ? styles.controlActive : ""}
                    onClick={() => setObservationPrivacyLevel(obs.id, obs.privacy_level === "protected" ? "standard" : "protected")}
                  >
                    {obs.privacy_level === "protected" ? "Précision standard" : "Flouter lieu"}
                  </button>
                  <button
                    type="button"
                    className={obs.is_anonymous ? styles.sortActive : ""}
                    onClick={() => setObservationAnonymous(obs.id, !obs.is_anonymous)}
                  >
                    {obs.is_anonymous ? "Se signer" : "Anonymiser"}
                  </button>
                  <button
                    type="button"
                    className={styles.dangerControl}
                    onClick={() => deleteObservation(obs.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}

            {isAdmin && !isOwn && (
              <div className={styles.adminActions}>
                <div className={styles.adminLabel}>
                  <ShieldIcon />
                  <span>Modération</span>
                </div>
                <div className={styles.adminBtns}>
                  <button
                    className={styles.adminDeleteBtn}
                    onClick={() => {
                      if (confirm("Supprimer définitivement cette entrée ?")) {
                        deleteObservation(obs.id);
                      }
                    }}
                  >
                    Supprimer (Admin)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // ── Explore View (default) ──
  return (
    <>
      <aside className={`${styles.sidebar} ${styles.exploreSidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        {/* Toggle / Drag handle */}
        <button
          className={styles.toggleBtn}
          onClick={toggleSidebar}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={isSidebarOpen ? "Fermer le panneau" : "Ouvrir le panneau"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            style={{ transform: isSidebarOpen ? "rotate(0)" : "rotate(180deg)" }}
          >
            <path
              d="M11 14L6 9L11 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>🏔️</div>
            <div>
              <h1 className={styles.title}>WildEye</h1>
              <p className={styles.subtitle}>L&apos;Observatoire du Sauvage</p>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher une espèce, un lieu…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-observations"
          />
          {searchQuery && (
            <button className={styles.searchClear} onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className={styles.timeFilterRow} aria-label="Filtrer par période">
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.timeFilterBtn} ${timeRange === option.value ? styles.timeFilterActive : ""}`}
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.filterRow}>
          {(["cristal", "faune", "flore"] as Category[]).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const active = filters[cat];
            return (
              <button
                key={cat}
                className={`${styles.filterBtn} ${active ? styles.filterActive : ""}`}
                onClick={() => toggleFilter(cat)}
                style={
                  {
                    "--filter-color": cfg.color,
                    "--filter-bg": cfg.bgColor,
                  } as React.CSSProperties
                }
                id={`filter-${cat}`}
              >
                {cfg.emoji} {cfg.label.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Observations List */}
        <div className={`${styles.listSection} ${styles.exploreListSection}`}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Observations récentes</h2>
            <div className={styles.listTools}>
              <div className={styles.sortSwitch} aria-label="Trier les observations">
                <button
                  type="button"
                  className={sortOrder === "newest" ? styles.sortActive : ""}
                  onClick={() => setSortOrder("newest")}
                >
                  + récentes
                </button>
                <button
                  type="button"
                  className={sortOrder === "oldest" ? styles.sortActive : ""}
                  onClick={() => setSortOrder("oldest")}
                >
                  - récentes
                </button>
              </div>
              <button
                type="button"
                className={styles.accountBtn}
                onClick={openAccountPanel}
                aria-label="Ouvrir mes observations"
                title="Mes observations"
              >
                <UserIcon />
              </button>
            </div>
          </div>
          <div className={styles.listScroll}>
            {filteredObs.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <p>Aucune observation trouvée</p>
                <p className={styles.emptyHint}>Essayez d&apos;ajuster vos filtres</p>
              </div>
            ) : (
              sortedObs.map((obs) => <ObservationCard key={obs.id} obs={obs} />)
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
