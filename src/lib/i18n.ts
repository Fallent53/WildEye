/* (c) 2026 - Loris Dc - WildEye Project */
import { Locale, LocalizedText } from "./types";

export const DEFAULT_LOCALE: Locale = "fr";

export const UI_TRANSLATIONS = {
  appTitle: { fr: "WildEye", en: "WildEye" },
  addSpecies: { fr: "Ajouter une espèce", en: "Add a species" },
  proposeSpecies: { fr: "Proposer au catalogue", en: "Suggest for catalog" },
  proposalPending: { fr: "Proposition en attente", en: "Pending proposal" },
  supportMe: { fr: "Soutenez-moi", en: "Support me" },
  recentObservations: { fr: "Observations récentes", en: "Recent observations" },
} satisfies Record<string, LocalizedText>;

export function translate(text: LocalizedText | undefined, locale: Locale = DEFAULT_LOCALE) {
  if (!text) return "";
  return text[locale] ?? text.fr;
}

export function t(key: keyof typeof UI_TRANSLATIONS, locale: Locale = DEFAULT_LOCALE) {
  return translate(UI_TRANSLATIONS[key], locale);
}
