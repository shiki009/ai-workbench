import { randomUUID } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import youtubeDlExec from 'youtube-dl-exec';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP_DIR = join(__dirname, '..', 'tmp');

export async function downloadVideo(url) {
  await mkdir(TMP_DIR, { recursive: true });

  const filename = `${randomUUID()}.mp4`;
  const outputPath = join(TMP_DIR, filename);

  await youtubeDlExec(url, {
    output: outputPath,
    format: 'worstaudio[ext=m4a]/worstvideo[ext=mp4]/worst',
    noCheckCertificates: true,
    noWarnings: true,
    noPlaylist: true,
  });

  return outputPath;
}
