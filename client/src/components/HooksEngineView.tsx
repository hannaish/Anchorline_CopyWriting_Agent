import React, { useState, useEffect } from "react";
import { Zap, Sparkles, Filter, Copy, Check, ExternalLink, Award, Search } from "lucide-react";
import { HookItem, SeedHook } from "../types";

export const HooksEngineView: React.FC = () => {
  const [topic, setTopic] = useState("Why most leaders fail at executive delegation");
  const [audience, setAudience] = useState("Founders & Senior Executives");
  const [platform, setPlatform] = useState("LinkedIn");
  const [goal, setGoal] = useState("Stop the scroll & generate debate");
  const [generatedHooks, setGeneratedHooks] = useState<HookItem[]>([]);
  const [seedHooks, setSeedHooks] = useState<SeedHook[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Educational", "Comparison", "Myth Busting", "Storytelling", "Authority", "Day in the Life"];

  useEffect(() => {
    fetchSeedHooks();
    handleGenerate();
  }, []);

  const fetchSeedHooks = async () => {
    try {
      const res = await fetch("/api/hooks/browse");
      const data = await res.json();
      setSeedHooks(data.hooks || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hooks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, platform, goal }),
      });
      const data = await res.json();
      setGeneratedHooks(data.hooks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSeedHooks = seedHooks.filter((h) => {
    const matchesCat = activeCategory === "All" || h.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || h.template.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Generator Card */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Dedicated Hook Engine & 7-Dimension Scorer
            </h2>
            <p className="text-xs text-slate-400">
              Generates 10+ categorized hooks, scores each across 7 psychological engagement metrics (0–100), and flags the Top 3.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold">
            10 Hooks / 7 Rubrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs mb-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option>LinkedIn</option>
              <option>X / Twitter</option>
              <option>Instagram Reels</option>
              <option>Threads</option>
              <option>Facebook</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Desired Outcome</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Analyzing & Scoring Hooks...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>GENERATE 10 SCORED HOOKS</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Hooks Table with 7 Scores */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Engineered Hooks & 7-Dimension Engagement Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {generatedHooks.length} generated (Top 3 highlighted)
          </span>
        </div>

        <div className="space-y-3">
          {generatedHooks.map((h, index) => (
            <div
              key={h.id}
              className={`p-4 rounded-xl border transition-all ${
                h.isTop3
                  ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                  : "bg-slate-900/50 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 font-bold">#{index + 1}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {h.category}
                    </span>
                    {h.isTop3 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Top 3 Selection
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-100 leading-snug pt-1">"{h.text}"</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <span className="text-lg font-black font-mono text-emerald-400">{h.scores.total}</span>
                    <span className="block text-[10px] text-slate-500">Overall</span>
                  </div>
                  <button
                    onClick={() => handleCopy(h.text, h.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                    title="Copy Hook"
                  >
                    {copiedId === h.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 7 Dimensions Scores Row */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2 border-t border-slate-800/80 text-center">
                {[
                  { label: "Curiosity", score: h.scores.curiosity },
                  { label: "Clarity", score: h.scores.clarity },
                  { label: "Specificity", score: h.scores.specificity },
                  { label: "Emotional", score: h.scores.emotionalImpact },
                  { label: "Relevance", score: h.scores.audienceRelevance },
                  { label: "Pattern Break", score: h.scores.patternInterruption },
                  { label: "Scroll Stop", score: h.scores.scrollStoppingPotential },
                ].map((dim, i) => (
                  <div key={i} className="p-1 rounded bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[9px] text-slate-500 block truncate">{dim.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{dim.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proprietary Viral Hook Swipe Archive (100+ Seeded) */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Proprietary Viral Swipe Archive ({seedHooks.length} Formulas)
            </h3>
            <p className="text-xs text-slate-400">
              Curated viral social templates from top creators with source inspiration links.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Swipe List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredSeedHooks.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Inspo Link <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-200 leading-relaxed">
                  {item.template}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Click to load into generator</span>
                <button
                  onClick={() => handleCopy(item.template, item.id)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
