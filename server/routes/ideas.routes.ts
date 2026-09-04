import { Router } from "express";
import { generateStructuredJson } from "../services/gemini.service.js";

const router = Router();

router.post("/generate", async (req, res) => {
  const { niche, audience, goal } = req.body;

  const prompt = `
You are a viral content strategist and ideation machine.
Generate exactly 20 distinct, high-performing content ideas for:
- Niche: ${niche || "B2B SaaS Growth"}
- Target Audience: ${audience || "Founders & Marketers"}
- Core Goal: ${goal || "Inbound Leads & Authority"}

For each idea, provide:
- number (1 to 20)
- topic: specific, compelling angle topic
- angle: (e.g. Contrarian, Pain-based, Story-driven, Educational, Identity-based, Curiosity-driven, Fear of loss, Transformation, Unexpected insight, Personal experience)
- hook: A magnetic, scroll-stopping opening line
- emotionalTrigger: (e.g. Loss Aversion, Status Anxiety, Relief, Validation, Belonging, FOMO)
- format: (e.g. LinkedIn Carousel, X Thread, Instagram Reel Script, Single-Image Breakdown, Personal Essay Post)
- whyItCouldWork: Concise explanation of the psychological mechanism
- cta: Low-friction platform action

Return JSON strictly in this format:
{
  "ideas": [
    {
      "id": "idea_1",
      "number": 1,
      "topic": "...",
      "angle": "...",
      "hook": "...",
      "emotionalTrigger": "...",
      "format": "...",
      "whyItCouldWork": "...",
      "cta": "..."
    }
  ]
}
`;

  try {
    const result = await generateStructuredJson<{ ideas: any[] }>(prompt, {
      actionType: "idea_generation_20",
      temperature: 0.85,
    });

    res.json({
      niche: niche || "B2B SaaS Growth",
      audience: audience || "Founders & Marketers",
      goal: goal || "Inbound Leads & Authority",
      count: result.ideas?.length || 0,
      ideas: result.ideas || [],
    });
  } catch (err: any) {
    console.error("[Ideas Error]", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
