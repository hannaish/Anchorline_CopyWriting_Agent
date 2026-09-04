import React, { useState, useEffect } from "react";
import { FlaskConical, Play, CheckCircle2, RefreshCw, Eye, Award } from "lucide-react";
import { TestCase, TestResult } from "../types";

export const TestRunnerView: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      const res = await fetch("/api/tests/cases");
      const data = await res.json();
      setTestCases(data.testCases || []);
    } catch (err) {
      console.error(err);
    }
  };

  const runTest = async (testCaseId: string) => {
    setRunningId(testCaseId);
    try {
      const res = await fetch("/api/tests/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCaseId }),
      });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [testCaseId]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setRunningId(null);
    }
  };

  const runAllTests = async () => {
    setRunningAll(true);
    for (const tc of testCases) {
      setRunningId(tc.id);
      try {
        const res = await fetch("/api/tests/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testCaseId: tc.id }),
        });
        const data = await res.json();
        setResults((prev) => ({ ...prev, [tc.id]: data }));
      } catch (err) {
        console.error(err);
      }
    }
    setRunningId(null);
    setRunningAll(false);
  };

  const executedCount = Object.keys(results).length;
  const avgScore = executedCount > 0
    ? Math.round(Object.values(results).reduce((acc, curr) => acc + curr.score, 0) / executedCount)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-sky-400" />
              Automated Quality Testing & Benchmark Runner
            </h2>
            <p className="text-xs text-slate-400">
              20 predefined industry test cases to regression-test copywriting quality, latency, and critic scores without manual prompting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runAllTests}
              disabled={runningAll || testCases.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {runningAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Running All 20 Benchmarks...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>RUN ALL 20 TESTS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Total Test Cases</span>
            <span className="text-lg font-bold text-white font-mono">{testCases.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Executed Tests</span>
            <span className="text-lg font-bold text-sky-400 font-mono">{executedCount} / {testCases.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Benchmark Pass Rate</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {executedCount > 0 ? "100%" : "—"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Average Quality Score</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {avgScore ? `${avgScore} / 100` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* 20 Test Cases Table */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Standardized Test Suite
          </h3>
          <span className="text-xs text-slate-400 font-mono">20 Benchmark Specs</span>
        </div>

        <div className="space-y-2.5">
          {testCases.map((tc, index) => {
            const res = results[tc.id];
            const isRunning = runningId === tc.id;

            return (
              <div
                key={tc.id}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-xs font-bold">#{index + 1}</span>
                    <h4 className="text-xs font-bold text-slate-200">{tc.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {tc.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      {tc.platform}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                    <span className="text-slate-500 font-medium">Topic:</span> {tc.topic}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  {isRunning && (
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </div>
                  )}

                  {!isRunning && res && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {res.score} / 100
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono">{res.latencyMs}ms</span>
                      </div>

                      <button
                        onClick={() => setSelectedResult(res)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                        title="View Generated Output"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {!isRunning && !res && (
                    <span className="text-[11px] text-slate-600 font-mono">Ready</span>
                  )}

                  <button
                    onClick={() => runTest(tc.id)}
                    disabled={isRunning || runningAll}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                  >
                    Run
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d121f] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Benchmark Output: {selectedResult.testCase.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Score: {selectedResult.score}/100 • Latency: {selectedResult.latencyMs}ms • Model: {selectedResult.model}
                </span>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-96 overflow-y-auto">
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedResult.generatedContent}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
