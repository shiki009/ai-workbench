import { createReadStream } from 'node:fs';
import { createGroqClient } from './providers.js';

export async function transcribeAudio(filePath, apiKey) {
  const client = createGroqClient(apiKey);

  const transcription = await client.audio.transcriptions.create({
    file: createReadStream(filePath),
    model: 'whisper-large-v3-turbo',
    response_format: 'text',
  });

  return transcription;
}
