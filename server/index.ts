import express from "express";
import cors from "cors";
import path from "path";
import { CONFIG } from "./config.js";
import { initDatabase } from "./db/database.js";

// Import route modules
import healthRoutes from "./routes/health.routes.js";
import contentRoutes from "./routes/content.routes.js";
import hooksRoutes from "./routes/hooks.routes.js";
import ideasRoutes from "./routes/ideas.routes.js";
import rewriteRoutes from "./routes/rewrite.routes.js";
import repurposeRoutes from "./routes/repurpose.routes.js";
import knowledgeRoutes from "./routes/knowledge.routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import testsRoutes from "./routes/tests.routes.js";

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize SQLite database
initDatabase();

// Register API routes
app.use("/api", healthRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/hooks", hooksRoutes);
app.use("/api/ideas", ideasRoutes);
app.use("/api/rewrite", rewriteRoutes);
app.use("/api/repurpose", repurposeRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/tests", testsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Server Error]", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: "error"
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Viral Copywriter AI Server listening on port ${CONFIG.PORT}`);
  console.log(`   Quality Model: ${CONFIG.QUALITY_MODEL}`);
  console.log(`   Fast Model:    ${CONFIG.FAST_MODEL}`);
  console.log(`   API Key Set:   ${CONFIG.IS_API_KEY_CONFIGURED ? "YES (Configured)" : "NO (Using mock/test mode)"}`);
  console.log(`   Health Check:  http://localhost:${CONFIG.PORT}/api/health`);
  console.log(`====================================================`);
});
