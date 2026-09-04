-- Viral Copywriter AI Database Schema
-- 12 Core Entities + FTS5 Full Text Search

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Documents
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. DocumentChunks
CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title TEXT,
    author TEXT,
    chapter TEXT,
    page INTEGER,
    text TEXT NOT NULL,
    topic TEXT,
    category TEXT,
    framework TEXT,
    concept TEXT,
    tags TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. KnowledgeItems (Extracted Principles & Rules)
CREATE TABLE IF NOT EXISTS knowledge_items (
    id TEXT PRIMARY KEY,
    chunk_id TEXT REFERENCES document_chunks(id) ON DELETE SET NULL,
    principle TEXT NOT NULL,
    category TEXT NOT NULL,
    technique TEXT,
    explanation TEXT,
    examples TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Hooks
CREATE TABLE IF NOT EXISTS hooks (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    template TEXT NOT NULL,
    example TEXT,
    source_url TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Frameworks
CREATE TABLE IF NOT EXISTS frameworks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    formula TEXT NOT NULL,
    best_for_platforms TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. VoiceProfiles
CREATE TABLE IF NOT EXISTS voice_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    metrics TEXT NOT NULL,
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. GeneratedContent
CREATE TABLE IF NOT EXISTS generated_content (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    request_params TEXT NOT NULL,
    retrieved_knowledge_ids TEXT,
    selected_hook TEXT,
    selected_angle TEXT,
    model_used TEXT NOT NULL,
    total_score REAL,
    critique TEXT,
    improvement_iterations INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. ContentVersions (5 Distinct Versions)
CREATE TABLE IF NOT EXISTS content_versions (
    id TEXT PRIMARY KEY,
    generated_content_id TEXT NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_type TEXT NOT NULL,
    content TEXT NOT NULL,
    hook_used TEXT,
    angle_used TEXT,
    scores TEXT,
    total_score REAL,
    is_selected INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. ContentScores (11-Dimension Diagnostic Scoring History)
CREATE TABLE IF NOT EXISTS content_scores (
    id TEXT PRIMARY KEY,
    content_version_id TEXT NOT NULL REFERENCES content_versions(id) ON DELETE CASCADE,
    iteration INTEGER NOT NULL,
    hook_score REAL,
    clarity_score REAL,
    curiosity_score REAL,
    specificity_score REAL,
    emotion_score REAL,
    originality_score REAL,
    value_score REAL,
    flow_score REAL,
    readability_score REAL,
    cta_score REAL,
    audience_fit_score REAL,
    total_score REAL,
    weaknesses TEXT,
    improvement_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. GenerationHistory
CREATE TABLE IF NOT EXISTS generation_history (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,
    prompt_name TEXT NOT NULL,
    model TEXT NOT NULL,
    latency_ms INTEGER,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. SavedContent
CREATE TABLE IF NOT EXISTS saved_content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    hook TEXT,
    angle TEXT,
    total_score REAL,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Virtual Table for Full Text Search on Chunks
CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks_fts USING fts5(
    id UNINDEXED,
    text,
    topic,
    category,
    framework,
    concept,
    tags,
    content='document_chunks',
    content_rowid='rowid'
);
