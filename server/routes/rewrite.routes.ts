import { Router } from "express";
import { generateStructuredJson } from "../services/gemini.service.js";

const router = Router();

router.post("/analyze-and-improve", async (req, res) => {
  const { content, targetPlatform, tone } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required for rewriting" });
  }

  const prompt = `
You are a master copy editor, content critic, and viral copywriter.
Analyze the following user-submitted draft for ${targetPlatform || "LinkedIn"} in a ${tone || "Bold & Contrarian"} tone:

DRAFT TO AUDIT:
"""
${content}
"""

TASKS:
1. Score the current draft objectively from 0 to 100 based on scroll-stopping hook, specificity, emotional resonance, and conversational CTA.
2. Identify 2-3 specific things that are working well.
3. Identify 3-4 clear weaknesses (e.g. passive openings, corporate buzzwords, wall of text, lack of tension, weak CTA).
4. Craft an upgraded, magnetic hook.
5. Define the ideal structural flow.
6. Completely rewrite the post to achieve an elite quality score (90+).
   - Use punchy, mobile-friendly 1-2 line paragraphs.
   - Eliminate clichés like "In today's world" or "Unlock your potential".
   - Inject conversational tension and specificity.
7. Craft a high-conversion call to action.
8. Score the improved copy (should be 90-98).

Return strictly valid JSON:
{
  "currentScore": 65,
  "improvedScore": 94,
  "whatsWorking": ["...", "..."],
  "whatsWeak": ["...", "...", "..."],
  "betterHook": "...",
  "betterStructure": "...",
  "improvedCopy": "...",
  "betterCta": "..."
}
`;

  try {
    const analysis = await generateStructuredJson<any>(prompt, {
      actionType: "rewrite_and_critique",
      temperature: 0.8,
    });

    res.json({ analysis });
  } catch (err: any) {
    console.error("[Rewrite Error]", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
