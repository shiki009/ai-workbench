import { randomUUID } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP_DIR = join(__dirname, '..', 'tmp');

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// --- TikTok ---

async function extractTikTokVideo(url) {
  // Try yt-dlp first (works reliably for TikTok)
  try {
    const outputPath = join(TMP_DIR, `${randomUUID()}.mp4`);
    await execFileAsync('yt-dlp', [
      '-o', outputPath,
      '-f', 'worstaudio[ext=m4a]/worstvideo[ext=mp4]/worst',
      '--no-check-certificates',
      '--no-warnings',
      '--no-playlist',
      url,
    ]);
    return outputPath;
  } catch {
    // Fall back to HTTP extraction
  }

  return fetchVideoFromPage(url, extractTikTokVideoUrl);
}

async function extractTikTokVideoUrl(html) {
  const jsonMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    const videoData = data?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.itemInfo?.itemStruct?.video;
    if (videoData?.downloadAddr) return videoData.downloadAddr;
    if (videoData?.playAddr) return videoData.playAddr;
  }

  const match = html.match(/"playAddr"\s*:\s*"([^"]+)"/) ||
                html.match(/"downloadAddr"\s*:\s*"([^"]+)"/);
  if (match) {
    return match[1].replace(/\\u002F/g, '/').replace(/\\u0026/g, '&');
  }

  throw new Error('Could not extract video URL from TikTok');
}

// --- Instagram ---

async function extractInstagramVideo(url) {
  const shortcodeMatch = url.match(/\/(reels?|p)\/([A-Za-z0-9_-]+)/);
  if (!shortcodeMatch) throw new Error('Invalid Instagram URL');
  const shortcode = shortcodeMatch[2];

  // Method 1: GraphQL API (no login required)
  try {
    const videoUrl = await fetchInstagramGraphQL(shortcode);
    if (videoUrl) return downloadToFile(videoUrl, url);
  } catch { /* try next method */ }

  // Method 2: Embed page
  try {
    const videoUrl = await fetchInstagramEmbed(shortcode);
    if (videoUrl) return downloadToFile(videoUrl, url);
  } catch { /* try next method */ }

  // Method 3: og:video meta tag
  try {
    const videoUrl = await fetchInstagramOgVideo(shortcode);
    if (videoUrl) return downloadToFile(videoUrl, url);
  } catch { /* give up */ }

  throw new Error('Could not extract video from Instagram. Try again in a few minutes — Instagram may be rate-limiting.');
}

async function fetchInstagramGraphQL(shortcode) {
  const res = await fetch('https://www.instagram.com/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': DESKTOP_UA,
      'X-IG-App-ID': '936619743392459',
      'X-FB-LSD': 'AVqbxe3J_YA',
      'X-ASBD-ID': '129477',
      'Sec-Fetch-Site': 'same-origin',
    },
    body: new URLSearchParams({
      lsd: 'AVqbxe3J_YA',
      doc_id: '10015901848480474',
      variables: JSON.stringify({ shortcode }),
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const media = data?.data?.xdt_shortcode_media;
  if (!media) return null;

  // Direct video
  if (media.video_url) return media.video_url;

  // Carousel — find video in edges
  const edges = media.edge_sidecar_to_children?.edges;
  if (edges) {
    const videoNode = edges.find(e => e.node?.video_url);
    if (videoNode) return videoNode.node.video_url;
  }

  return null;
}

async function fetchInstagramEmbed(shortcode) {
  const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
    headers: { 'User-Agent': MOBILE_UA },
  });

  if (!res.ok) return null;

  const html = await res.text();
  const match = html.match(/"video_url"\s*:\s*"([^"]+)"/) ||
                html.match(/"contentUrl"\s*:\s*"([^"]+)"/);

  return match ? decodeEntities(match[1]) : null;
}

async function fetchInstagramOgVideo(shortcode) {
  const res = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
    headers: { 'User-Agent': MOBILE_UA },
  });

  if (!res.ok) return null;

  const html = await res.text();
  const match = html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/);
  return match ? decodeEntities(match[1]) : null;
}

// --- YouTube ---

async function extractYouTubeVideo(url) {
  const outputPath = join(TMP_DIR, `${randomUUID()}.mp4`);
  await execFileAsync('yt-dlp', [
    '-o', outputPath,
    '-f', 'worstaudio[ext=m4a]/worstvideo[ext=mp4]/worst',
    '--no-check-certificates',
    '--no-warnings',
    '--no-playlist',
    url,
  ]);
  return outputPath;
}

// --- Helpers ---

function decodeEntities(str) {
  return str
    .replace(/\\u0026/g, '&')
    .replace(/\\u002F/g, '/')
    .replace(/&amp;/g, '&');
}

async function fetchVideoFromPage(url, extractFn) {
  const res = await fetch(url, {
    headers: { 'User-Agent': MOBILE_UA },
    redirect: 'follow',
  });

  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);

  const html = await res.text();
  const videoUrl = await extractFn(html);
  return downloadToFile(videoUrl, url);
}

async function downloadToFile(videoUrl, referer) {
  const res = await fetch(videoUrl, {
    headers: {
      'User-Agent': MOBILE_UA,
      'Referer': referer,
    },
  });

  if (!res.ok) throw new Error(`Failed to download video: ${res.status}`);

  await mkdir(TMP_DIR, { recursive: true });
  const buffer = Buffer.from(await res.arrayBuffer());
  const outputPath = join(TMP_DIR, `${randomUUID()}.mp4`);
  await writeFile(outputPath, buffer);
  return outputPath;
}

// --- Main export ---

export async function downloadVideo(url) {
  await mkdir(TMP_DIR, { recursive: true });

  if (/instagram\.com/i.test(url)) return extractInstagramVideo(url);
  if (/tiktok\.com/i.test(url)) return extractTikTokVideo(url);
  if (/youtube\.com|youtu\.be/i.test(url)) return extractYouTubeVideo(url);

  throw new Error('Unsupported platform. Only TikTok, Instagram, and YouTube are supported.');
}
