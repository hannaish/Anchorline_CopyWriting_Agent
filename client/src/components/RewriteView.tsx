import React, { useState } from "react";
import { FileEdit, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Copy, Check } from "lucide-react";

export const RewriteView: React.FC = () => {
  const [content, setContent] = useState(
    `In today's fast-paced world, many professionals struggle to achieve their goals. It is important to work hard and stay motivated. Here are 5 tips to unlock your potential: 1. Wake up early. 2. Read books. 3. Network with people. 4. Stay positive. 5. Never give up. What are your thoughts?`
  );
  const [platform, setPlatform] = useState("LinkedIn");
  const [tone, setTone] = useState("Bold & Contrarian");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rewrite/analyze-and-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, targetPlatform: platform, tone }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-indigo-400" />
              Content Rewriter & Diagnostic Weakness Eliminator
            </h2>
            <p className="text-xs text-slate-400">
              Paste existing or low-performing copy to analyze why it failed, score it against viral rubrics, and generate a high-converting rewrite.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-semibold">
            Before vs. After Scoring
          </span>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Paste Existing Draft to Audit:</label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500"
            placeholder="Paste your post, newsletter excerpt, or tweet draft here..."
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-slate-400 mr-2">Target Platform:</span>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200"
                >
                  <option>LinkedIn</option>
                  <option>X / Twitter</option>
                  <option>Instagram</option>
                  <option>Threads</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !content.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Auditing & Rewriting...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AUDIT & REWRITE CONTENT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Comparison */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Diagnostic Teardown */}
          <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Diagnostic Teardown
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Score:</span>
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold text-sm">
                  {analysis.currentScore} / 100
                </span>
              </div>
            </div>

            {/* What's Working */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> What's Working:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {analysis.whatsWorking.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            {/* What's Weak */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Identified Weaknesses:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {analysis.whatsWeak.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Better Hook & Structure */}
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-xs space-y-2">
              <div>
                <span className="text-indigo-400 font-bold block mb-1">Recommended Hook Upgrade:</span>
                <p className="text-slate-200 font-medium italic">"{analysis.betterHook}"</p>
              </div>
              <div className="pt-2 border-t border-indigo-900/40">
                <span className="text-indigo-400 font-bold block mb-1">High-Converting Pacing Architecture:</span>
                <p className="text-slate-400 text-[11px] font-mono">{analysis.betterStructure}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Upgraded Copy */}
          <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Engineered Rewrite
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Score:</span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-sm">
                    {analysis.improvedScore} / 100 (+{analysis.improvedScore - analysis.currentScore})
                  </span>
                </div>
              </div>

              <textarea
                rows={13}
                value={analysis.improvedCopy}
                onChange={(e) => setAnalysis({ ...analysis, improvedCopy: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Zero corporate fluff. Platform-native pacing.</span>
              <button
                onClick={() => handleCopy(analysis.improvedCopy)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Rewritten Post"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
