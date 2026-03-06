/**
 * Allowed TikTok/Instagram video URL hostnames (no subdomains except known short links).
 * Supports: tiktok.com, www.tiktok.com, vm.tiktok.com, vt.tiktok.com, instagram.com, www.instagram.com
 */
const VIDEO_URL_PATTERN = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|instagram\.com)\/.+/i;

/**
 * Normalize a pasted or typed video URL so it works reliably with downloaders.
 * - Trims whitespace and strips newlines/carriage returns (paste-safe)
 * @param {string} input - Raw input from user (paste or type)
 * @returns {string} Normalized URL
 */
export function normalizeVideoUrl(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Check if a string is a valid TikTok or Instagram Reel URL we support.
 * @param {string} url - Normalized URL
 * @returns {boolean}
 */
export function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return VIDEO_URL_PATTERN.test(url.trim());
}
