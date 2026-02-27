import { chat } from './providers.js';

const SYSTEM_PROMPT = `You are a professional fact-checker. Analyze the following transcript from a short-form video (TikTok/Instagram Reel).

Your job:
1. Identify every factual claim made in the transcript
2. Evaluate each claim as TRUE, FALSE, MISLEADING, or UNVERIFIABLE
3. Provide a brief explanation for each verdict
4. Give an overall truth score from 0 to 100

Respond ONLY with valid JSON in this exact format:
{
  "truthScore": <number 0-100>,
  "verdict": "<one of: Accurate, Mostly Accurate, Mixed, Mostly False, False>",
  "summary": "<2-3 sentence overall assessment>",
  "claims": [
    {
      "claim": "<the specific claim made>",
      "verdict": "<TRUE | FALSE | MISLEADING | UNVERIFIABLE>",
      "explanation": "<brief explanation with reasoning>"
    }
  ]
}

If the transcript contains no factual claims (e.g., it's just music or personal opinions), return:
{
  "truthScore": null,
  "verdict": "No Factual Claims",
  "summary": "This video does not contain verifiable factual claims.",
  "claims": []
}`;

export async function factCheck(transcript, provider, apiKey) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Transcript:\n\n${transcript}` },
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
