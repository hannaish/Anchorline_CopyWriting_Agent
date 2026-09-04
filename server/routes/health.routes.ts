import { Router } from "express";
import { CONFIG } from "../config.js";
import { db } from "../db/database.js";

const router = Router();

router.get("/health", (req, res) => {
  try {
    const hookCount = db.prepare("SELECT COUNT(*) as count FROM hooks").get() as { count: number };
    const docCount = db.prepare("SELECT COUNT(*) as count FROM documents").get() as { count: number };
    const voiceCount = db.prepare("SELECT COUNT(*) as count FROM voice_profiles").get() as { count: number };
    const genCount = db.prepare("SELECT COUNT(*) as count FROM generated_content").get() as { count: number };

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      models: {
        quality: CONFIG.QUALITY_MODEL,
        fast: CONFIG.FAST_MODEL,
      },
      apiKeyConfigured: CONFIG.IS_API_KEY_CONFIGURED,
      stats: {
        hooks: hookCount.count,
        documents: docCount.count,
        voiceProfiles: voiceCount.count,
        generations: genCount.count,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
