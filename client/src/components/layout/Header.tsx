import React from "react";
import { Cpu, ShieldCheck, KeyRound, Sparkles, ExternalLink } from "lucide-react";
import { NavigationTab } from "../../types";

interface HeaderProps {
  activeTab: NavigationTab;
  onNewGeneration?: () => void;
  apiKeyConfigured?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNewGeneration,
  apiKeyConfigured = false,
}) => {
  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: { title: "Overview Dashboard", subtitle: "Copywriting intelligence metrics and system telemetry" },
    create: { title: "Create Viral Content", subtitle: "13-stage cognitive pipeline with 5 distinct psychological versions" },
    hooks: { title: "Viral Hook Engine", subtitle: "Generate 10+ categorized hooks with 7-dimension scroll-stopping scores" },
    ideas: { title: "Content Idea Matrix", subtitle: "Generate 20 high-converting angles, emotional triggers and formats" },
    rewrite: { title: "Content Rewrite & Critic", subtitle: "11-point diagnostic scoring and automatic weakness elimination" },
    repurpose: { title: "Omnichannel Repurposer", subtitle: "Atomize 1 piece of long-form copy into 40+ platform-native posts" },
    knowledge: { title: "Knowledge Library", subtitle: "Proprietary swipe files, books, and extracted copywriting principles" },
    voice: { title: "Voice Profile Studio", subtitle: "Analyze human writing rhythms and synthesize custom style archetypes" },
    history: { title: "Generation History & Bookmarks", subtitle: "Searchable audit trail of generated copy, critiques, and scores" },
    tests: { title: "Automated Quality Benchmarks", subtitle: "20 standardized industry test cases with quality scoring" },
    settings: { title: "Engine Settings", subtitle: "Gemini API keys, model configuration, and pipeline parameters" },
  };

  const current = titles[activeTab] || { title: "Viral Copywriter AI", subtitle: "" };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d121f]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base font-semibold text-slate-100">{current.title}</h2>
        <p className="text-xs text-slate-400">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Model Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] text-indigo-300 font-medium">gemini-3.7-flash</span>
        </div>

        {/* API Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          {apiKeyConfigured ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium text-[11px]">API Active</span>
            </>
          ) : (
            <>
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-medium text-[11px]">Phase 1 Mock Mode</span>
            </>
          )}
        </div>

        {/* Action Button */}
        {onNewGeneration && (
          <button
            onClick={onNewGeneration}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Copy</span>
          </button>
        )}
      </div>
    </header>
  );
};
