/* (c) 2026 - Loris Dc - WildEye Project */
import { create } from "zustand";
import {
  Category,
  FilterState,
  Locale,
  Observation,
  ObservationPrivacyLevel,
  ObservationVisibility,
  SortOrder,
  TimeRangeFilter,
  UserProfile,
  ViewState,
} from "./types";
import { generateDemoData } from "./demo-data";
import { fetchAllExternalObservations } from "./external-data";
import { getExternalDateRange } from "./time-range";
import { supabase } from "./supabase";

let externalLoadRequestId = 0;
const USER_PROFILE_STORAGE_KEY = "wildeye_user_profile";

function readStoredUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return { id: "local-user", name: "Explorateur Anonyme" };
  }
  try {
    const stored = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as UserProfile;
    
    // Generate new profile
    const newProfile: UserProfile = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      name: "Explorateur Anonyme",
    };
    window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
  } catch {
    return { id: "local-user", name: "Explorateur Anonyme" };
  }
}

function writeStoredUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

interface AppState {
  /* ── Data ─────────────────────────── */
  observations: Observation[];
  selectedObservation: Observation | null;
  isLoading: boolean;
  dataSource: "demo" | "external" | "mixed";
  locale: Locale;
  isAdmin: boolean;
  userProfile: UserProfile;

  /* ── Filters ──────────────────────── */
  filters: FilterState;
  searchQuery: string;
  timeRange: TimeRangeFilter;
  sortOrder: SortOrder;

  /* ── Map View ─────────────────────── */
  viewState: ViewState;
  flyToTarget: { lng: number; lat: number; zoom: number } | null;

  /* ── UI ────────────────────────────── */
  isSidebarOpen: boolean;
  isAddingObservation: boolean;
  activePanel: "explore" | "add" | "detail" | "account" | null;

  /* ── New Observation Form ──────────── */
  newObservationCoords: { lng: number; lat: number } | null;

