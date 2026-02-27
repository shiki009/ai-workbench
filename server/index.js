import 'dotenv/config';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { analyzeRouter } from './routes/analyze.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const app = express();

app.use(express.json());

// Debug endpoint — check system binaries
app.get('/api/debug', (req, res) => {
  const check = (cmd) => {
    try { return execSync(cmd, { encoding: 'utf8' }).trim(); }
    catch { return 'NOT FOUND'; }
  };
  res.json({
    python3: check('which python3'),
    ffmpeg: check('which ffmpeg'),
    ytdlp: check('which yt-dlp'),
    path: process.env.PATH,
  });
});

// API routes
app.use('/api', analyzeRouter);

// Serve frontend in production
if (isProd) {
  const distPath = join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'set' : 'NOT SET'}`);
});
