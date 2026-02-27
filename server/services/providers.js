import Groq from 'groq-sdk';

export function createGroqClient(apiKey) {
  return new Groq({ apiKey });
}

export async function chatWithGroq(client, messages, model = 'llama-3.3-70b-versatile') {
  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.1,
    max_tokens: 4096,
  });
  return response.choices[0].message.content;
}

export async function chatWithClaude(apiKey, messages, model = 'claude-sonnet-4-20250514') {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: messages.map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function chatWithOpenAI(apiKey, messages, model = 'gpt-4o-mini') {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function chat(provider, apiKey, messages) {
  switch (provider) {
    case 'groq': {
      const client = createGroqClient(apiKey);
      return chatWithGroq(client, messages);
    }
    case 'claude':
      return chatWithClaude(apiKey, messages);
    case 'openai':
      return chatWithOpenAI(apiKey, messages);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