  /* ── Actions ──────────────────────── */
  setObservations: (obs: Observation[]) => void;
  setLocale: (locale: Locale) => void;
  selectObservation: (obs: Observation | null) => void;
  toggleFilter: (category: Category) => void;
  setSearchQuery: (query: string) => void;
  setTimeRange: (range: TimeRangeFilter) => void;
  setSortOrder: (order: SortOrder) => void;
  setViewState: (vs: Partial<ViewState>) => void;
  setFlyTo: (target: { lng: number; lat: number; zoom: number } | null) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  setActivePanel: (panel: "explore" | "add" | "detail" | "account" | null) => void;
  setIsAddingObservation: (value: boolean) => void;
  setNewObservationCoords: (coords: { lng: number; lat: number } | null) => void;
  addObservation: (obs: Omit<Observation, "id" | "created_at" | "user_id" | "longitude_blurred" | "latitude_blurred">) => void;
  deleteObservation: (id: string) => void;
  setObservationVisibility: (id: string, visibility: ObservationVisibility) => void;
  setObservationAnonymous: (id: string, isAnonymous: boolean) => void;
  setObservationPrivacyLevel: (id: string, level: ObservationPrivacyLevel) => void;
  openAccountPanel: () => void;
  cancelAddObservation: () => void;
  startAddObservation: () => void;
  loadDemoData: () => void;
  loadExternalData: () => Promise<void>;
  adminLogin: (passcode: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  refreshAdminSession: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  /* ── Initial State ────────────────── */
  observations: [],
  selectedObservation: null,
  userProfile: readStoredUserProfile(),
  isLoading: false,
  dataSource: "demo" as const,
  locale: "fr",
  isAdmin: false,

  filters: { cristal: true, faune: true, flore: true },
  searchQuery: "",
  timeRange: "month",
  sortOrder: "newest",

  viewState: {
    longitude: 2.8,
    latitude: 46.5,
    zoom: 5.5,
    pitch: 45,
    bearing: -10,
  },

  isSidebarOpen: true,
  isAddingObservation: false,
  activePanel: "explore",
  newObservationCoords: null,
  flyToTarget: null as { lng: number; lat: number; zoom: number } | null,

  /* ── Actions ──────────────────────── */
  setObservations: (observations) => set({ observations }),

  setLocale: (locale) => set({ locale }),

  selectObservation: (obs) =>
    set((state) => ({
      selectedObservation: obs,
      activePanel: obs ? "detail" : "explore",
      isSidebarOpen: obs ? true : state.isSidebarOpen,
      isAddingObservation: false,
    })),

  toggleFilter: (category) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [category]: !state.filters[category],
      },
    })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setTimeRange: (timeRange) => set({ timeRange }),

  setSortOrder: (sortOrder) => set({ sortOrder }),

  setViewState: (vs) =>
    set((state) => ({
      viewState: { ...state.viewState, ...vs },
    })),
  setFlyTo: (flyToTarget) => set({ flyToTarget }),
  setUserProfile: (profile) =>
    set((state) => {
      const newUserProfile = { ...state.userProfile, ...profile };
      writeStoredUserProfile(newUserProfile);
      return { userProfile: newUserProfile };
    }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openSidebar: () => set({ isSidebarOpen: true }),

  setActivePanel: (activePanel) => set({ activePanel }),

  setIsAddingObservation: (value) => set({ isAddingObservation: value }),

  setNewObservationCoords: (coords) =>
    set({ newObservationCoords: coords, activePanel: "add" }),

  startAddObservation: () =>
    set({
      isAddingObservation: true,
      selectedObservation: null,
      activePanel: "add",
      newObservationCoords: null,
    }),

  cancelAddObservation: () =>
    set({
      isAddingObservation: false,
      activePanel: "explore",
      newObservationCoords: null,
    }),

  addObservation: (data) => {
    // Blur coordinates by 300-500m for privacy
    const blurOffset = 0.003 + Math.random() * 0.002;
    const blurAngle = Math.random() * Math.PI * 2;

    const newObs: Observation = {
      id: `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      user_id: useAppStore.getState().userProfile.id,
      source_name: "Contribution locale",
      source_kind: "local",
      observer_name: useAppStore.getState().userProfile.name,
      visibility: "public",
      privacy_level: "standard",
      is_anonymous: false,
      longitude_blurred: data.longitude + Math.cos(blurAngle) * blurOffset,
      latitude_blurred: data.latitude + Math.sin(blurAngle) * blurOffset,
      ...data,
    };

    set((state) => ({
      observations: [newObs, ...state.observations],
      isAddingObservation: false,
      activePanel: "detail",
      selectedObservation: newObs,
      newObservationCoords: null,
    }));

    // Async persist to Supabase
    supabase.from("observations").insert([newObs]).then(({ error }) => {
      if (error) console.error("Error persisting observation:", error);
    });
  },

  deleteObservation: (id) =>
    set((state) => {
      const targetObs = state.observations.find((o) => o.id === id);
      const nextObservations = state.observations.filter((obs) => obs.id !== id);
      const selectedObservation =
        state.selectedObservation?.id === id ? null : state.selectedObservation;

      if (targetObs) {
        if (state.isAdmin && targetObs.user_id !== state.userProfile.id) {
          fetch(`/api/admin/observations/${encodeURIComponent(id)}`, {
            method: "DELETE",
          }).then((response) => {
            if (!response.ok) console.error("Error deleting observation as admin.");
          });
        } else if (targetObs.source_kind === "local" && targetObs.user_id === state.userProfile.id) {
          supabase
            .from("observations")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Error deleting observation from DB:", error);
            });
        }
      }

      return {
        observations: nextObservations,
        selectedObservation,
        activePanel: selectedObservation ? state.activePanel : (state.isAdmin ? state.activePanel : "account"),
      };
    }),

  setObservationVisibility: (id, visibility) =>
    set((state) => {
      const observations = state.observations.map((obs) =>
        obs.id === id && obs.user_id === state.userProfile.id ? { ...obs, visibility } : obs
      );
      const selectedObservation =
        state.selectedObservation?.id === id
          ? observations.find((obs) => obs.id === id) ?? null
          : state.selectedObservation;
      return { observations, selectedObservation };
    }),

  setObservationAnonymous: (id, is_anonymous) =>
    set((state) => {
      const observations = state.observations.map((obs) =>
        obs.id === id && obs.user_id === state.userProfile.id
          ? {
              ...obs,
              is_anonymous,
              observer_name: is_anonymous ? "Anonyme" : state.userProfile.name,
            }
          : obs
      );
      const selectedObservation =
        state.selectedObservation?.id === id
          ? observations.find((obs) => obs.id === id) ?? null
          : state.selectedObservation;
      return { observations, selectedObservation };
    }),

  setObservationPrivacyLevel: (id, privacy_level) =>
    set((state) => {
      const observations = state.observations.map((obs) => {
        if (obs.id !== id || obs.user_id !== state.userProfile.id) return obs;

        const blurOffset =
          privacy_level === "protected"
            ? 0.018 + Math.random() * 0.025
            : 0.003 + Math.random() * 0.002;
        const blurAngle = Math.random() * Math.PI * 2;

        return {
          ...obs,
          privacy_level,
          longitude_blurred: obs.longitude + Math.cos(blurAngle) * blurOffset,
          latitude_blurred: obs.latitude + Math.sin(blurAngle) * blurOffset,
        };
      });
      const selectedObservation =
        state.selectedObservation?.id === id
          ? observations.find((obs) => obs.id === id) ?? null
          : state.selectedObservation;
      return { observations, selectedObservation };
    }),

  openAccountPanel: () =>
    set({
      activePanel: "account",
      selectedObservation: null,
      isAddingObservation: false,
    }),

  loadDemoData: () => {
    const data = generateDemoData();
    set({ observations: data, isLoading: false, dataSource: "demo" });
  },

  loadExternalData: async () => {
    const requestId = ++externalLoadRequestId;
    const timeRange = useAppStore.getState().timeRange;
    set({ isLoading: true });
    try {
      // Fetch from iNaturalist/GBIF/OBIS
      const externalTask = fetchAllExternalObservations({
        gbifLimit: 1200,
        inatLimit: 1200,
        obisLimit: 800,
        dateRange: getExternalDateRange(timeRange),
      });

      // Fetch from Supabase
      const internalTask = supabase
        .from("observations")
        .select("*")
        .order("observed_at", { ascending: false });

      const [external, { data: internal, error: internalError }] = await Promise.all([
        externalTask,
        internalTask,
      ]);

      if (internalError) console.error("Error fetching internal observations:", internalError);
      
      const internalResults = (internal || []) as Observation[];

      if (requestId !== externalLoadRequestId) return;

      const combined = [...internalResults, ...external].sort(
        (a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime()
      );

      set({
        observations: combined,
        isLoading: false,
        dataSource: combined.length > 0 ? "mixed" : "external",
      });
    } catch (err) {
      console.error("Error loading combined data:", err);
      if (requestId !== externalLoadRequestId) return;
      set({ isLoading: false });
    }
  },

  adminLogin: async (passcode: string) => {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });

    if (response.ok) {
      set({ isAdmin: true });
      return true;
    }

    set({ isAdmin: false });
    return false;
  },

  adminLogout: async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    set({ isAdmin: false });
  },

  refreshAdminSession: async () => {
    const response = await fetch("/api/admin/session", { cache: "no-store" });
    if (!response.ok) {
      set({ isAdmin: false });
      return;
    }
    const data = (await response.json()) as { isAdmin?: boolean };
    set({ isAdmin: Boolean(data.isAdmin) });
  },
}));
