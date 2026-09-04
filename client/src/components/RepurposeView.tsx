import React, { useState } from "react";
import { Share2, Sparkles, Copy, Check, Video, Layout } from "lucide-react";

export const RepurposeView: React.FC = () => {
  const [sourceContent, setSourceContent] = useState(
    `Why Most Leaders Mistake Motion for Progress:
In modern knowledge work, it's dangerously easy to feel productive while accomplishing virtually nothing. Back-to-back meetings, inbox zero, Slack notifications—these create the illusion of forward momentum. But real progress is asymmetric. 
Over the last 5 years scaling high-output teams, we realized that 80% of our enterprise enterprise enterprise results came from just three disciplined focus habits:
1. Ruthless elimination of status meetings in favor of asynchronous memos.
2. 3-hour morning deep work blocks where notifications are strictly forbidden.
3. Defining clear single-threaded ownership for every strategic priority.
When leaders stop mistaking activity for output, team velocity compounds exponentially.`
  );

  const [activeTab, setActiveTab] = useState<"linkedin" | "x" | "instagram" | "threads" | "video" | "carousel">("linkedin");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRepurpose = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/repurpose/atomize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: sourceContent }),
      });
      const data = await res.json();
      setResults(data.result);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Source Box */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Omnichannel Content Repurposing Engine
            </h2>
            <p className="text-xs text-slate-400">
              Paste 1 piece of long-form thought leadership, newsletter, or podcast transcript to atomize into 40+ platform-optimized assets.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-semibold">
            1 Input → 40+ Assets
          </span>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Source Content (Article, Podcast Transcript, or Essay):
          </label>
          <textarea
            rows={4}
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500"
          />

          <div className="flex justify-end pt-1">
            <button
              onClick={handleRepurpose}
              disabled={loading || !sourceContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Atomizing Across 5 Platforms...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ATOMIZE INTO 40+ ASSETS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Repurposed Assets Tabs */}
      {results && (
        <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: "linkedin", label: "LinkedIn Posts (10)" },
              { id: "x", label: "X / Twitter (10)" },
              { id: "instagram", label: "Instagram Captions (5)" },
              { id: "threads", label: "Threads (5)" },
              { id: "video", label: "Video Scripts (5)" },
              { id: "carousel", label: "Carousel Concepts (5)" },
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === "linkedin" &&
              results.linkedInPosts.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-400">{p.title}</span>
                    <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed pt-1">{p.text}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleCopy(p.text, p.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === p.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "x" &&
              results.xPosts.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">{p.text}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleCopy(p.text, p.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === p.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "instagram" &&
              results.instagramCaptions.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">{p.text}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleCopy(p.text, p.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === p.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "threads" &&
              results.threads.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">{p.text}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleCopy(p.text, p.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === p.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "video" &&
              results.videoConcepts.map((v: any) => (
                <div key={v.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <Video className="w-3.5 h-3.5" />
                    <span>{v.title}</span>
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 font-semibold block mb-0.5">Opening Hook:</span>
                    "{v.hook}"
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Visual Pacing: </span>
                    {v.pacing}
                  </div>
                </div>
              ))}

            {activeTab === "carousel" &&
              results.carouselConcepts.map((c: any) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <Layout className="w-3.5 h-3.5" />
                    <span>{c.title}</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {c.slides.map((s: string, idx: number) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-950 border border-slate-800/60 text-[11px]">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
