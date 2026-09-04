import React, { useState, useEffect } from "react";
import { UserCheck, Sparkles, Check, CheckCircle2, Sliders, Mic } from "lucide-react";
import { VoiceProfile } from "../types";

export const VoiceStudioView: React.FC = () => {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [sampleText, setSampleText] = useState(
    `I spent 4 years building features nobody wanted because I was too proud to talk to customers.
We had the slickest animations. The fastest database. Zero churn complaints—because we had zero active users.
That experience cured me of tech perfectionism forever.
Now, before writing a single line of code, we pre-sell the outcome.
What is the most expensive assumption your team is currently testing?`
  );
  const [loading, setLoading] = useState(false);
  const [analyzedProfile, setAnalyzedProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/voice");
      const data = await res.json();
      setProfiles(data.profiles || []);
      const active = data.profiles.find((p: any) => p.is_active === 1);
      if (active) setActiveProfileId(active.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await fetch("/api/voice/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setActiveProfileId(id);
      fetchProfiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/voice/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, sampleText }),
      });
      const data = await res.json();
      setAnalyzedProfile(data.profile);
      fetchProfiles();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Profiles Grid */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Voice Profile Studio
            </h2>
            <p className="text-xs text-slate-400">
              Select or synthesize writing voice profiles to guarantee your copy matches your distinct human cadence.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold">
            Active: {profiles.find((p) => p.id === activeProfileId)?.name || "Default"}
          </span>
        </div>

        {/* Existing Voice Profiles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">{p.name}</h4>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                  
                  {/* Metrics preview */}
                  <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                    <div>Tone: <span className="text-slate-300">{p.metrics.tone || "Direct"}</span></div>
                    <div>Cadence: <span className="text-slate-300">{p.metrics.sentenceLength || "Punchy"}</span></div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleSetActive(p.id)}
                    disabled={isActive}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-slate-500 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    {isActive ? "Currently Applied" : "Apply This Voice"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Analyzer Form */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            Analyze My Writing Voice (3–10 Samples)
          </h3>
          <p className="text-xs text-slate-400">
            Paste excerpts from your best posts or emails. The engine extracts your vocabulary level, sentence cadence, humor, and question frequency.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Voice Profile Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. My Personal LinkedIn Tone"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Writing Samples (Paste your raw text):
            </label>
            <textarea
              rows={6}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500"
              placeholder="Paste 100+ words of your genuine posts, emails, or thoughts..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !sampleText.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Analyzing Cadence & Vocabulary...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ANALYZE & SYNTHESIZE VOICE PROFILE</span>
              </>
            )}
          </button>
        </div>

        {/* Analyzed Breakdown Results */}
        {analyzedProfile && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Synthesized Profile: {analyzedProfile.name}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {Object.entries(analyzedProfile.metrics).map(([key, val]: any) => (
                <div key={key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">{key}</span>
                  <span className="text-xs text-slate-200 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
