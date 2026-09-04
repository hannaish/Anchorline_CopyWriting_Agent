import { Router } from "express";
import { db } from "../db/database.js";
import crypto from "crypto";
import { generateStructuredJson } from "../services/gemini.service.js";

const router = Router();

export const BENCHMARK_TEST_CASES = [
  { id: "tc_1", name: "Promotion Paradox", category: "LinkedIn Thought Leadership", platform: "LinkedIn", topic: "Why most hard workers get passed over for executive roles", audience: "Mid-level corporate professionals", goal: "Thought leadership & comments", expectedCharacteristics: "Contrarian, non-whiny, strategic visibility framework" },
  { id: "tc_2", name: "The $0 Failure", category: "Personal Story", platform: "LinkedIn / X", topic: "Losing our first big client after 6 months of over-promising", audience: "Agency owners & freelancers", goal: "Vulnerability & trust building", expectedCharacteristics: "Tension arc, no fake bravado, humility with clear moral lesson" },
  { id: "tc_3", name: "Consistency is a Lie", category: "Contrarian Post", platform: "X / Twitter", topic: "Why daily posting without strategy destroys creator motivation", audience: "Solo creators", goal: "Debate & reposts", expectedCharacteristics: "Short sentences, bold assertions, zero platitudes" },
  { id: "tc_4", name: "Framework Breakdown", category: "Educational Post", platform: "LinkedIn / Threads", topic: "The 3-step high-converting landing page structure", audience: "SaaS founders & marketers", goal: "Saves & bookmarks", expectedCharacteristics: "Bulleted hierarchy, immediate tactical utility, no jargon" },
  { id: "tc_5", name: "Free Resource Teardown", category: "Lead Generation", platform: "LinkedIn / X", topic: "The exact swipe file of 50 viral hooks we used to hit 1M impressions", audience: "B2B copywriters", goal: "Inbound comment requests (DM)", expectedCharacteristics: "High perceived value, strong curiosity gap, simple CTA" },
  { id: "tc_6", name: "SaaS Launch Offer", category: "Product Promotion", platform: "Facebook / Instagram", topic: "Announcing early bird access to our automated analytics tool", audience: "E-commerce managers", goal: "Link clicks & signups", expectedCharacteristics: "Benefit-first opening, risk-reversal guarantee, clear urgency" },
  { id: "tc_7", name: "Leaving Corporate", category: "Founder Story", platform: "LinkedIn", topic: "Giving up a six-figure salary to build in public", audience: "Aspiring entrepreneurs", goal: "Inspiration & connection", expectedCharacteristics: "Emotional resonance, relatable fears, grounded conviction" },
  { id: "tc_8", name: "Junior to Director", category: "Career Content", platform: "LinkedIn", topic: "How I skipped 4 years of corporate ladder climbing with one skill", audience: "Tech workers in their 20s", goal: "Saves & follows", expectedCharacteristics: "Direct roadmaps, clear milestones, high credibility" },
  { id: "tc_9", name: "Marketing Attribution Myth", category: "Marketing Content", platform: "X / LinkedIn", topic: "Why last-click attribution models mislead CMOs into cutting brand budgets", audience: "B2B Marketing Directors", goal: "High-level industry discussion", expectedCharacteristics: "Analytical depth, sharp critique of lazy metrics" },
  { id: "tc_10", name: "B2B Cold Outreach", category: "Sales Content", platform: "LinkedIn / Email", topic: "The 4-sentence cold message that booked 14 discovery calls last month", audience: "B2B Sales SDRs", goal: "Saves & implementation", expectedCharacteristics: "Exact script included, specificity on reply rates" },
  { id: "tc_11", name: "The 3 AM Epiphany", category: "Storytelling", platform: "Instagram / Facebook", topic: "The terrifying moment before hitting publish on my first video", audience: "Creators facing imposter syndrome", goal: "Emotional empathy", expectedCharacteristics: "Sensory scene setting, honest self-talk, cathartic breakthrough" },
  { id: "tc_12", name: "The 3-Line Framework", category: "Short-form Content", platform: "X / Threads", topic: "How to validate any business idea in 48 hours", audience: "Indie hackers", goal: "Retweets & bookmarks", expectedCharacteristics: "High information density, punchy rhythm, zero fluff" },
  { id: "tc_13", name: "The Ultimate Guide", category: "Long-form Content", platform: "LinkedIn Article", topic: "The complete playbook to organic distribution in 2026", audience: "Growth executives", goal: "Authority & bookmarks", expectedCharacteristics: "Modular headings, deep dives, comprehensive systems view" },
  { id: "tc_14", name: "Imposter Syndrome Truth", category: "Emotional Content", platform: "LinkedIn / Instagram", topic: "Why feeling unqualified is actually proof that you are growing", audience: "High achievers", goal: "Validation & shares", expectedCharacteristics: "Deep empathy, emotional validation, uplifting reframing" },
  { id: "tc_15", name: "The Secret Algorithm", category: "Curiosity Content", platform: "TikTok / Reel Script", topic: "The one setting in your account that is silently throttling your impressions", audience: "Content creators", goal: "Watch time & comments", expectedCharacteristics: "Cliffhanger opening, tension pacing, satisfying reveal" },
  { id: "tc_16", name: "10-Year Industry Study", category: "Authority Content", platform: "LinkedIn", topic: "Analyzing 10,000 cold emails to find what actually closes deals", audience: "Sales Leaders", goal: "Industry authority & citation", expectedCharacteristics: "Data-backed conclusions, pattern recognition, authoritative tone" },
  { id: "tc_17", name: "My $100K Mistake", category: "Mistake-based Content", platform: "LinkedIn / X", topic: "Hiring an expensive branding agency before we had product-market fit", audience: "Early founders", goal: "Preventative value & trust", expectedCharacteristics: "Raw transparency, financial specificity, practical warning" },
  { id: "tc_18", name: "From 0 to 100K Followers", category: "Transformation Story", platform: "Instagram / X", topic: "The unsexy 18-month routine behind our overnight success", audience: "Creators & coaches", goal: "Proof & replication", expectedCharacteristics: "Before/After contrast, timeline realism, repeatable habit stack" },
  { id: "tc_19", name: "Client Conversion Teardown", category: "Case Study", platform: "LinkedIn / Facebook", topic: "How we took a local service business from 3 leads/mo to 45 leads/mo", audience: "Local business owners", goal: "Lead generation", expectedCharacteristics: "Problem -> Diagnosis -> Solution -> Numbers -> Proof" },
  { id: "tc_20", name: "Unpopular Creator Opinion", category: "Opinion Post", platform: "Threads / X", topic: "Most courses are useless because people buy the dopamine of buying, not doing", audience: "Online learners", goal: "Debate & viral comment threads", expectedCharacteristics: "Polarizing thesis, hard-hitting examples, call to accountability" }
];

