import React, { useState, useEffect } from "react";
import { BookOpen, Upload, Search, Filter, Plus, FileText, Cpu, CheckCircle2, Layers } from "lucide-react";

export const KnowledgeView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
    searchChunks();
  }, [category]);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/knowledge/summary");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchChunks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge/search?category=${encodeURIComponent(category)}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setChunks(data.chunks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleIngest = async () => {
    setIngesting(true);
    try {
      const res = await fetch("/api/knowledge/ingest-sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "The Architecture of High-Converting Claims",
          author: "Claude Hopkins & Eugene Schwartz Principles",
          category: "Persuasion",
          text: `SPECIFICITY BREEDS CREDIBILITY
When you make a claim in copywriting, vague statements ('we are very fast') roll right off the reader's brain without registering. 
Specific claims ('we respond in under 4 minutes and 12 seconds') force the reader's imagination to paint a concrete mental picture. 
In a world saturated with generic AI content, specificity is the ultimate moat. Specific numbers, named situations, and sensory details immediately signal first-hand authority.`,
        }),
      });
      const data = await res.json();
      setMessage("Sample document semantically parsed, classified & stored in SQLite FTS5!");
      fetchSummary();
      searchChunks();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIngesting(false);
    }
  };

  const categories = [
    "All", "Copywriting", "Marketing", "Sales", "Psychology", "Storytelling",
    "Branding", "Persuasion", "Advertising", "Content Creation",
    "Social Media", "Leadership", "Business", "Personal Development"
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Ingestion Hub */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Proprietary Knowledge Library & Ingestion Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Upload thousands of books, swipe files, and notes. The engine semantically parses, classifies, and extracts core principles into the SQLite intelligence layer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSampleIngest}
              disabled={ingesting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{ingesting ? "Processing Chunks..." : "Import Knowledge"}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Indexed Documents</span>
            <span className="text-lg font-bold text-white font-mono">{summary?.stats?.totalDocuments || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Semantic Chunks</span>
            <span className="text-lg font-bold text-indigo-400 font-mono">{summary?.stats?.totalChunks || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Extracted Principles</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{summary?.stats?.totalPrinciples || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Viral Hook Templates</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{summary?.stats?.totalHooks || 56}</span>
          </div>
        </div>

        {/* Upload Dropzone Placeholder */}
        <div className="mt-4 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 text-center bg-slate-900/20 transition-all cursor-pointer">
          <Upload className="w-7 h-7 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-300">Drag and drop books, notes, or swipe files here</p>
          <p className="text-[11px] text-slate-500 mt-1">Supported formats: PDF, DOCX, TXT, Markdown, CSV, JSON</p>
        </div>
      </div>

      {/* Semantic Chunks & Search Browser */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Knowledge Chunks & Extracted Principles
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchChunks()}
                placeholder="Search principles, topics, frameworks..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={searchChunks}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                category === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Chunks List */}
        <div className="space-y-3">
          {chunks.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-slate-500">
              No chunks found for this filter. Click "Import Knowledge" above to add semantic copywriting principles.
            </div>
          )}

          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{chunk.title}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[11px]">{chunk.chapter || "General"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono">
                    {chunk.category}
                  </span>
                  {chunk.framework && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
                      {chunk.framework}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {chunk.text}
              </p>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Source: {chunk.source || "Uploaded Document"}</span>
                <span className="font-mono">ID: {chunk.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
