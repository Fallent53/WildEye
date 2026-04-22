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
import { supabase } from "./supabase";

let externalLoadRequestId = 0;
const USER_PROFILE_STORAGE_KEY = "wildeye_user_profile";
const externalDataCache = new Map<
  TimeRangeFilter,
  { observations: Observation[]; loadedAt: number }
>();
const EXTERNAL_DATA_CACHE_TTL_MS = 5 * 60 * 1000;

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

function isOwnObservation(obs: Observation, profile: UserProfile) {
  return (
    (Boolean(obs.user_id) && obs.user_id === profile.id) ||
    (Boolean(obs.owner_ref) && obs.owner_ref === profile.owner_ref)
  );
}

interface AppState {
  /* ── Data ─────────────────────────── */
  observations: Observation[];
  selectedObservation: Observation | null;
  isLoading: boolean;
  dataSource: "external" | "mixed";
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
  addObservation: (obs: Omit<Observation, "id" | "created_at" | "user_id" | "owner_ref" | "longitude_blurred" | "latitude_blurred">) => Promise<boolean>;
  deleteObservation: (id: string) => void;
  setObservationVisibility: (id: string, visibility: ObservationVisibility) => void;
  setObservationAnonymous: (id: string, isAnonymous: boolean) => void;
  setObservationPrivacyLevel: (id: string, level: ObservationPrivacyLevel) => void;
  openAccountPanel: () => void;
  cancelAddObservation: () => void;
  startAddObservation: () => void;
  loadExternalData: () => Promise<void>;
  refreshUserSession: () => Promise<void>;
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
  dataSource: "external" as const,
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

  addObservation: async (data) => {
    const state = useAppStore.getState();
    const response = await fetch("/api/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        observer_name: state.userProfile.name,
      }),
    });

    if (!response.ok) return false;

    const payload = (await response.json()) as { observation?: Observation };
    if (!payload.observation) return false;

    set((current) => ({
      observations: [payload.observation!, ...current.observations],
      isAddingObservation: false,
      activePanel: "detail",
      selectedObservation: payload.observation!,
      newObservationCoords: null,
      dataSource: "mixed",
    }));
    externalDataCache.clear();

    return true;
  },

  deleteObservation: (id) =>
    set((state) => {
      externalDataCache.clear();
      const targetObs = state.observations.find((o) => o.id === id);
      const nextObservations = state.observations.filter((obs) => obs.id !== id);
      const selectedObservation =
        state.selectedObservation?.id === id ? null : state.selectedObservation;

      if (targetObs) {
        const isOwn = isOwnObservation(targetObs, state.userProfile);
        if (state.isAdmin && !isOwn) {
          fetch(`/api/admin/observations/${encodeURIComponent(id)}`, {
            method: "DELETE",
          }).then((response) => {
            if (!response.ok) console.error("Error deleting observation as admin.");
          });
        } else if (targetObs.source_kind === "local" && isOwn) {
          fetch(`/api/observations/${encodeURIComponent(id)}`, {
            method: "DELETE",
          }).then((response) => {
            if (!response.ok) console.error("Error deleting observation from DB.");
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
        obs.id === id && isOwnObservation(obs, state.userProfile) ? { ...obs, visibility } : obs
      );
      const selectedObservation =
        state.selectedObservation?.id === id
          ? observations.find((obs) => obs.id === id) ?? null
          : state.selectedObservation;
      fetch(`/api/observations/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      }).then((response) => {
        if (!response.ok) console.error("Error updating observation visibility.");
      });
      return { observations, selectedObservation };
    }),

  setObservationAnonymous: (id, is_anonymous) =>
    set((state) => {
      const observations = state.observations.map((obs) =>
        obs.id === id && isOwnObservation(obs, state.userProfile)
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
      fetch(`/api/observations/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_anonymous,
          observer_name: state.userProfile.name,
        }),
      }).then((response) => {
        if (!response.ok) console.error("Error updating observation anonymity.");
      });
      return { observations, selectedObservation };
    }),

  setObservationPrivacyLevel: (id, privacy_level) =>
    set((state) => {
      const observations = state.observations.map((obs) => {
        if (obs.id !== id || !isOwnObservation(obs, state.userProfile)) return obs;

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
      fetch(`/api/observations/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy_level }),
      }).then((response) => {
        if (!response.ok) console.error("Error updating observation privacy level.");
      });
      return { observations, selectedObservation };
    }),

  openAccountPanel: () =>
    set({
      activePanel: "account",
      selectedObservation: null,
      isAddingObservation: false,
    }),

  loadExternalData: async () => {
    const requestId = ++externalLoadRequestId;
    const timeRange = useAppStore.getState().timeRange;
    const cached = externalDataCache.get(timeRange);
    if (cached && Date.now() - cached.loadedAt < EXTERNAL_DATA_CACHE_TTL_MS) {
      set({
        observations: cached.observations,
        isLoading: false,
        dataSource: cached.observations.some((obs) => obs.source_kind === "local")
          ? "mixed"
          : "external",
      });
      return;
    }

    set({ isLoading: true });
    try {
      const externalTask = fetch(`/api/external-observations?range=${encodeURIComponent(timeRange)}`, {
        cache: "no-store",
      })
        .then((response) => (response.ok ? response.json() : { observations: [] }))
        .then((payload: { observations?: Observation[] }) => payload.observations ?? [])
        .catch(() => []);

      // Fetch from Supabase
      const internalTask = supabase
        .from("public_observations")
        .select("*")
        .order("observed_at", { ascending: false })
        .then(({ data, error }) => ({
          data: error ? [] : data,
        }));
      const ownTask = fetch("/api/observations", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : { observations: [] }))
        .catch(() => ({ observations: [] }));

      const [external, { data: internal }, own] = await Promise.all([
        externalTask,
        internalTask,
        ownTask,
      ]);
      
      const publicInternalResults = (internal || []) as Observation[];
      const ownResults = ((own as { observations?: Observation[] }).observations ?? []) as Observation[];
      const ownIds = new Set(ownResults.map((obs) => obs.id));
      const internalResults = [
        ...ownResults,
        ...publicInternalResults.filter((obs) => !ownIds.has(obs.id)),
      ];

      if (requestId !== externalLoadRequestId) return;

      const combined = [...internalResults, ...external].sort(
        (a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime()
      );
      if (combined.length > 0) {
        externalDataCache.set(timeRange, {
          observations: combined,
          loadedAt: Date.now(),
        });
      }

      set({
        observations: combined,
        isLoading: false,
        dataSource: internalResults.length > 0 ? "mixed" : "external",
      });
    } catch (err) {
      console.error("Error loading combined data:", err);
      if (requestId !== externalLoadRequestId) return;
      set({ isLoading: false });
    }
  },

  refreshUserSession: async () => {
    const currentProfile = useAppStore.getState().userProfile;
    const response = await fetch("/api/user/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentProfile.id }),
    });

    if (!response.ok) return;

    const data = (await response.json()) as { userId?: string; owner_ref?: string };
    if (!data.userId) return;

    set((state) => {
      const userProfile = {
        ...state.userProfile,
        id: data.userId!,
        owner_ref: data.owner_ref,
      };
      writeStoredUserProfile(userProfile);
      return { userProfile };
    });
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
