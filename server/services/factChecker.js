import { chat } from './providers.js';

const SYSTEM_PROMPT = `You are a professional fact-checker. Analyze the following content from a short-form video (TikTok/Instagram Reel).

You will receive:
- An audio transcript (what was spoken)
- On-screen text (captions, overlays, text stickers visible in the video) — if available

Your job:
1. Identify every factual claim from BOTH the spoken transcript AND the on-screen text
2. Evaluate each claim as TRUE, FALSE, MISLEADING, or UNVERIFIABLE
3. Indicate whether the claim came from "audio", "on-screen", or "both"
4. Provide a brief explanation for each verdict
5. For claims you can verify, add up to 2 "sources" URLs (fact-check sites, news articles). Omit or use [] if none
6. Give an overall truth score from 0 to 100

Respond ONLY with valid JSON in this exact format:
{
  "truthScore": <number 0-100>,
  "verdict": "<one of: Accurate, Mostly Accurate, Mixed, Mostly False, False>",
  "summary": "<2-3 sentence overall assessment>",
  "claims": [
    {
      "claim": "<the specific claim made>",
      "source": "<audio | on-screen | both>",
      "verdict": "<TRUE | FALSE | MISLEADING | UNVERIFIABLE>",
      "explanation": "<brief explanation with reasoning>",
      "sources": ["<optional URL to fact-check or news article>", "<optional second URL>"]
    }
  ]
}

If there are no factual claims in either source, return:
{
  "truthScore": null,
  "verdict": "No Factual Claims",
  "summary": "This video does not contain verifiable factual claims.",
  "claims": []
}`;

export async function factCheck(transcript, onScreenText, provider, apiKey) {
  let userContent = `Audio transcript:\n\n${transcript}`;
  if (onScreenText) {
    userContent += `\n\nOn-screen text:\n\n${onScreenText}`;
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];

  const response = await chat(provider, apiKey, messages);

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
  const jsonStr = jsonMatch[1].trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse fact-check response as JSON');
  }
}
