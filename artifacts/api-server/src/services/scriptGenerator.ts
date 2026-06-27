import { routeToAI } from "./aiRouter.js";

export interface GeneratedScript {
  id: number;
  hookType: string;
  hook: string;
  body: string;
  cta: string;
  visualCues: string;
  hashtags: string[];
}

export interface GenerationResult {
  scripts: GeneratedScript[];
  modelUsed: string;
}

function buildPrompt(
  userInput: string,
  contentType: string,
  language: string,
  tone: string
): string {
  return `You are an expert viral content strategist and short-form video script writer.

Input provided: ${userInput}
Content type: ${contentType}
Target platform: TikTok, Instagram Reels, YouTube Shorts
Output language: ${language}
Tone: ${tone}

Generate exactly 5 unique viral short-form video scripts. Each script must have:

1. HOOK (first 3 seconds - must stop scroll)
2. BODY (core content, 30-45 seconds)
3. CTA (call to action, last 5 seconds)
4. VISUAL CUES (editing notes for each section)
5. HASHTAGS (10 relevant trending hashtags)
6. HOOK TYPE (e.g., Question Hook, Controversy Hook, Story Hook, Statistics Hook, Curiosity Hook)

IMPORTANT: Respond with ONLY valid JSON, no markdown, no code blocks, no extra text.

{
  "scripts": [
    {
      "id": 1,
      "hookType": "Question Hook",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "visualCues": "...",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
    },
    {
      "id": 2,
      "hookType": "Statistics Hook",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "visualCues": "...",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
    },
    {
      "id": 3,
      "hookType": "Story Hook",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "visualCues": "...",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
    },
    {
      "id": 4,
      "hookType": "Controversy Hook",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "visualCues": "...",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
    },
    {
      "id": 5,
      "hookType": "Curiosity Hook",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "visualCues": "...",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
    }
  ]
}`;
}

function parseScripts(raw: string): GeneratedScript[] {
  // Strip markdown code blocks if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  const parsed = JSON.parse(cleaned) as { scripts: GeneratedScript[] };

  if (!Array.isArray(parsed.scripts)) {
    throw new Error("AI response did not contain a scripts array");
  }

  return parsed.scripts.map((s, i) => ({
    id: s.id ?? i + 1,
    hookType: s.hookType ?? "Hook",
    hook: s.hook ?? "",
    body: s.body ?? "",
    cta: s.cta ?? "",
    visualCues: s.visualCues ?? "",
    hashtags: Array.isArray(s.hashtags) ? s.hashtags : [],
  }));
}

export async function generateScripts(
  userInput: string,
  contentType: string,
  language: string = "English",
  tone: string = "Viral & Energetic"
): Promise<GenerationResult> {
  const prompt = buildPrompt(userInput, contentType, language, tone);
  const { text, modelUsed } = await routeToAI(prompt);

  try {
    const scripts = parseScripts(text);
    return { scripts, modelUsed };
  } catch (parseErr: unknown) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    throw new Error(`Failed to parse AI response: ${msg}. Raw: ${text.slice(0, 200)}`);
  }
}
