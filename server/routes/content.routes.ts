import { Router } from "express";
import crypto from "crypto";
import { db } from "../db/database.js";
import { generateStructuredJson } from "../services/gemini.service.js";

const router = Router();

// Generate 5 distinct psychological versions with real Gemini API
router.post("/generate", async (req, res) => {
  const {
    topic,
    audience,
    niche,
    platform,
    goal,
    tone,
    emotion,
    offer,
    keyMessage,
    personalStory,
    cta,
    format,
  } = req.body;

  const prompt = `
You are the world's most elite, high-converting social media copywriter and content strategist.
Your task is to produce 5 distinct, psychologically compelling versions of a post for:
- Platform: ${platform || "LinkedIn"}
- Niche: ${niche || "Business"}
- Target Audience: ${audience || "Founders"}
- Topic / Premise: "${topic || "Growth"}"
- Goal: ${goal || "High Engagement & Conversions"}
- Voice Tone: ${tone || "Bold & Direct"}
- Desired Emotion: ${emotion || "Curiosity"}
- Key Message / Core Insight: "${keyMessage || ""}"
- Personal Story / Context: "${personalStory || "None provided"}"
- Offer / Product: "${offer || ""}"
- Call to Action: "${cta || ""}"
- Format: ${format || "Post"}

VIRAL COPYWRITING RULES:
1. NEVER use generic AI cliches ("In today's fast-paced world", "Unlock your potential", "Here are 5 tips", "Game changer").
2. The writing must feel authentically human, punchy, visually breathable (1-2 line paragraphs for mobile scanning).
3. If a personal story is provided, weave it naturally. If NO story is provided, DO NOT fabricate fake personal experiences.
4. Adapt strictly to the platform (${platform}):
   - LinkedIn: Thought leadership, professional but human, conversational CTA.
   - X / Twitter: Short, sharp, contrarian, high information density.
   - Instagram: Visual language, strong first line, relatable emotional pacing.
   - Threads: Casual, punchy, debate-sparking.

GENERATE EXACTLY 5 DISTINCT PSYCHOLOGICAL VERSIONS:
- Version 1: "Clear + Educational" (High density of tactical clarity, step-by-step framework, zero fluff)
- Version 2: "Bold + Contrarian" (Disrupts common myths, takes a polarizing stance against bad advice)
- Version 3: "Story-driven" (Narrative arc, tension, emotional breakthrough, relatable lessons)
- Version 4: "Curiosity-driven" (Unlocks a counter-intuitive secret, open loops, pattern interrupt)
- Version 5: "High-emotion" (Deep empathy, identity validation, cathartic realization)

For each version, evaluate and score on these 11 dimensions (0-100):
hook, clarity, curiosity, specificity, emotion, originality, value, flow, readability, cta, audienceFit, total.

Also provide a diagnostic CRITIQUE:
- overallSummary
- strengths (3 points)
- weaknesses (2 points)
- improvementSuggestions (2 points)

RETURN STRICTLY IN THIS JSON FORMAT:
{
  "versions": [
    {
      "id": "ver_1",
      "versionNumber": 1,
      "versionType": "Clear + Educational",
      "hook": "...",
      "angle": "...",
      "content": "...",
      "scores": {
        "hook": 93,
        "clarity": 96,
        "curiosity": 88,
        "specificity": 94,
        "emotion": 80,
        "originality": 90,
        "value": 96,
        "flow": 92,
        "readability": 95,
        "cta": 92,
        "audienceFit": 94,
        "total": 92
      }
    }
  ],
  "critique": {
    "overallSummary": "...",
    "strengths": ["...", "...", "..."],
    "weaknesses": ["...", "..."],
    "improvementSuggestions": ["...", "..."]
  }
}
`;

  try {
    const aiResult = await generateStructuredJson<{ versions: any[]; critique: any }>(prompt, {
      actionType: "content_generation_5_versions",
      temperature: 0.85,
    });

    const generationId = "gen_" + crypto.randomUUID().slice(0, 8);
    const versions = aiResult.versions || [];
    const critique = aiResult.critique || {
      overallSummary: "Copy generated with platform-native pacing.",
      strengths: ["Clean whitespace", "Strong hook tension"],
      weaknesses: ["Can add deeper numerical proof"],
      improvementSuggestions: ["Test variant on mobile"],
    };

    // Save into SQLite
    try {
      db.prepare(`
        INSERT INTO generated_content (
          id, user_id, request_params, retrieved_knowledge_ids,
          selected_hook, selected_angle, model_used, total_score, critique, improvement_iterations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        generationId,
        "default_user",
        JSON.stringify(req.body),
        JSON.stringify(["retrieved_swipe_1"]),
        versions[0]?.hook || "",
        versions[0]?.angle || "",
        "gemini-3.5-flash-lite",
        versions[0]?.scores?.total || 90,
        JSON.stringify(critique),
        1
      );
    } catch (saveErr) {
      console.warn("[Content Route Save Warning]", saveErr);
    }

    res.json({
      generationId,
      request: req.body,
      versions,
      critique,
    });
  } catch (err: any) {
    console.error("[Content Generation Error]", err);
    res.status(500).json({ error: err.message });
  }
});

// Quick action toolbar transforms
router.post("/transform", async (req, res) => {
  const { content, action } = req.body;

  const prompt = `
You are a master copywriting editor.
Take the following copy and perform this specific transformation: "${action}".

Action instructions:
- viral: Make it significantly more scroll-stopping, bold, and urgent with a sharp pattern interrupt.
- human: Strip away any stiff phrasing; make it feel like an authentic, vulnerable note from a peer in the trenches.
- emotional: Amplify the emotional stakes, visceral feelings, and identity validation.
- shorter: Condense by 35-50% into punchy, high-velocity bullet points without losing core punch.
- longer: Expand with deeper tactical nuance, concrete examples, and strategic explanation.

Original content:
"""
${content}
"""

Return JSON in this format:
{
  "transformedContent": "...",
  "note": "Brief explanation of what was changed",
  "newScore": 95
}
`;

  try {
    const result = await generateStructuredJson<{ transformedContent: string; note: string; newScore: number }>(prompt, {
      actionType: "content_transform_" + action,
      temperature: 0.75,
    });

    res.json(result);
  } catch (err: any) {
    console.error("[Transform Error]", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
