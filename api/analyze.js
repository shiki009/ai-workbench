import { downloadVideo } from '../server/services/videoExtractor.js';
import { transcribeAudio } from '../server/services/transcriber.js';
import { extractFrames, cleanupFrames } from '../server/services/frameExtractor.js';
import { readOnScreenText } from '../server/services/ocrReader.js';
import { factCheck } from '../server/services/factChecker.js';
import { cleanupFile } from '../server/utils/cleanup.js';

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, provider = 'groq', apiKeys = {} } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

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

    // Step 3: Fact-check
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
}
