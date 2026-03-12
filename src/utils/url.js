/**
 * Allowed video URL hostnames: TikTok, Instagram, YouTube Shorts.
 * Supports: tiktok.com, vm/vt.tiktok.com, instagram.com, youtube.com/shorts, youtube.com/watch, youtu.be
 */
const VIDEO_URL_PATTERN = /^https?:\/\/((www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|instagram\.com)\/.+|(www\.)?youtube\.com\/(shorts\/[A-Za-z0-9_-]+|watch\?v=[A-Za-z0-9_-]+)|youtu\.be\/[A-Za-z0-9_-]+)/i;

const REDIRECT_HOSTS = ['l.messenger.com', 'lm.facebook.com', 'm.facebook.com', 'www.facebook.com', 'facebook.com'];

/**
 * Unwrap Messenger/Facebook redirect URLs (e.g. l.messenger.com/l.php?u=...).
 * Returns the decoded `u` param if present and from a known redirect host; otherwise returns input.
 * @param {string} url - URL that might be wrapped
 * @returns {string} Unwrapped URL or original
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
 * Prepare URL for validation: normalize, then unwrap Messenger/Facebook redirect links.
 * Use the result for validation and for passing to the backend.
 * @param {string} input - Raw input from user
 * @returns {string} URL ready for validation
 */
export function prepareVideoUrl(input) {
  return unwrapRedirectUrl(normalizeVideoUrl(input));
}

/**
 * Extract embed info from a video URL for in-page playback.
 * @param {string} url - Analyzed URL (e.g. after prepareVideoUrl)
 * @returns {{ type: 'youtube'|'tiktok'|'instagram', id: string, path?: 'reel'|'p' }|null}
 */
export function getEmbedInfo(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();

    if (host.includes('youtube.com') || host === 'youtu.be') {
      let id = null;
      if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
      else if (u.pathname.includes('/shorts/')) id = u.pathname.split('/shorts/')[1]?.split('/')[0];
      else id = u.searchParams.get('v');
      if (id) return { type: 'youtube', id };
    }

    if (host.includes('tiktok.com') && !host.startsWith('vm.') && !host.startsWith('vt.')) {
      const m = u.pathname.match(/\/video\/(\d+)/);
      if (m) return { type: 'tiktok', id: m[1] };
    }

    if (host.includes('instagram.com')) {
      const reelM = u.pathname.match(/\/reel\/([A-Za-z0-9_-]+)/);
      const pM = u.pathname.match(/\/p\/([A-Za-z0-9_-]+)/);
      const shortcode = reelM?.[1] ?? pM?.[1];
      const path = reelM ? 'reel' : 'p';
      if (shortcode) return { type: 'instagram', id: shortcode, path };
    }
  } catch {}
  return null;
}

/**
 * Check if a string is a valid TikTok, Instagram Reel, or YouTube Shorts URL we support.
 * @param {string} url - Normalized URL (use prepareVideoUrl first if input may be wrapped)
 * @returns {boolean}
 */
export function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return VIDEO_URL_PATTERN.test(url.trim());
}
