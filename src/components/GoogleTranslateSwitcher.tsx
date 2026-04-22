/* (c) 2026 - Loris Dc - WildEye Project */
"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./GoogleTranslateSwitcher.module.css";

type GoogleTranslateConstructor = new (
  options: {
    pageLanguage: string;
    includedLanguages: string;
    autoDisplay: boolean;
    layout?: unknown;
  },
  elementId: string
) => void;

type GoogleTranslateCombo = HTMLSelectElement & {
  value: string;
};

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: GoogleTranslateConstructor & {
          InlineLayout?: { SIMPLE?: unknown };
        };
      };
    };
  }
}

const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-script";
const COOKIE_NAME = "googtrans";
const SOURCE_LANGUAGE = "fr";
const STORAGE_LANGUAGE_KEY = "wildeye_translate_language";
let translateScriptPromise: Promise<void> | null = null;

const LANGUAGES = [
  { code: "fr", name: "Français", flag: "fr" },
  { code: "en", name: "English", flag: "gb" },
  { code: "es", name: "Español", flag: "es" },
  { code: "de", name: "Deutsch", flag: "de" },
  { code: "it", name: "Italiano", flag: "it" },
  { code: "pt", name: "Português", flag: "pt" },
  { code: "nl", name: "Nederlands", flag: "nl" },
  { code: "sq", name: "Shqip", flag: "al" },
  { code: "ar", name: "العربية", flag: "sa" },
  { code: "iw", name: "עברית", flag: "il" },
  { code: "zh-CN", name: "中文简体", flag: "cn" },
  { code: "zh-TW", name: "中文繁體", flag: "tw" },
  { code: "ja", name: "日本語", flag: "jp" },
  { code: "ko", name: "한국어", flag: "kr" },
  { code: "ru", name: "Русский", flag: "ru" },
  { code: "uk", name: "Українська", flag: "ua" },
  { code: "pl", name: "Polski", flag: "pl" },
  { code: "be", name: "Беларуская", flag: "by" },
  { code: "ro", name: "Română", flag: "ro" },
  { code: "cs", name: "Čeština", flag: "cz" },
  { code: "sk", name: "Slovenčina", flag: "sk" },
  { code: "sl", name: "Slovenščina", flag: "si" },
  { code: "hr", name: "Hrvatski", flag: "hr" },
  { code: "sr", name: "Српски", flag: "rs" },
  { code: "bs", name: "Bosanski", flag: "ba" },
  { code: "bg", name: "Български", flag: "bg" },
  { code: "mk", name: "Македонски", flag: "mk" },
  { code: "el", name: "Ελληνικά", flag: "gr" },
  { code: "tr", name: "Türkçe", flag: "tr" },
  { code: "sv", name: "Svenska", flag: "se" },
  { code: "no", name: "Norsk", flag: "no" },
  { code: "da", name: "Dansk", flag: "dk" },
  { code: "fi", name: "Suomi", flag: "fi" },
  { code: "is", name: "Íslenska", flag: "is" },
  { code: "ga", name: "Gaeilge", flag: "ie" },
  { code: "cy", name: "Cymraeg", flag: "gb-wls" },
  { code: "gd", name: "Gàidhlig", flag: "gb-sct" },
  { code: "ca", name: "Català", flag: "es-ct" },
  { code: "eu", name: "Euskara", flag: "es-pv" },
  { code: "gl", name: "Galego", flag: "es-ga" },
  { code: "fy", name: "Frysk", flag: "nl" },
  { code: "lb", name: "Lëtzebuergesch", flag: "lu" },
  { code: "mt", name: "Malti", flag: "mt" },
  { code: "hi", name: "हिन्दी", flag: "in" },
  { code: "bn", name: "বাংলা", flag: "bd" },
  { code: "pa", name: "ਪੰਜਾਬੀ", flag: "in" },
  { code: "gu", name: "ગુજરાતી", flag: "in" },
  { code: "ta", name: "தமிழ்", flag: "in" },
  { code: "te", name: "తెలుగు", flag: "in" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "in" },
  { code: "ml", name: "മലയാളം", flag: "in" },
  { code: "mr", name: "मराठी", flag: "in" },
  { code: "or", name: "ଓଡ଼ିଆ", flag: "in" },
  { code: "ur", name: "اردو", flag: "pk" },
  { code: "fa", name: "فارسی", flag: "ir" },
  { code: "ps", name: "پښتو", flag: "af" },
  { code: "ku", name: "Kurdî", flag: "iq" },
  { code: "sd", name: "سنڌي", flag: "pk" },
  { code: "ug", name: "ئۇيغۇرچە", flag: "cn" },
  { code: "ne", name: "नेपाली", flag: "np" },
  { code: "si", name: "සිංහල", flag: "lk" },
  { code: "th", name: "ไทย", flag: "th" },
  { code: "vi", name: "Tiếng Việt", flag: "vn" },
  { code: "id", name: "Bahasa Indonesia", flag: "id" },
  { code: "ms", name: "Bahasa Melayu", flag: "my" },
  { code: "tl", name: "Filipino", flag: "ph" },
  { code: "ceb", name: "Cebuano", flag: "ph" },
  { code: "jw", name: "Basa Jawa", flag: "id" },
  { code: "su", name: "Basa Sunda", flag: "id" },
  { code: "km", name: "ខ្មែរ", flag: "kh" },
  { code: "lo", name: "ລາວ", flag: "la" },
  { code: "my", name: "မြန်မာ", flag: "mm" },
  { code: "mn", name: "Монгол", flag: "mn" },
  { code: "kk", name: "Қазақ", flag: "kz" },
  { code: "ky", name: "Кыргызча", flag: "kg" },
  { code: "uz", name: "Oʻzbek", flag: "uz" },
  { code: "tg", name: "Тоҷикӣ", flag: "tj" },
  { code: "tk", name: "Türkmen", flag: "tm" },
  { code: "tt", name: "Татарча", flag: "ru" },
  { code: "az", name: "Azərbaycanca", flag: "az" },
  { code: "hy", name: "Հայերեն", flag: "am" },
  { code: "ka", name: "ქართული", flag: "ge" },
  { code: "af", name: "Afrikaans", flag: "za" },
  { code: "am", name: "አማርኛ", flag: "et" },
  { code: "sw", name: "Kiswahili", flag: "tz" },
  { code: "rw", name: "Kinyarwanda", flag: "rw" },
  { code: "zu", name: "IsiZulu", flag: "za" },
  { code: "xh", name: "IsiXhosa", flag: "za" },
  { code: "yo", name: "Yorùbá", flag: "ng" },
  { code: "ig", name: "Igbo", flag: "ng" },
  { code: "ha", name: "Hausa", flag: "ng" },
  { code: "so", name: "Soomaali", flag: "so" },
  { code: "ny", name: "Chichewa", flag: "mw" },
  { code: "st", name: "Sesotho", flag: "ls" },
  { code: "sn", name: "Shona", flag: "zw" },
  { code: "mg", name: "Malagasy", flag: "mg" },
  { code: "ht", name: "Kreyòl ayisyen", flag: "ht" },
  { code: "co", name: "Corsu", flag: "fr" },
  { code: "haw", name: "ʻŌlelo Hawaiʻi", flag: "us" },
  { code: "mi", name: "Māori", flag: "nz" },
  { code: "sm", name: "Gagana Samoa", flag: "ws" },
  { code: "hmn", name: "Hmong", flag: "us" },
  { code: "yi", name: "ייִדיש", flag: "il" },
  { code: "la", name: "Latina", flag: "va" },
  { code: "eo", name: "Esperanto", flag: "un" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] ?? "";
}

