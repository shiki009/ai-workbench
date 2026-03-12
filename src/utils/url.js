/**
 * Allowed video URL hostnames: TikTok, Instagram, YouTube Shorts.
 * Supports: tiktok.com, vm/vt.tiktok.com, instagram.com, youtube.com/shorts, youtube.com/watch, youtu.be
 */
const VIDEO_URL_PATTERN = /^https?:\/\/((www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|instagram\.com)\/.+|(www\.)?youtube\.com\/(shorts\/[A-Za-z0-9_-]+|watch\?v=[A-Za-z0-9_-]+)|youtu\.be\/[A-Za-z0-9_-]+)/i;

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
 * Check if a string is a valid TikTok, Instagram Reel, or YouTube Shorts URL we support.
 * @param {string} url - Normalized URL
 * @returns {boolean}
 */
export function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return VIDEO_URL_PATTERN.test(url.trim());
}
