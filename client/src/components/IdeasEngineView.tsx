import React, { useState, useEffect } from "react";
import { Lightbulb, Sparkles, ArrowRight, Copy, Check } from "lucide-react";
import { ContentIdea, NavigationTab } from "../types";

interface IdeasEngineViewProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const IdeasEngineView: React.FC<IdeasEngineViewProps> = ({ setActiveTab }) => {
  const [niche, setNiche] = useState("B2B SaaS Growth");
  const [audience, setAudience] = useState("Early-stage Founders & Marketers");
  const [goal, setGoal] = useState("Generate Inbound Pipeline & Authority");
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, audience, goal }),
      });
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (hook: string, id: string) => {
    navigator.clipboard.writeText(hook);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Parameters */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Content Idea Matrix (20 Angles & Triggers)
            </h2>
            <p className="text-xs text-slate-400">
              Input your market details to generate 20 multi-format content blueprints with psychological hooks.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-semibold">
            20 High-Converting Ideas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Niche</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
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
            <label className="block text-slate-300 font-semibold mb-1">Goal</label>
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
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Generating 20 Concepts...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>GENERATE 20 CONTENT IDEAS</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of 20 Ideas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-[#0d121f] border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-indigo-400 font-bold">Idea #{item.number}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                    {item.format}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                    {item.angle}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-100">{item.topic}</h4>
              <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                "{item.hook}"
              </p>

              <div className="text-[11px] text-slate-400 space-y-1">
                <div>
                  <span className="text-slate-500 font-medium">Emotional Trigger: </span>
                  <span className="text-slate-300">{item.emotionalTrigger}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Why it works: </span>
                  <span>{item.whyItCouldWork}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">CTA: </span>
                  <span className="text-slate-300">{item.cta}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleCopy(item.hook, item.id)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === item.id ? "Hook Copied" : "Copy Hook"}</span>
              </button>

              <button
                onClick={() => setActiveTab("create")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>Draft Post</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
