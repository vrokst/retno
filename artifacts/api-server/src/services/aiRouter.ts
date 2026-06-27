import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger.js";

interface AIResponse {
  text: string;
  modelUsed: string;
}

interface ModelConfig {
  name: string;
  call: (prompt: string) => Promise<string>;
}

function buildGeminiModel(modelName: string, apiVersion: "v1" | "v1beta" = "v1beta"): ModelConfig {
  return {
    name: modelName,
    call: async (prompt: string): Promise<string> => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not set");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
  };
}

function buildGroqModel(): ModelConfig {
  return {
    name: "groq/llama-3.3-70b-versatile",
    call: async (prompt: string): Promise<string> => {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY not set");
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 4096,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq error ${response.status}: ${err}`);
      }
      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      return data.choices[0].message.content;
    },
  };
}

function buildOpenRouterModel(): ModelConfig {
  return {
    name: "openrouter/meta-llama/llama-3-8b-instruct:free",
    call: async (prompt: string): Promise<string> => {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://retno.app",
          "X-Title": "Retno",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 4096,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter error ${response.status}: ${err}`);
      }
      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      return data.choices[0].message.content;
    },
  };
}

// v1beta supports both 1.5 and 2.0 models; v1 only supports 2.0+
const MODELS: ModelConfig[] = [
  buildGeminiModel("gemini-2.0-flash", "v1beta"),
  buildGeminiModel("gemini-2.0-flash-lite", "v1beta"),
  buildGeminiModel("gemini-2.0-flash-exp", "v1beta"),
  buildGeminiModel("gemini-1.5-flash", "v1beta"),
  buildGeminiModel("gemini-1.5-flash-8b", "v1beta"),
  buildGroqModel(),
  buildOpenRouterModel(),
];

function isRateLimitError(message: string): boolean {
  return (
    message.includes("429") ||
    message.toLowerCase().includes("rate limit") ||
    message.toLowerCase().includes("quota") ||
    message.includes("retry")
  );
}

function isSkippableError(message: string): boolean {
  return (
    isRateLimitError(message) ||
    message.includes("not set") ||
    message.includes("404") ||
    message.includes("not found")
  );
}

export async function routeToAI(prompt: string): Promise<AIResponse> {
  const errors: string[] = [];
  let anyRateLimit = false;

  for (const model of MODELS) {
    try {
      logger.info({ model: model.name }, "Trying AI model");
      const text = await model.call(prompt);
      logger.info({ model: model.name }, "AI model succeeded");
      return { text, modelUsed: model.name };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (isRateLimitError(message)) anyRateLimit = true;
      logger.warn({ model: model.name, error: message.slice(0, 200) }, "AI model failed, trying next");
      errors.push(`${model.name}: ${message.slice(0, 120)}`);
    }
  }

  const summary = anyRateLimit
    ? "High demand right now. Please try again in a moment."
    : "High demand right now. Please try again in a moment.";

  throw new Error(summary);
}
