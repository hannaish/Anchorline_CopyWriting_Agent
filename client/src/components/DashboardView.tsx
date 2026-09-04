import React from "react";
import {
  Sparkles,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Share2
} from "lucide-react";
import { NavigationTab } from "../types";

interface DashboardViewProps {
  setActiveTab: (tab: NavigationTab) => void;
  knowledgeCount?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  knowledgeCount = 56,
}) => {
  const stats = [
    { label: "Avg. Content Score", value: "92.4", change: "+4.2%", icon: Award, color: "text-emerald-400" },
    { label: "Knowledge Swipes", value: `${knowledgeCount}`, change: "Active", icon: BookOpen, color: "text-indigo-400" },
    { label: "Viral Hook Formulas", value: "56+", change: "Indexed", icon: Zap, color: "text-amber-400" },
    { label: "Quality Benchmarks", value: "20 / 20", change: "Passing", icon: CheckCircle2, color: "text-sky-400" },
  ];

  const recentOutputs = [
    {
      title: "Why 90% of Founders Fail at Executive Hiring",
      platform: "LinkedIn",
      version: "Bold + Contrarian",
      score: 94,
      time: "10m ago",
    },
    {
      title: "The $0 Customer Acquisition Playbook",
      platform: "X / Twitter",
      version: "Curiosity-driven",
      score: 93,
      time: "1h ago",
    },
    {
      title: "3 Years in a Parked Car: What Rock Bottom Taught Me",
      platform: "Instagram",
      version: "Story-driven",
      score: 96,
      time: "3h ago",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/40 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Proprietary Content Intelligence Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-3">
            Stop Guessing. Engineer Viral Copy with Gemini.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            A structured, 13-stage copywriting system powered by your proprietary knowledge library,
            psychological angle mapping, 11-dimension critique scoring, and automatic revision loops.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("create")}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate 5 Versions
            </button>
            <button
              onClick={() => setActiveTab("hooks")}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Test Viral Hooks
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className="px-5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700/60 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Browse Knowledge Base
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">{stat.value}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/50">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Recent Generations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline Features */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">13-Stage Production Pipeline</h2>
              <p className="text-xs text-slate-400">How Viral Copywriter turns user goals into high-converting copy</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Autonomous Loops Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { stage: "01", title: "Request Analyzer", desc: "Extracts underlying intent, niche, audience & core belief tension." },
              { stage: "02", title: "Knowledge Retrieval", desc: "Queries SQLite FTS5 for top 3-5 principles & proven swipe frameworks." },
              { stage: "03", title: "Hook & Angle Engine", desc: "Generates 10 hooks & 10 angles, scoring each across 7 engagement metrics." },
              { stage: "04", title: "5-Version Generation", desc: "Drafts Educational, Contrarian, Story, Curiosity, and Emotional versions." },
              { stage: "05", title: "Content Critic & Scoring", desc: "Evaluates 11 criteria (0-100) and pinpoints weakest lines." },
              { stage: "06", title: "Auto-Improvement Loop", desc: "Rewrites weak sections automatically until quality score reaches >= 90." },
            ].map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    {s.stage}
                  </span>
                  <h3 className="text-xs font-semibold text-slate-200">{s.title}</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Audit Trail */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Generations</h2>
              <button
                onClick={() => setActiveTab("history")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentOutputs.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTab("create")}
                  className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200 line-clamp-1">{item.title}</span>
                    <span className="font-mono text-emerald-400 font-bold ml-2">{item.score}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{item.platform}</span>
                    <span className="text-slate-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab("tests")}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              Run 20 Quality Benchmarks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
