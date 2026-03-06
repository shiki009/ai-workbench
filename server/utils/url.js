/**
 * Server-side URL normalization and validation for video analysis.
 * Kept in sync with src/utils/url.js so pasted URLs work reliably in production.
 */

const VIDEO_URL_PATTERN = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|instagram\.com)\/.+/i;

/**
 * Normalize URL: trim and collapse any whitespace/newlines (paste-safe).
 * @param {string} input
 * @returns {string}
 */
export function normalizeVideoUrl(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Check if URL is a supported TikTok or Instagram video URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return VIDEO_URL_PATTERN.test(url.trim());
}
