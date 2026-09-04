import { Router } from "express";
import { db } from "../db/database.js";
import { generateStructuredJson } from "../services/gemini.service.js";

const router = Router();

// Get curated/seeded hooks with category filter
router.get("/browse", (req, res) => {
  const { category, search } = req.query;
  let sql = "SELECT * FROM hooks WHERE 1=1";
  const params: any[] = [];

  if (category && category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }

  if (search) {
    sql += " AND template LIKE ?";
    params.push(`%${search}%`);
  }

  sql += " ORDER BY category ASC, created_at DESC LIMIT 100";
  const hooks = db.prepare(sql).all(...params);
  res.json({ hooks });
});

// Generate 10 scored hooks via Gemini
router.post("/generate", async (req, res) => {
  const { topic, audience, platform, goal } = req.body;

  const prompt = `
You are the world's most elite viral copywriter and scroll-stopping hook engineer.
Topic: "${topic || "Business Growth"}"
Target Audience: "${audience || "Founders & Creators"}"
Platform: "${platform || "LinkedIn"}"
Goal: "${goal || "High Engagement & Scroll-Stopping"}"

Generate exactly 10 original, highly persuasive hooks.
Hook categories must include a variety of:
- Contrarian
- Transformation / Specific Result
- Story / Confession
- Pattern Interrupt
- Educational / Cheat Code
- Bold Claim
- Comparison
- Mistake / Warning
- Secret / Insider Gatekeep
- Direct Question / Challenge

Score every hook from 0 to 100 on these 7 criteria:
1. curiosity (0-100)
2. clarity (0-100)
3. specificity (0-100)
4. emotionalImpact (0-100)
5. audienceRelevance (0-100)
6. patternInterruption (0-100)
7. scrollStoppingPotential (0-100)
Calculate the weighted "total" score (0-100).
Mark the top 3 highest scoring hooks with "isTop3": true, and the remaining with "isTop3": false.

Return JSON in this EXACT schema:
{
  "hooks": [
    {
      "id": "h_1",
      "category": "Contrarian",
      "text": "...",
      "scores": {
        "curiosity": 94,
        "clarity": 90,
        "specificity": 92,
        "emotionalImpact": 88,
        "audienceRelevance": 95,
        "patternInterruption": 96,
        "scrollStoppingPotential": 94,
        "total": 93
      },
      "isTop3": true
    }
  ]
}
`;

  try {
    const result = await generateStructuredJson<{ hooks: any[] }>(prompt, {
      actionType: "hook_generation",
      temperature: 0.8,
    });

    res.json({
      topic,
      audience,
      platform,
      goal,
      hooks: result.hooks || [],
      top3: (result.hooks || []).filter((h: any) => h.isTop3),
    });
  } catch (err: any) {
    console.error("[Hooks Route Error]", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
