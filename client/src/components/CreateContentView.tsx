import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Share2,
  Zap,
  Heart,
  UserCheck,
  Minimize2,
  Maximize2
} from "lucide-react";
import { GenerationRequest, GeneratedResult, ContentVersion } from "../types";

export const CreateContentView: React.FC = () => {
  const [formData, setFormData] = useState<GenerationRequest>({
    topic: "Why most founders fail to scale from $1M to $10M ARR",
    niche: "B2B SaaS Growth",
    audience: "Early-stage SaaS Founders & CEOs",
    offer: "SaaS Scale Sprint (8-Week Growth Advisory)",
    goal: "Thought Leadership & High-Intent Inbound DMs",
    platform: "LinkedIn",
    tone: "Bold & Contrarian",
    emotion: "Curiosity & Urgency",
    keyMessage: "What got you to $1M will kill your business at $5M if you don't build automated leverage.",
    personalStory: "Almost lost my first startup because I refused to delegate sales and product decisions.",
    cta: "Drop a comment with 'SCALE' and I'll send our 1-page delegation framework.",
    format: "Thought-Leadership Post with 3-Step Breakdown",
  });

  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string>("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCritique, setShowCritique] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const platforms = ["LinkedIn", "X / Twitter", "Instagram", "Threads", "Facebook", "Sales Copy / Email"];
  const tones = ["Bold", "Contrarian", "Conversational", "Authoritative", "Storytelling", "Empathetic", "Direct-Response"];
  const emotions = ["Curiosity", "Relief", "Urgency", "Validation", "Hope / Aspiration", "FOMO"];
  const goals = ["Thought Leadership", "Lead Generation (DMs)", "High Engagement / Comments", "Product Launch Offer", "Educational Saves"];

  const handleGenerate = async () => {
    setLoading(true);
    setPipelineStep("Stage 1/6: Request Analyzer & Audience Intent...");

    // Progressive stage simulation
    setTimeout(() => setPipelineStep("Stage 2/6: Knowledge Retrieval (Searching FTS5 Swipes)..."), 300);
    setTimeout(() => setPipelineStep("Stage 3/6: Hook & Angle Generation (Scoring 10 Hooks)..."), 700);
    setTimeout(() => setPipelineStep("Stage 4/6: Drafting 5 Distinct Psychological Versions..."), 1100);
    setTimeout(() => setPipelineStep("Stage 5/6: Content Critic & 11-Dimension Rubric Scoring..."), 1500);
    setTimeout(() => setPipelineStep("Stage 6/6: Auto-Improvement & Originality Guard..."), 1800);

    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data);
      setActiveVersionIndex(0);
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
      setPipelineStep("");
    }
  };

  const currentVersion: ContentVersion | undefined = result?.versions[activeVersionIndex];

  const handleCopy = () => {
    if (!currentVersion) return;
    navigator.clipboard.writeText(currentVersion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickTransform = async (action: string) => {
    if (!currentVersion) return;
    try {
      setActionMessage(`Applying: ${action}...`);
      const res = await fetch("/api/content/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentVersion.content, action }),
      });
      const data = await res.json();
      
      // Update version in place
      if (result) {
        const updated = [...result.versions];
        updated[activeVersionIndex] = {
          ...updated[activeVersionIndex],
          content: data.transformedContent,
          scores: {
            ...updated[activeVersionIndex].scores,
            total: data.newScore || updated[activeVersionIndex].scores.total,
          },
        };
        setResult({ ...result, versions: updated });
      }
      setActionMessage(data.note || "Transform applied successfully");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#0d121f] border border-slate-800 rounded-2xl p-5 shadow-xl h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Content Parameters
            </h2>
            <span className="text-xs text-slate-400 font-mono">12 Inputs</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Topic */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Core Topic / Premise *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Why most leaders fail at executive hiring"
              />
            </div>

            {/* Target Audience & Niche */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Niche / Industry</label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. B2B SaaS"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Founders & CEOs"
                />
              </div>
            </div>

            {/* Platform & Goal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Content Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {goals.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tone & Emotion */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Voice Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {tones.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Desired Emotion</label>
                <select
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {emotions.map((em) => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Key Message */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Core Insight / Key Message</label>
              <textarea
                rows={2}
                value={formData.keyMessage}
                onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="The single truth that challenges the reader's current belief..."
              />
            </div>

            {/* Personal Story (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Personal Story / Proof Point <span className="text-slate-500">(Never fabricated)</span>
              </label>
              <textarea
                rows={2}
                value={formData.personalStory}
                onChange={(e) => setFormData({ ...formData, personalStory: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Authentic anecdote or client result..."
              />
            </div>

            {/* Call to Action (CTA) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Desired Call to Action</label>
              <input
                type="text"
                value={formData.cta}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Drop a comment below..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running 13-Stage Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERATE 5 VERSIONS</span>
              </>
            )}
          </button>

          {loading && (
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              <span className="font-mono">{pipelineStep}</span>
            </div>
          )}
        </div>

        {/* Right Panel: 5 Versions Output & Critique (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <div className="bg-[#0d121f] border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Ready to Engineer High-Converting Copy</h3>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                Fill in your parameters on the left and trigger the 13-stage cognitive engine.
                The system will retrieve relevant swipe knowledge, test hooks, and generate 5 distinct psychological drafts.
              </p>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Test Sample Generation
              </button>
            </div>
          )}

          {result && currentVersion && (
            <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
              {/* 5 Version Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                {result.versions.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVersionIndex(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeVersionIndex === i
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <span>{v.versionType}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                      {v.scores.total}
                    </span>
                  </button>
                ))}
              </div>

              {/* Version Header: Hook & Angle used */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-400 mb-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      Selected Angle: {currentVersion.angle}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Platform: {result.request.platform}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-1 italic">
                    Hook: "{currentVersion.hook}"
                  </p>
                </div>

                {/* Score Radial Badge */}
                <div className="text-center shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {currentVersion.scores.total}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Score</span>
                </div>
              </div>

              {/* Copy Body Editor */}
              <div className="relative">
                <textarea
                  rows={14}
                  value={currentVersion.content}
                  onChange={(e) => {
                    const updated = [...result.versions];
                    updated[activeVersionIndex].content = e.target.value;
                    setResult({ ...result, versions: updated });
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500"
                />

                {actionMessage && (
                  <div className="absolute top-2 right-2 px-3 py-1 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono">
                    {actionMessage}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium mr-1">Quick Tweaks:</span>
                  <button
                    onClick={() => handleQuickTransform("viral")}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    Make More Viral
                  </button>
                  <button
                    onClick={() => handleQuickTransform("human")}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    Make More Human
                  </button>
                  <button
                    onClick={() => handleQuickTransform("emotional")}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3 h-3 text-rose-400" />
                    Make More Emotional
                  </button>
                  <button
                    onClick={() => handleQuickTransform("shorter")}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Minimize2 className="w-3 h-3 text-sky-400" />
                    Make Shorter
                  </button>
                  <button
                    onClick={() => handleQuickTransform("longer")}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3 text-indigo-400" />
                    Make Longer
                  </button>
                </div>

                {/* Primary Action Buttons: Copy, Save, Regenerate */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Post"}</span>
                    </button>
                    <button
                      onClick={() => setSaved(!saved)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-all ${
                        saved
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{saved ? "Saved" : "Save Draft"}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate All 5</span>
                  </button>
                </div>
              </div>

              {/* 11-Dimension Critique Breakdown Accordion */}
              <div className="border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => setShowCritique(!showCritique)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-400" />
                    Content Critic & 11-Dimension Diagnostic Rubric
                  </span>
                  {showCritique ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showCritique && (
                  <div className="mt-3 space-y-4">
                    {/* 11 Dimension Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {[
                        { label: "Hook", val: currentVersion.scores.hook },
                        { label: "Clarity", val: currentVersion.scores.clarity },
                        { label: "Curiosity", val: currentVersion.scores.curiosity },
                        { label: "Specificity", val: currentVersion.scores.specificity },
                        { label: "Emotion", val: currentVersion.scores.emotion },
                        { label: "Originality", val: currentVersion.scores.originality },
                        { label: "Value", val: currentVersion.scores.value },
                        { label: "Flow", val: currentVersion.scores.flow },
                        { label: "Readability", val: currentVersion.scores.readability },
                        { label: "CTA", val: currentVersion.scores.cta },
                        { label: "Audience Fit", val: currentVersion.scores.audienceFit },
                        { label: "Total Score", val: currentVersion.scores.total, highlight: true },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border text-center ${
                            item.highlight
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-slate-900 border-slate-800"
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
                          <div
                            className={`text-xs font-bold font-mono ${
                              item.highlight ? "text-emerald-400" : "text-slate-200"
                            }`}
                          >
                            {item.val}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Critique Summary */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                      <p className="text-slate-300 font-medium leading-relaxed">
                        {result.critique.overallSummary}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                            Key Strengths:
                          </span>
                          <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                            {result.critique.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                            Improvement Opportunities:
                          </span>
                          <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                            {result.critique.improvementSuggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