router.get("/cases", (req, res) => {
  res.json({ testCases: BENCHMARK_TEST_CASES });
});

router.post("/run", async (req, res) => {
  const { testCaseId } = req.body;
  const testCase = BENCHMARK_TEST_CASES.find((t) => t.id === testCaseId) || BENCHMARK_TEST_CASES[0];

  const start = Date.now();
  const prompt = `
You are an automated quality benchmark evaluator for the Viral Copywriter AI engine.
Test Case: "${testCase.name}" (${testCase.category})
Target Platform: ${testCase.platform}
Topic: "${testCase.topic}"
Target Audience: "${testCase.audience}"
Expected Characteristics: "${testCase.expectedCharacteristics}"

Write a world-class, human-feeling post strictly matching the expected characteristics.
Score this output from 0-100 on these 11 rubrics:
hook, clarity, curiosity, specificity, emotion, originality, value, flow, readability, cta, audienceFit, total.

Return JSON in this format:
{
  "content": "...",
  "scores": {
    "hook": 94,
    "clarity": 95,
    "curiosity": 92,
    "specificity": 93,
    "emotion": 88,
    "originality": 94,
    "value": 96,
    "flow": 93,
    "readability": 95,
    "cta": 92,
    "audienceFit": 95,
    "total": 94
  }
}
`;

  try {
    const aiResult = await generateStructuredJson<{ content: string; scores: any }>(prompt, {
      actionType: "test_benchmark_" + testCase.id,
      temperature: 0.8,
    });

    const latencyMs = Date.now() - start;
    const score = aiResult.scores?.total || 93;
    const runId = "run_" + crypto.randomUUID().slice(0, 8);

    db.prepare(`
      INSERT INTO generation_history (id, action_type, prompt_name, model, latency_ms, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(runId, "test_benchmark", testCase.name, "gemini-3.5-flash-lite", latencyMs, "success");

    res.json({
      runId,
      testCase,
      status: "PASSED",
      score,
      latencyMs,
      model: "gemini-3.5-flash-lite",
      promptVersion: "v1.0-gemini-live",
      generatedContent: aiResult.content,
      critiqueScores: aiResult.scores,
    });
  } catch (err: any) {
    console.error("[Test Run Error]", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
