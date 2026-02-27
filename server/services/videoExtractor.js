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
  // Try embedded JSON data
  const jsonMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    const videoData = data?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.itemInfo?.itemStruct?.video;
    if (videoData?.downloadAddr) return videoData.downloadAddr;
    if (videoData?.playAddr) return videoData.playAddr;
  }

  // Fallback: regex patterns
  const match = html.match(/"playAddr"\s*:\s*"([^"]+)"/) ||
                html.match(/"downloadAddr"\s*:\s*"([^"]+)"/);
  if (match) {
    return match[1].replace(/\\u002F/g, '/').replace(/\\u0026/g, '&');
  }

  throw new Error('Could not extract video URL from TikTok');
}

// --- Instagram ---

async function extractInstagramVideo(url) {
  // Normalize URL to get the shortcode
  const shortcodeMatch = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
  if (!shortcodeMatch) throw new Error('Invalid Instagram URL');
  const shortcode = shortcodeMatch[2];

  // Try the embed page (doesn't require login)
  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/`;
  const embedRes = await fetch(embedUrl, {
    headers: { 'User-Agent': MOBILE_UA },
  });

  if (!embedRes.ok) throw new Error(`Failed to fetch Instagram embed: ${embedRes.status}`);

  const html = await embedRes.text();

  // Extract video URL from embed page
  const videoMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/) ||
                     html.match(/class="EmbeddedMediaImage"[^>]*video_url=([^&"]+)/) ||
                     html.match(/data-video-url="([^"]+)"/) ||
                     html.match(/"contentUrl"\s*:\s*"([^"]+)"/);

  if (!videoMatch) {
    // Try og:video from the regular page as last resort
    const pageRes = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
      headers: { 'User-Agent': MOBILE_UA },
    });
    if (pageRes.ok) {
      const pageHtml = await pageRes.text();
      const ogMatch = pageHtml.match(/<meta\s+property="og:video"\s+content="([^"]+)"/);
      if (ogMatch) return downloadToFile(decodeHtmlEntities(ogMatch[1]), url);
    }
    throw new Error('Could not extract video from Instagram. The post may be private.');
  }

  const videoUrl = decodeHtmlEntities(videoMatch[1]);
  return downloadToFile(videoUrl, url);
}

// --- Helpers ---

function decodeHtmlEntities(str) {
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

  throw new Error('Unsupported platform. Only TikTok and Instagram are supported.');
}
