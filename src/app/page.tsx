/* (c) 2026 - Loris Dc - WildEye Project */
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import LocationHeader from "@/components/LocationHeader";
import styles from "./page.module.css";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading} aria-label="Chargement de la carte" />,
});

const Sidebar = dynamic(() => import("@/components/Sidebar"), {
  ssr: false,
});

const GoogleTranslateSwitcher = dynamic(() => import("@/components/GoogleTranslateSwitcher"), {
  ssr: false,
});

function AdminLogin() {
  const isAdmin = useAppStore((s) => s.isAdmin);
  const adminLogin = useAppStore((s) => s.adminLogin);
  const adminLogout = useAppStore((s) => s.adminLogout);

  const handleLogin = async () => {
    const pass = prompt("Entrez le code d'administration :");
    if (pass) {
      if (!(await adminLogin(pass))) {
        alert("Code incorrect.");
      }
    }
  };

  return (
    <div className={styles.adminControl}>
      {isAdmin ? (
        <button onClick={adminLogout} className={styles.adminBtn}>
          Mode Admin (Déconnexion)
        </button>
      ) : (
        <button onClick={handleLogin} className={styles.adminBtn}>
          Connexion Admin
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const loadExternalData = useAppStore((s) => s.loadExternalData);
  const isLoading = useAppStore((s) => s.isLoading);
  const dataSource = useAppStore((s) => s.dataSource);
  const timeRange = useAppStore((s) => s.timeRange);
  const setFlyTo = useAppStore((s) => s.setFlyTo);
  const startAddObservation = useAppStore((s) => s.startAddObservation);
  const isAddingObservation = useAppStore((s) => s.isAddingObservation);
  const refreshAdminSession = useAppStore((s) => s.refreshAdminSession);
  const refreshUserSession = useAppStore((s) => s.refreshUserSession);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      refreshUserSession().finally(() => {
        if (!cancelled) loadExternalData();
      });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [loadExternalData, refreshUserSession, timeRange]);

  useEffect(() => {
    refreshAdminSession();
  }, [refreshAdminSession]);

  return (
    <main className={styles.main} id="wildeye-app">
      <Map />
      <LocationHeader
        onFlyTo={(lng, lat, zoom = 9) => setFlyTo({ lng, lat, zoom })}
        onStartAddObservation={startAddObservation}
        isAddingObservation={isAddingObservation}
      />
      <Sidebar />

      <a
        className={styles.supportButton}
        href="https://buymeacoffee.com/lorisdc"
        target="_blank"
        rel="noreferrer"
      >
        <span className={styles.supportIcon}>€</span>
        <span>Soutenez-moi</span>
      </a>
      <GoogleTranslateSwitcher />

      {/* Data source indicator */}
      <div className={styles.watermark}>
        {isLoading ? (
          <>
            <span className={styles.watermarkSpinner} />
            Chargement des sources ouvertes…
          </>
        ) : (
          <>
            <span
              className={styles.watermarkDot}
              style={{
                background:
                  dataSource === "external"
                    ? "#34d399"
                    : dataSource === "mixed"
                      ? "#fbbf24"
                      : "#a78bfa",
              }}
            />
            {dataSource === "mixed"
              ? "Observations réelles + contributions"
              : "Observations réelles — GBIF + iNaturalist + OBIS"}
          </>
        )}
      </div>

      <footer className={styles.siteCredit}>Designed &amp; Developed by Loris Dc</footer>

      <AdminLogin />
    </main>
  );
}
