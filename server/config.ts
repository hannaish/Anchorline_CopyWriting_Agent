import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  QUALITY_MODEL: process.env.GEMINI_QUALITY_MODEL || "gemini-3.7-flash",
  FAST_MODEL: process.env.GEMINI_FAST_MODEL || "gemini-3.5-flash-lite",
  DATABASE_PATH: process.env.DATABASE_PATH || "./server/db/viral_copywriter.db",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  IS_API_KEY_CONFIGURED: Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== "your_key_here" &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
  ),
};
