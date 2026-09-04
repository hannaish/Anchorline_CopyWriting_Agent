import { Router } from "express";
import { db } from "../db/database.js";
import crypto from "crypto";
import { generateStructuredJson } from "../services/gemini.service.js";

const router = Router();

// Get all voice profiles
router.get("/", (req, res) => {
  const profiles = db.prepare("SELECT * FROM voice_profiles ORDER BY created_at DESC").all();
  const parsed = profiles.map((p: any) => ({
    ...p,
    metrics: JSON.parse(p.metrics || "{}"),
  }));
  res.json({ profiles: parsed });
});

// Set active voice profile
router.post("/set-active", (req, res) => {
  const { id } = req.body;
  db.prepare("UPDATE voice_profiles SET is_active = 0").run();
  db.prepare("UPDATE voice_profiles SET is_active = 1 WHERE id = ?").run(id);
  res.json({ success: true, activeId: id });
});

// Analyze user writing sample via Gemini and synthesize Voice Profile
router.post("/analyze", async (req, res) => {
  const { name, sampleText } = req.body;

  if (!sampleText || sampleText.length < 50) {
    return res.status(400).json({ error: "Please provide at least 50 characters of writing sample." });
  }

  const prompt = `
You are an expert stylometric linguist and copywriting psychologist.
Analyze the following writing sample provided by the user:

USER WRITING SAMPLE:
"""
${sampleText}
"""

Extract the unique human style fingerprints:
1. sentenceLength: (e.g. "Short & staccato (7-12 words)", "Balanced cadence")
2. vocabulary: (e.g. "Direct, visceral, anti-corporate", "Sophisticated & analytical")
3. rhythm: (e.g. "Rapid-fire pattern interrupts", "Poetic narrative flow")
4. tone: (e.g. "Unapologetic, high-conviction", "Empathetic & encouraging")
5. emotionalIntensity: (e.g. "Controlled burn", "High-energy urgency", "Vulnerable & reflective")
6. storytellingStyle: (e.g. "In media res personal anecdotes", "Objective case breakdowns")
7. useOfQuestions: (e.g. "Frequent rhetorical probes", "Occasional closing debate catalyst")
8. useOfMetaphors: (e.g. "Mechanical & athletic analogies", "Everyday life relatable examples")
9. ctaStyle: (e.g. "Low-friction conversation opener", "Challenging question")
10. formatting: (e.g. "Heavy 1-line whitespace", "Bulleted lists with concise anchors")
11. personalityArchetype: (e.g. "Relentless Practitioner", "Contrarian Truth-Teller", "Warm Strategic Mentor")
12. summaryDescription: 1-2 sentence overview of how to reproduce this voice faithfully.

Return strictly in this JSON format:
{
  "sentenceLength": "...",
  "vocabulary": "...",
  "rhythm": "...",
  "tone": "...",
  "emotionalIntensity": "...",
  "storytellingStyle": "...",
  "useOfQuestions": "...",
  "useOfMetaphors": "...",
  "ctaStyle": "...",
  "formatting": "...",
  "personalityArchetype": "...",
  "summaryDescription": "..."
}
`;

  try {
    const analysis = await generateStructuredJson<any>(prompt, {
      actionType: "voice_profile_analysis",
      temperature: 0.5,
    });

    const profileId = "voice_" + crypto.randomUUID().slice(0, 8);
    const profileName = name || `${analysis.personalityArchetype || "Custom Voice"} (${new Date().toLocaleDateString()})`;

    db.prepare(`
      INSERT INTO voice_profiles (id, name, description, metrics, is_active)
      VALUES (?, ?, ?, ?, 0)
    `).run(
      profileId,
      profileName,
      analysis.summaryDescription || `Synthesized custom profile based on sample writing analysis.`,
      JSON.stringify(analysis)
    );

    res.json({
      success: true,
      profile: {
        id: profileId,
        name: profileName,
        metrics: analysis,
        is_active: 0,
      },
    });
  } catch (err: any) {
    console.error("[Voice Analysis Error]", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
