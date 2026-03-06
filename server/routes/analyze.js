import { Router } from 'express';
import { downloadVideo } from '../services/videoExtractor.js';
import { transcribeAudio } from '../services/transcriber.js';
import { extractFrames, cleanupFrames } from '../services/frameExtractor.js';
import { readOnScreenText } from '../services/ocrReader.js';
import { factCheck } from '../services/factChecker.js';
import { cleanupFile } from '../utils/cleanup.js';
import { normalizeVideoUrl, isValidVideoUrl } from '../utils/url.js';

const router = Router();

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

router.post('/analyze', async (req, res) => {
  const rawUrl = req.body?.url;
  if (rawUrl == null || typeof rawUrl !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const url = normalizeVideoUrl(rawUrl);
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  if (!isValidVideoUrl(url)) {
    return res.status(400).json({ error: 'Please enter a valid TikTok or Instagram Reel URL' });
  }
  const { provider = 'groq', apiKeys = {} } = req.body;

  // Fall back to env vars when client doesn't send keys
  const groqKey = apiKeys.groq || process.env.GROQ_API_KEY;
  const apiKey = apiKeys[provider] || process.env[`${provider.toUpperCase()}_API_KEY`] || groqKey;

  if (!groqKey) {
    return res.status(400).json({ error: 'Groq API key is required — set it in Settings or as GROQ_API_KEY env var' });
  }

  if (!apiKey) {
    return res.status(400).json({ error: `API key for ${provider} is required` });
  }

  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  let videoPath = null;
  let frameDir = null;

  try {
    // Step 1: Download video
    sendSSE(res, 'step', { step: 'downloading', status: 'active' });
    videoPath = await downloadVideo(url);
    sendSSE(res, 'step', { step: 'downloading', status: 'done' });

    // Step 2: Transcribe audio + read on-screen text in parallel
    sendSSE(res, 'step', { step: 'transcribing', status: 'active' });

    const [transcript, frameResult] = await Promise.all([
      transcribeAudio(videoPath, groqKey),
      extractFrames(videoPath).catch(() => null),
    ]);

    let onScreenText = null;
    if (frameResult) {
      frameDir = frameResult.frameDir;
      onScreenText = await readOnScreenText(frameResult.framePaths, groqKey).catch(() => null);
    }

    sendSSE(res, 'step', { step: 'transcribing', status: 'done' });
    sendSSE(res, 'transcript', { transcript, onScreenText });

    // Step 3: Fact-check (using both transcript and on-screen text)
    sendSSE(res, 'step', { step: 'analyzing', status: 'active' });
    const result = await factCheck(transcript, onScreenText, provider, apiKey);
    sendSSE(res, 'step', { step: 'analyzing', status: 'done' });

    // Send final result
    sendSSE(res, 'result', { ...result, transcript, onScreenText });
    sendSSE(res, 'done', {});
  } catch (error) {
    sendSSE(res, 'error', { message: error.message });
  } finally {
    if (videoPath) await cleanupFile(videoPath);
    if (frameDir) await cleanupFrames(frameDir);
    res.end();
  }
});

export { router as analyzeRouter };
