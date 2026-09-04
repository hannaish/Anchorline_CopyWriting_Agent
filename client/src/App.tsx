import React, { useState, useEffect } from "react";
import { NavigationTab } from "./types";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";

// Views
import { DashboardView } from "./components/DashboardView";
import { CreateContentView } from "./components/CreateContentView";
import { HooksEngineView } from "./components/HooksEngineView";
import { IdeasEngineView } from "./components/IdeasEngineView";
import { RewriteView } from "./components/RewriteView";
import { RepurposeView } from "./components/RepurposeView";
import { KnowledgeView } from "./components/KnowledgeView";
import { VoiceStudioView } from "./components/VoiceStudioView";
import { HistoryView } from "./components/HistoryView";
import { TestRunnerView } from "./components/TestRunnerView";
import { SettingsView } from "./components/SettingsView";

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [systemStats, setSystemStats] = useState<{
    apiKeyConfigured: boolean;
    hooksCount: number;
    docsCount: number;
  }>({
    apiKeyConfigured: false,
    hooksCount: 56,
    docsCount: 0,
  });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setSystemStats({
          apiKeyConfigured: data.apiKeyConfigured || false,
          hooksCount: data.stats?.hooks || 56,
          docsCount: data.stats?.documents || 0,
        });
      })
      .catch((err) => console.log("Server status check:", err.message));
  }, []);

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 font-sans overflow-hidden">
      {/* SaaS Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        knowledgeCount={systemStats.hooksCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          apiKeyConfigured={systemStats.apiKeyConfigured}
          onNewGeneration={() => setActiveTab("create")}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === "dashboard" && (
            <DashboardView setActiveTab={setActiveTab} knowledgeCount={systemStats.hooksCount} />
          )}
          {activeTab === "create" && <CreateContentView />}
          {activeTab === "hooks" && <HooksEngineView />}
          {activeTab === "ideas" && <IdeasEngineView setActiveTab={setActiveTab} />}
          {activeTab === "rewrite" && <RewriteView />}
          {activeTab === "repurpose" && <RepurposeView />}
          {activeTab === "knowledge" && <KnowledgeView />}
          {activeTab === "voice" && <VoiceStudioView />}
          {activeTab === "history" && <HistoryView />}
          {activeTab === "tests" && <TestRunnerView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default App;