function getStoredLanguage() {
  try {
    return window.localStorage.getItem(STORAGE_LANGUAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredLanguage(language: LanguageCode) {
  try {
    if (language === SOURCE_LANGUAGE) {
      window.localStorage.removeItem(STORAGE_LANGUAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_LANGUAGE_KEY, language);
  } catch {}
}

function getCurrentLanguage(): LanguageCode {
  const cookie = decodeURIComponent(getCookie(COOKIE_NAME));
  const lang = cookie.split("/").filter(Boolean).at(-1) ?? getStoredLanguage();
  return LANGUAGES.some((item) => item.code === lang) ? (lang as LanguageCode) : "fr";
}

function setCookie(value: string, maxAge: number, domain?: string) {
  document.cookie = [
    `${COOKIE_NAME}=${value}`,
    "path=/",
    `max-age=${maxAge}`,
    "SameSite=Lax",
    domain ? `domain=${domain}` : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function getRootDomain(hostname: string) {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length < 2 || hostname === "localhost") return undefined;
  return `.${parts.slice(-2).join(".")}`;
}

function setTranslationCookie(language: LanguageCode) {
  const value = language === SOURCE_LANGUAGE ? "" : `/${SOURCE_LANGUAGE}/${language}`;
  const maxAge = language === SOURCE_LANGUAGE ? 0 : 60 * 60 * 24 * 365;
  const rootDomain = getRootDomain(window.location.hostname);

  setCookie(value, maxAge);
  if (rootDomain) setCookie(value, maxAge, rootDomain);
}

function initGoogleTranslate() {
  const TranslateElement = window.google?.translate?.TranslateElement;
  if (!TranslateElement) return;

  const container = document.getElementById("google_translate_element");
  if (!container || container.childElementCount > 0) return;

  new TranslateElement(
    {
      pageLanguage: SOURCE_LANGUAGE,
      includedLanguages: LANGUAGES.map((item) => item.code).join(","),
      autoDisplay: false,
      layout: TranslateElement.InlineLayout?.SIMPLE,
    },
    "google_translate_element"
  );
}

function loadGoogleTranslateScript() {
  if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
    initGoogleTranslate();
    return Promise.resolve();
  }

  if (translateScriptPromise) return translateScriptPromise;

  translateScriptPromise = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      initGoogleTranslate();
      resolve();
    };

    const script = document.createElement("script");
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Translate failed to load."));
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  });

  return translateScriptPromise;
}

function waitForGoogleCombo(timeoutMs = 2500) {
  const startedAt = Date.now();

  return new Promise<GoogleTranslateCombo | null>((resolve) => {
    const tick = () => {
      const combo = document.querySelector(".goog-te-combo") as GoogleTranslateCombo | null;
      if (combo) {
        resolve(combo);
        return;
      }
      if (Date.now() - startedAt > timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 50);
    };

    tick();
  });
}

async function applyGoogleLanguage(language: LanguageCode) {
  await loadGoogleTranslateScript();
  const combo = await waitForGoogleCombo();
  if (!combo) return;

  combo.value = language;
  combo.dispatchEvent(new Event("change"));
}

function FlagIcon({ country, className }: { country: string; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/24x18/${country}.png`}
        srcSet={`https://flagcdn.com/48x36/${country}.png 2x`}
        alt=""
        loading="lazy"
      />
    </span>
  );
}

export default function GoogleTranslateSwitcher() {
  const [language, setLanguage] = useState<LanguageCode>(getCurrentLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const currentLanguage =
    LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredLanguages = useMemo(
    () =>
      normalizedQuery
        ? LANGUAGES.filter(
            (item) =>
              item.name.toLowerCase().includes(normalizedQuery) ||
              item.code.toLowerCase().includes(normalizedQuery)
          )
        : LANGUAGES,
    [normalizedQuery]
  );

  useEffect(() => {
    if (language === SOURCE_LANGUAGE) return;
    setTranslationCookie(language);
    applyGoogleLanguage(language).catch(() => {
      // Google Translate is best-effort; keep the custom selector usable.
    });
  }, [language]);

  const changeLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    setIsOpen(false);
    setQuery("");
    setStoredLanguage(nextLanguage);
    setTranslationCookie(nextLanguage);
    window.location.reload();
  };

  return (
    <div className={styles.translateControl}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <FlagIcon country={currentLanguage.flag} className={styles.flag} />
        <span className={styles.code}>{currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <input
            className={styles.search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une langue"
            autoFocus
          />
          <div className={styles.list} role="listbox" aria-label="Langues disponibles">
            {filteredLanguages.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`${styles.option} ${item.code === language ? styles.activeOption : ""}`}
                onClick={() => changeLanguage(item.code)}
                role="option"
                aria-selected={item.code === language}
              >
                <FlagIcon country={item.flag} className={styles.optionFlag} />
                <span className={styles.optionName}>{item.name}</span>
                <span className={styles.optionCode}>{item.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div id="google_translate_element" className={styles.googleElement} />
    </div>
  );
}
