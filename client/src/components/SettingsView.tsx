import React, { useState } from "react";
import { Settings, KeyRound, Cpu, ShieldCheck, Database, CheckCircle2 } from "lucide-react";

export const SettingsView: React.FC = () => {
  const [qualityModel, setQualityModel] = useState("gemini-3.7-flash");
  const [fastModel, setFastModel] = useState("gemini-3.5-flash-lite");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Engine Configuration & Gemini Settings
            </h2>
            <p className="text-xs text-slate-400">
              Manage server-side models, API security credentials, and knowledge base parameters.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            Environment Mode: Development
          </span>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* API Key info */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Gemini API Key Security
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Server-Side Protected</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Your API key is securely loaded via the server's <code className="text-indigo-300 font-mono">.env</code> file (<code className="text-indigo-300 font-mono">GEMINI_API_KEY</code>). It is never sent to the browser or bundled in frontend assets.
            </p>
            <div className="pt-1">
              <input
                type="password"
                disabled
                value="••••••••••••••••••••••••••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono text-xs cursor-not-allowed"
              />
            </div>
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Primary Quality Model</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Powers 5-version generation, deep 11-dimension critique, and multi-cycle auto-improvement.
              </p>
              <select
                value={qualityModel}
                onChange={(e) => setQualityModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Recommended)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Fast Routing / Classification Model</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Powers request intent parsing, semantic chunk categorization, and low-latency pre-routing.
              </p>
              <select
                value={fastModel}
                onChange={(e) => setFastModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
              >
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Lowest Cost / Fastest)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              </select>
            </div>
          </div>

          {/* Database & Storage */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Storage & Knowledge Layer</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block">Database:</span>
                <span className="font-mono text-slate-300">SQLite 3 (WAL mode + FTS5 Full Text Index)</span>
              </div>
              <div>
                <span className="text-slate-500 block">File Path:</span>
                <span className="font-mono text-slate-300">./server/db/viral_copywriter.db</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
