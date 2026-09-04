import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { CONFIG } from "../config.js";

// Ensure DB directory exists
const dbPath = path.resolve(process.cwd(), CONFIG.DATABASE_PATH);
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize schema
export function initDatabase() {
  const schemaPath = path.join(process.cwd(), "server", "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  db.exec(schemaSql);
  
  // Ensure default user exists
  const checkUser = db.prepare("SELECT id FROM users WHERE id = ?").get("default_user");
  if (!checkUser) {
    db.prepare(
      "INSERT INTO users (id, name, email) VALUES (?, ?, ?)"
    ).run("default_user", "Viral Copywriter Pro", "creator@viralcopy.ai");
  }

  // Ensure default voice profiles exist
  const checkVoice = db.prepare("SELECT COUNT(*) as count FROM voice_profiles").get() as { count: number };
  if (checkVoice.count === 0) {
    const defaultProfiles = [
      {
        id: "voice_contrarian",
        name: "Bold Contrarian",
        description: "Sharp, provocative, cuts through corporate fluff with counter-intuitive insights.",
        metrics: JSON.stringify({
          tone: "Provocative, Direct",
          sentence_length: "Short & punchy (8-14 words)",
          vocabulary: "Assertive, visceral, jargon-free",
          rhythm: "Staccato, abrupt pattern interrupts",
          humor: "Dry, satirical irony",
          cta_style: "Challenging & debate-inducing"
        }),
        is_active: 1
      },
      {
        id: "voice_storyteller",
        name: "Vulnerable Storyteller",
        description: "Narrative-driven, cinematic pacing, emotionally honest personal journeys.",
        metrics: JSON.stringify({
          tone: "Vulnerable, Empathetic, Reflective",
          sentence_length: "Varied cadence (5 to 25 words)",
          vocabulary: "Sensory, human, descriptive",
          rhythm: "Narrative suspense with emotional peaks",
          humor: "Self-deprecating warmth",
          cta_style: "Conversational & community-building"
        }),
        is_active: 0
      },
      {
        id: "voice_educator",
        name: "Tactical Educator",
        description: "High density of practical value, clear breakdowns, zero generic fluff.",
        metrics: JSON.stringify({
          tone: "Authoritative, Clear, Empowering",
          sentence_length: "Balanced & structured",
          vocabulary: "Precise, action-oriented",
          rhythm: "Step-by-step bulleted clarity",
          humor: "Minimal, focus on mastery",
          cta_style: "Resource delivery & save-oriented"
        }),
        is_active: 0
      }
    ];

    const insertVoice = db.prepare(
      "INSERT INTO voice_profiles (id, name, description, metrics, is_active) VALUES (?, ?, ?, ?, ?)"
    );
    for (const p of defaultProfiles) {
      insertVoice.run(p.id, p.name, p.description, p.metrics, p.is_active);
    }
  }

  console.log(`[Database] Initialized successfully at: ${dbPath}`);
}
