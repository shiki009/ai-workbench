import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readdir, unlink } from 'node:fs/promises';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP_DIR = join(__dirname, '..', 'tmp');

export async function extractFrames(videoPath, count = 4) {
  const frameDir = join(TMP_DIR, `frames-${randomUUID()}`);
  await mkdir(frameDir, { recursive: true });

  // Get video duration
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'csv=p=0',
    videoPath,
  ]);

  const duration = parseFloat(stdout.trim()) || 10;
  const framePaths = [];

  // Extract evenly spaced frames
  for (let i = 0; i < count; i++) {
    const timestamp = (duration / (count + 1)) * (i + 1);
    const framePath = join(frameDir, `frame-${i}.jpg`);

    await execFileAsync('ffmpeg', [
      '-ss', String(timestamp),
      '-i', videoPath,
      '-vframes', '1',
      '-q:v', '3',
      '-y',
      framePath,
    ]);

    framePaths.push(framePath);
  }

  return { framePaths, frameDir };
}

export async function cleanupFrames(frameDir) {
  try {
    const files = await readdir(frameDir);
    await Promise.all(files.map(f => unlink(join(frameDir, f))));
    const { rmdir } = await import('node:fs/promises');
    await rmdir(frameDir);
  } catch {
    // Ignore cleanup errors
  }
}
