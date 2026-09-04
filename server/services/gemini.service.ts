import { GoogleGenAI } from "@google/genai";
import { CONFIG } from "../config.js";
import { db } from "../db/database.js";
import crypto from "crypto";

// Server-side singleton client
let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = CONFIG.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  systemInstruction?: string;
  actionType?: string;
}

/**
 * Robust JSON generator using Gemini with automatic markdown fence stripping and fallback
 */
export async function generateStructuredJson<T>(
  prompt: string,
  options: GenerateOptions = {}
): Promise<T> {
  const modelsToTry = [
    options.model || CONFIG.FAST_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-flash-latest"
  ];

  let lastError: any = null;
  const start = Date.now();

  for (const model of modelsToTry) {
    try {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: options.temperature ?? 0.7,
          systemInstruction: options.systemInstruction || "You are an elite copywriting intelligence engine. Always respond in strictly valid JSON without markdown wrapping or commentary unless specifically instructed.",
        },
      });

      const rawText = response.text ? response.text.trim() : "{}";
      const latencyMs = Date.now() - start;

      // Extract JSON from response if wrapped in codeblocks
      let cleaned = rawText;
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      }

      const parsed: T = JSON.parse(cleaned);

      // Log success to generation_history
      try {
        db.prepare(`
          INSERT INTO generation_history (id, action_type, prompt_name, model, latency_ms, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          "gen_" + crypto.randomUUID().slice(0, 8),
          options.actionType || "gemini_call",
          model,
          model,
          latencyMs,
          "success"
        );
      } catch (dbErr) {
        // ignore log error
      }

      return parsed;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Service] Model ${model} failed: ${err.message}. Trying next fallback...`);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}

/**
 * Simple text generator
 */
export async function generateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const model = options.model || CONFIG.FAST_MODEL;
  const ai = getClient();
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: options.temperature ?? 0.7,
      systemInstruction: options.systemInstruction,
    },
  });

  return response.text ? response.text.trim() : "";
}
