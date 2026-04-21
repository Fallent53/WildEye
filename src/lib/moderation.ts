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
  "nazi", "hitler", "negre", "bougnoul", "youpin", "sale", "mort", "tuer", "viol"
];

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
    // Check for exact word matches or words embedded with spaces/symbols
    const regex = new RegExp(`\\b${word}\\b|${word}`, "i");
    if (regex.test(normalized)) {
      found.push(word);
    }
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
