import { Router } from "express";
import { generateStructuredJson } from "../services/gemini.service.js";

const router = Router();

router.post("/atomize", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Source long-form content is required" });
  }

  const prompt = `
You are an omnichannel content repurposing strategist.
Take the following piece of long-form content and atomize it into platform-native assets:

SOURCE CONTENT:
"""
${content}
"""

GENERATE THE FOLLOWING:
1. 10 LinkedIn posts: Professional, thought leadership, short paragraphs, conversational CTAs.
2. 10 X / Twitter posts: Concise, punchy, contrarian, high information density.
3. 5 Instagram captions: Visual storytelling, relatable first line, save/share CTA.
4. 5 Threads: Casual, conversational, debate-sparking.
5. 5 Video Concepts: Title, Opening Hook, Visual Pacing, CTA.
6. 10 Hooks: High curiosity, pattern interrupt.
7. 5 Carousel Concepts: Title and 5 slide breakdowns.

Return strictly in this JSON format:
{
  "linkedInPosts": [{ "id": "li_1", "title": "...", "text": "..." }],
  "xPosts": [{ "id": "x_1", "text": "..." }],
  "instagramCaptions": [{ "id": "ig_1", "text": "..." }],
  "threads": [{ "id": "th_1", "text": "..." }],
  "videoConcepts": [{ "id": "vid_1", "title": "...", "hook": "...", "pacing": "...", "cta": "..." }],
  "hooks": [{ "id": "hook_1", "text": "...", "category": "..." }],
  "carouselConcepts": [{ "id": "car_1", "title": "...", "slides": ["Slide 1...", "Slide 2..."] }]
}
`;

  try {
    const result = await generateStructuredJson<any>(prompt, {
      actionType: "repurpose_atomize_40",
      temperature: 0.8,
    });

    res.json({ result });
  } catch (err: any) {
    console.error("[Repurpose Error]", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
