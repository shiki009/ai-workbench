import { readFile } from 'node:fs/promises';
import { createGroqClient } from './providers.js';

const OCR_PROMPT = `Look at these video frames and extract ALL visible text — captions, overlays, text stickers, subtitles, anything written on screen.

Return ONLY the extracted text, one line per distinct text element. If the same text appears in multiple frames, include it only once. If there is no visible text, respond with "NO_TEXT".`;

export async function readOnScreenText(framePaths, apiKey) {
  const client = createGroqClient(apiKey);

  // Build image content parts from frames (base64)
  const imageParts = await Promise.all(
    framePaths.map(async (path) => {
      const data = await readFile(path);
      const base64 = data.toString('base64');
      return {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
        },
      };
    })
  );

  const response = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: OCR_PROMPT },
          ...imageParts,
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });

  const text = response.choices[0].message.content.trim();
  if (text === 'NO_TEXT') return null;
  return text;
}
