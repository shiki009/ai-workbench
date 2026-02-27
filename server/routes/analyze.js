import { Router } from 'express';
import { downloadVideo } from '../services/videoExtractor.js';
import { transcribeAudio } from '../services/transcriber.js';
import { factCheck } from '../services/factChecker.js';
import { cleanupFile } from '../utils/cleanup.js';

const router = Router();

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

router.post('/analyze', async (req, res) => {
  const { url, provider = 'groq', apiKeys = {} } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

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

  try {
    // Step 1: Download video
    sendSSE(res, 'step', { step: 'downloading', status: 'active' });
    videoPath = await downloadVideo(url);
    sendSSE(res, 'step', { step: 'downloading', status: 'done' });

    // Step 2: Transcribe
    sendSSE(res, 'step', { step: 'transcribing', status: 'active' });
    const transcript = await transcribeAudio(videoPath, groqKey);
    sendSSE(res, 'step', { step: 'transcribing', status: 'done' });
    sendSSE(res, 'transcript', { transcript });

    // Step 3: Fact-check
    sendSSE(res, 'step', { step: 'analyzing', status: 'active' });
    const result = await factCheck(transcript, provider, apiKey);
    sendSSE(res, 'step', { step: 'analyzing', status: 'done' });

    // Send final result
    sendSSE(res, 'result', { ...result, transcript });
    sendSSE(res, 'done', {});
  } catch (error) {
    sendSSE(res, 'error', { message: error.message });
  } finally {
    if (videoPath) {
      await cleanupFile(videoPath);
    }
    res.end();
  }
});

export { router as analyzeRouter };
