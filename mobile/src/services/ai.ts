import { AI_PROVIDERS, AIProvider } from '../constants/providers';
import { MoodType } from '../constants/moods';
import { getApiKey, getItem, SK } from '../storage/storage';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function getActiveProvider(): Promise<AIProvider> {
  const providerId = await getItem<string>(SK.provider);
  const provider = AI_PROVIDERS.find((p) => p.id === providerId) ?? AI_PROVIDERS[0];
  return provider;
}

async function getActiveModel(): Promise<string> {
  const model = await getItem<string>(SK.model);
  return model ?? '';
}

export async function callAI(
  messages: AIMessage[],
  systemPrompt: string,
  onChunk: (text: string) => void,
  maxTokens = 1024,
): Promise<string> {
  const provider = await getActiveProvider();
  const model = (await getActiveModel()) || provider.defaultModel;
  const apiKey = provider.local ? 'ollama' : (await getApiKey(provider.id)) ?? '';

  if (provider.id === 'anthropic') {
    return callAnthropic(messages, systemPrompt, apiKey, model, provider.apiUrl, onChunk, maxTokens);
  } else if (provider.id === 'gemini') {
    return callGemini(messages, systemPrompt, apiKey, model, provider.apiUrl, onChunk, maxTokens);
  } else {
    return callOpenAIFormat(messages, systemPrompt, apiKey, model, provider.apiUrl, onChunk, maxTokens);
  }
}

async function callAnthropic(
  messages: AIMessage[],
  system: string,
  apiKey: string,
  model: string,
  apiUrl: string,
  onChunk: (text: string) => void,
  maxTokens: number,
): Promise<string> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages, stream: true }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  return readSSEStream(response, onChunk, (line) => {
    if (!line.startsWith('data: ')) return null;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
        return data.delta.text;
      }
    } catch {}
    return null;
  });
}

async function callOpenAIFormat(
  messages: AIMessage[],
  system: string,
  apiKey: string,
  model: string,
  apiUrl: string,
  onChunk: (text: string) => void,
  maxTokens: number,
): Promise<string> {
  const allMessages = [{ role: 'system', content: system }, ...messages];
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: allMessages, stream: true }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${response.status} ${err}`);
  }

  return readSSEStream(response, onChunk, (line) => {
    if (!line.startsWith('data: ')) return null;
    const raw = line.slice(6).trim();
    if (raw === '[DONE]') return null;
    try {
      const data = JSON.parse(raw);
      return data.choices?.[0]?.delta?.content ?? null;
    } catch {}
    return null;
  });
}

async function callGemini(
  messages: AIMessage[],
  system: string,
  apiKey: string,
  model: string,
  baseUrl: string,
  onChunk: (text: string) => void,
  maxTokens: number,
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `${baseUrl}/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  return readSSEStream(response, onChunk, (line) => {
    if (!line.startsWith('data: ')) return null;
    try {
      const data = JSON.parse(line.slice(6));
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch {}
    return null;
  });
}

async function readSSEStream(
  response: Response,
  onChunk: (text: string) => void,
  parseLine: (line: string) => string | null,
): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const chunk = parseLine(line);
      if (chunk) {
        full += chunk;
        onChunk(chunk);
      }
    }
  }
  return full;
}

export async function callAIOnce(
  messages: AIMessage[],
  systemPrompt: string,
  maxTokens = 512,
): Promise<string> {
  let result = '';
  await callAI(messages, systemPrompt, (chunk) => { result += chunk; }, maxTokens);
  return result;
}

export async function testApiKey(apiKey: string, providerId: string): Promise<boolean> {
  const provider = AI_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return false;
  if (provider.local) return true;

  try {
    if (providerId === 'anthropic') {
      const res = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: provider.defaultModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      return res.status !== 401 && res.status !== 403;
    } else if (providerId === 'gemini') {
      const model = provider.defaultModel;
      const res = await fetch(
        `${provider.apiUrl}/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] }),
        },
      );
      return res.status !== 400 && res.status !== 403;
    } else {
      const res = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.defaultModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      return res.status !== 401 && res.status !== 403;
    }
  } catch {
    return false;
  }
}

export async function detectMood(
  question: string,
  prevMoods: MoodType[],
): Promise<{ mood: MoodType; confidence: number }> {
  const system = `You are a mood detection system. Given an interview question and prior mood history, output ONLY a JSON object with "mood" (one of: positive, neutral, skeptical, engaged, disengaged, pressuring) and "confidence" (0-1). No other text.`;
  const context = prevMoods.length
    ? `Prior moods: ${prevMoods.slice(-3).join(', ')}.`
    : 'No prior moods.';
  const content = `${context}\n\nQuestion: "${question}"`;

  try {
    const raw = await callAIOnce([{ role: 'user', content }], system, 64);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.mood && typeof parsed.confidence === 'number') {
        return { mood: parsed.mood as MoodType, confidence: parsed.confidence };
      }
    }
  } catch {}
  return { mood: 'neutral', confidence: 0.5 };
}

export async function generateScript(
  questionType: string,
  profile: Record<string, unknown>,
  jobTitle: string,
  company: string,
  jobDesc: string,
  personaSystemPrompt: string,
  additionalContext: string,
): Promise<string> {
  const profileSummary = buildProfileSummary(profile);
  const system = `${personaSystemPrompt}\n\nYou generate interview scripts tailored to the candidate's background. Be specific, authentic, and compelling. Output only the script text, no meta-commentary.`;

  const prompt = [
    profileSummary && `Candidate profile:\n${profileSummary}`,
    jobTitle && `Role: ${jobTitle}`,
    company && `Company: ${company}`,
    jobDesc && `Job description:\n${jobDesc}`,
    additionalContext && `Additional context:\n${additionalContext}`,
    `\nGenerate a compelling answer to: "${questionTypeLabel(questionType)}"`,
  ]
    .filter(Boolean)
    .join('\n\n');

  let result = '';
  await callAI([{ role: 'user', content: prompt }], system, (c) => { result += c; }, 2048);
  return result;
}

function buildProfileSummary(profile: Record<string, unknown>): string {
  const parts: string[] = [];
  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (profile.title) parts.push(`Title: ${profile.title}`);
  if (profile.summary) parts.push(`Summary: ${profile.summary}`);
  if (profile.strengths) parts.push(`Strengths: ${profile.strengths}`);
  if (profile.background) parts.push(`Background: ${profile.background}`);
  return parts.join('\n');
}

function questionTypeLabel(id: string): string {
  const map: Record<string, string> = {
    intro: 'Tell me about yourself',
    strengths: 'What are your greatest strengths?',
    weaknesses: 'What are your weaknesses?',
    whyrole: 'Why are you interested in this role?',
    whycompany: 'Why do you want to work here?',
    challenge: 'Tell me about a challenge you faced at work',
    salary: 'What are your salary requirements?',
    fiveyears: 'Where do you see yourself in 5 years?',
    mistake: 'Tell me about a time you made a mistake',
    leaving: 'Why are you leaving your current job?',
    priority: 'How do you prioritize your work?',
    company: 'What do you know about our company?',
    motivation: 'Why do you want to work for us? (full version)',
    closing: 'Do you have any closing statement?',
    full: 'Full interview script (2-3 minutes)',
  };
  return map[id] ?? id;
}
