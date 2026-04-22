/* (c) 2026 - Loris Dc - WildEye Project */
/**
 * WildEye Moderation & Safety
 * Tools for content filtering.
 */

const FORBIDDEN_WORDS = [
  // French (common)
  "merde", "putain", "con", "connard", "salope", "pute", "encule", "bite", "couille", "nique",
  "pd", "lope", "tarlouze", "tronche", "gueule", "chier", "bordel", "cul", "fesse",
  // English (common)
  "fuck", "shit", "bitch", "bastard", "dick", "pussy", "asshole", "faggot", "nigger", "cunt",
  // Slurs / Hate speech
  "hitler", "negre", "bougnoul", "youpin"
];

const FORBIDDEN_PATTERNS = [
  /\bnazi(?:s|sme)?\b/i,
  /\b(?:je\s+vais\s+)?(?:te\s+)?tuer\b/i,
  /\bviol(?:er|e|s)?\b/i,
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validates text content against a blacklist of forbidden words.
 */
export function validateContent(text: string): { isValid: boolean; foundWords: string[] } {
  if (!text) return { isValid: true, foundWords: [] };

  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const found: string[] = [];

  FORBIDDEN_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
    if (regex.test(normalized)) {
      found.push(word);
    }
  });

  FORBIDDEN_PATTERNS.forEach((regex) => {
    if (regex.test(normalized)) found.push(regex.source);
  });

  // Unique findings
  const foundWords = [...new Set(found)];

  return {
    isValid: foundWords.length === 0,
    foundWords,
  };
}

/**
 * Checks if a URL points to a potentially unsafe image (Client-side placeholder).
 * In production, this should call a Vision API.
 */
export function isImageSafe(url: string | null): boolean {
  if (!url) return true;
  // Placeholder: block certain domains or strings if needed
  const suspiciousKeywords = ["adult", "porn", "xxx", "illegal"];
  return !suspiciousKeywords.some((kw) => url.toLowerCase().includes(kw));
}
