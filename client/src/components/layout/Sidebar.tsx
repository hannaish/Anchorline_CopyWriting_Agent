import React from "react";
import {
  Sparkles,
  LayoutDashboard,
  Zap,
  Lightbulb,
  FileEdit,
  Share2,
  BookOpen,
  UserCheck,
  Clock,
  FlaskConical,
  Settings,
  Flame
} from "lucide-react";
import { NavigationTab } from "../../types";

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  knowledgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  knowledgeCount = 56
}) => {
  const navItems: { id: NavigationTab; label: string; icon: any; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create", label: "Create Content", icon: Sparkles, badge: "Core" },
    { id: "hooks", label: "Hook Engine", icon: Zap, badge: "10+ Scored" },
    { id: "ideas", label: "Idea Generator", icon: Lightbulb, badge: "20 Ideas" },
    { id: "rewrite", label: "Rewrite & Critique", icon: FileEdit },
    { id: "repurpose", label: "Repurpose (5 in 1)", icon: Share2 },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen, badge: `${knowledgeCount}` },
    { id: "voice", label: "Voice Studio", icon: UserCheck },
    { id: "history", label: "History & Saved", icon: Clock },
    { id: "tests", label: "Quality Benchmarks", icon: FlaskConical, badge: "20 Tests" },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d121f] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Logo / Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight flex items-center gap-1.5">
              Viral Copywriter <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-semibold border border-indigo-500/30">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Content Intelligence Suite</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-indigo-700 text-indigo-100"
                        : "bg-slate-800 text-slate-400 border border-slate-700/60"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer system status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">Pipeline Engine</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">v1.0 (Phase 1)</span>
        </div>
      </div>
    </aside>
  );
};
