import React, { useState } from "react";
import { Clock, Bookmark, Search, Copy, Check, ExternalLink } from "lucide-react";

export const HistoryView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mockHistory = [
    {
      id: "hist_1",
      title: "Why most founders fail to scale from $1M to $10M ARR",
      platform: "LinkedIn",
      versionType: "Bold + Contrarian",
      score: 94,
      date: "Today, 9:20 PM",
      hook: "Unpopular opinion: Stop trying to master growth. Complexity is a coping mechanism for founders afraid of boring execution.",
      content: `Unpopular opinion: Stop trying to master growth.

The advice 99% of industry "experts" preach is keeping you broke and exhausted.

They tell you to:
- Work 80-hour grind weeks
- Post 5 times a day
- Chase every shiny algorithm hack

Meanwhile, the top 1% of founders do the exact opposite:
They build one simple, defensible leverage point and double down for 24 months straight.

Complexity is a coping mechanism for people who are afraid of boring execution.

Are you willing to ditch the noise and do what actually converts?`,
    },
    {
      id: "hist_2",
      title: "The $0 Customer Acquisition Playbook",
      platform: "X / Twitter",
      versionType: "Curiosity-driven",
      score: 93,
      date: "Yesterday, 3:15 PM",
      hook: "There is a silent reason why 90% of solo creators hit a brick wall when trying to monetize.",
      content: `There is a silent reason why 90% of solo creators hit a brick wall when trying to monetize.

It has nothing to do with follower count.
It has everything to do with offer specificity.

If your bio says "I help creators grow", you are invisible.
If you say "I add $5K MRR to newsletter writers via sponsored drops", you print inbound.

Specificity breeds credibility.`,
    },
    {
      id: "hist_3",
      title: "3 Years in a Parked Car: What Rock Bottom Taught Me",
      platform: "Instagram",
      versionType: "Story-driven",
      score: 96,
      date: "2 days ago",
      hook: "Three years ago, I sat in my parked car at 11 PM, wondering if I should completely walk away from entrepreneurship.",
      content: `Three years ago, I sat in my parked car at 11 PM, staring at my bank account and wondering if I had made the biggest mistake of my life.

I had quit my stable job. I had promised my family this would work.
And yet, six months in, I was working 14-hour days with almost nothing to show for it.

The turning point wasn't some miracle hack. It was learning how to simplify our offering down to one undeniable result.`,
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Generation History & Saved Bookmarks
          </h2>
          <p className="text-xs text-slate-400">
            Searchable audit trail of generated copy, psychological angles, and critique scores.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
          {mockHistory.length} Saved Records
        </span>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-200">{item.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                    {item.platform}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.versionType}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">{item.date}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-400">{item.score} / 100</span>
                  <span className="block text-[10px] text-slate-500">Quality Score</span>
                </div>
                <button
                  onClick={() => handleCopy(item.content, item.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {item.content}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
