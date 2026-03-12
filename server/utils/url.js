/**
 * Server-side URL normalization and validation for video analysis.
 * Kept in sync with src/utils/url.js so pasted URLs work reliably in production.
 */

const VIDEO_URL_PATTERN = /^https?:\/\/((www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|instagram\.com)\/.+|(www\.)?youtube\.com\/(shorts\/[A-Za-z0-9_-]+|watch\?v=[A-Za-z0-9_-]+)|youtu\.be\/[A-Za-z0-9_-]+)/i;

const REDIRECT_HOSTS = ['l.messenger.com', 'lm.facebook.com', 'm.facebook.com', 'www.facebook.com', 'facebook.com'];

/**
 * Unwrap Messenger/Facebook redirect URLs (e.g. l.messenger.com/l.php?u=...).
 * @param {string} url
 * @returns {string}
 */
export function unwrapRedirectUrl(url) {
  if (!url || typeof url !== 'string') return url || '';
  try {
    const parsed = new URL(url.trim());
    if (!REDIRECT_HOSTS.includes(parsed.hostname.toLowerCase())) return url;
    const u = parsed.searchParams.get('u');
    if (!u) return url;
    const decoded = decodeURIComponent(u);
    return decoded.startsWith('http://') || decoded.startsWith('https://') ? decoded : url;
  } catch {
    return url;
  }
}

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
 * Prepare URL for validation: normalize, then unwrap Messenger/Facebook redirect links.
 * @param {string} input
 * @returns {string}
 */
export function prepareVideoUrl(input) {
  return unwrapRedirectUrl(normalizeVideoUrl(input));
}

/**
 * Check if URL is a supported TikTok, Instagram Reel, or YouTube Shorts video URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return VIDEO_URL_PATTERN.test(url.trim());
}
