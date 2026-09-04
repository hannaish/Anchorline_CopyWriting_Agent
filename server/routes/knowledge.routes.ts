import { Router } from "express";
import { db } from "../db/database.js";
import crypto from "crypto";

const router = Router();

// Get summary of knowledge base
router.get("/summary", (req, res) => {
  const documents = db.prepare("SELECT * FROM documents ORDER BY created_at DESC").all();
  const chunkCount = db.prepare("SELECT COUNT(*) as count FROM document_chunks").get() as { count: number };
  const principleCount = db.prepare("SELECT COUNT(*) as count FROM knowledge_items").get() as { count: number };
  const hookCount = db.prepare("SELECT COUNT(*) as count FROM hooks").get() as { count: number };

  const categories = [
    "Copywriting", "Marketing", "Sales", "Psychology", "Storytelling",
    "Branding", "Persuasion", "Advertising", "Content Creation",
    "Social Media", "Leadership", "Business", "Personal Development"
  ];

  res.json({
    documents,
    stats: {
      totalDocuments: documents.length,
      totalChunks: chunkCount.count,
      totalPrinciples: principleCount.count,
      totalHooks: hookCount.count,
    },
    categories,
  });
});

// Search knowledge chunks
router.get("/search", (req, res) => {
  const { query, category } = req.query;

  let sql = "SELECT * FROM document_chunks WHERE 1=1";
  const params: any[] = [];

  if (category && category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }

  if (query) {
    sql += " AND (text LIKE ? OR topic LIKE ? OR framework LIKE ?)";
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  sql += " ORDER BY created_at DESC LIMIT 50";
  const chunks = db.prepare(sql).all(...params);

  res.json({ chunks });
});

// Mock document ingestion (creates document record and semantic chunks)
router.post("/ingest-sample", (req, res) => {
  const { title, author, category, text } = req.body;
  const docId = "doc_" + crypto.randomUUID().slice(0, 8);

  const sampleText = text || `SPECIFICITY BREEDS CREDIBILITY
When you make a claim in copywriting, vague statements ('we are very fast') roll right off the reader's brain without registering. 
Specific claims ('we respond in under 4 minutes and 12 seconds') force the reader's imagination to paint a concrete mental picture. 
In a world saturated with generic AI content, specificity is the ultimate moat. Specific numbers, named situations, and sensory details immediately signal first-hand authority.`;

  db.prepare(`
    INSERT INTO documents (id, title, author, filename, file_type, file_size, chunk_count, status, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    docId,
    title || "The Architecture of Persuasion",
    author || "Viral Copywriter Archive",
    "sample_persuasion.txt",
    "txt",
    sampleText.length,
    1,
    "indexed",
    JSON.stringify({ category: category || "Persuasion" })
  );

  const chunkId = "chk_" + crypto.randomUUID().slice(0, 8);
  db.prepare(`
    INSERT INTO document_chunks (
      id, document_id, title, author, chapter, page, text, topic, category, framework, concept, tags, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    chunkId,
    docId,
    title || "The Architecture of Persuasion",
    author || "Viral Copywriter Archive",
    "Chapter 1: The Specificity Principle",
    1,
    sampleText,
    "Specificity in Claims",
    category || "Persuasion",
    "SPECIFICITY → CREDIBILITY",
    "Sensory Concrete Proof",
    JSON.stringify(["specificity", "credibility", "persuasion"]),
    "Uploaded Document"
  );

  // Also add knowledge principle
  db.prepare(`
    INSERT INTO knowledge_items (id, chunk_id, principle, category, technique, explanation, examples)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "principle_" + crypto.randomUUID().slice(0, 8),
    chunkId,
    "SPECIFICITY → CREDIBILITY",
    category || "Persuasion",
    "Concrete Metric Anchoring",
    "Specific claims force mental visualization and eliminate skepticism.",
    JSON.stringify(["'we answer in 4 minutes' vs 'we are fast'"])
  );

  res.json({
    success: true,
    documentId: docId,
    chunkId,
    message: "Document parsed, semantically chunked, and classified into Knowledge Library!",
  });
});

export default router;
