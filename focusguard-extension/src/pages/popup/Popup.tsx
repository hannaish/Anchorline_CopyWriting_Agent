import { useCallback, useEffect, useState } from 'react'
import { evaluateDecision } from '../../shared/decisionEngine'
import { getAISettings, getAiStatus, getManualRules, getSettings, setManualRules, setSettings } from '../../shared/storage'
import type { AISettings, AIStatus, BlockDecision, Settings } from '../../shared/types'

interface TabInfo {
  url: string
  hostname: string
}

const PAUSE_OPTIONS = [
  { label: '15 min', ms: 15 * 60_000 },
  { label: '1 hour', ms: 60 * 60_000 },
]

async function getActiveTab(): Promise<TabInfo | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url) return null
  try {
    const url = new URL(tab.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return { url: tab.url, hostname: url.hostname }
  } catch {
    return null
  }
}

export default function Popup() {
  const [tab, setTab] = useState<TabInfo | null>(null)
  const [decision, setDecision] = useState<BlockDecision | null>(null)
  const [settings, setSettingsState] = useState<Settings | null>(null)
  const [aiSettings, setAiSettingsState] = useState<AISettings | null>(null)
  const [aiStatus, setAiStatusState] = useState<AIStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [activeTab, currentSettings, currentAiSettings, currentAiStatus] = await Promise.all([
      getActiveTab(),
      getSettings(),
      getAISettings(),
      getAiStatus(),
    ])
    setTab(activeTab)
    setSettingsState(currentSettings)
    setAiSettingsState(currentAiSettings)
    setAiStatusState(currentAiStatus)
    if (activeTab) {
      setDecision(await evaluateDecision({ url: activeTab.url }))
    } else {
      setDecision(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function addDomainRule(action: 'allow' | 'block') {
    if (!tab) return
    const rules = await getManualRules()
    const withoutDuplicate = rules.filter((r) => !(r.target === 'domain' && r.value.toLowerCase() === tab.hostname.toLowerCase()))
    await setManualRules([
      ...withoutDuplicate,
      { id: crypto.randomUUID(), target: 'domain', action, value: tab.hostname, createdAt: Date.now() },
    ])
    await refresh()
  }

  async function togglePause(ms: number) {
    if (!settings) return
    const next: Settings = settings.globalPause.active
      ? { globalPause: { active: false, expiresAt: null } }
      : { globalPause: { active: true, expiresAt: Date.now() + ms } }
    await setSettings(next)
    await refresh()
  }

  async function resumeNow() {
    await setSettings({ globalPause: { active: false, expiresAt: null } })
    await refresh()
  }

  return (
    <div className="w-[340px] bg-fg-bg p-4 text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="h-2 w-2 rounded-full bg-fg-accent" />
          FocusGuard
        </div>
        <div className="flex items-center gap-2">
          {aiStatus?.unavailable && (
            <span
              title={aiStatus.reason ?? 'AI unavailable'}
              className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300"
            >
              AI unavailable
            </span>
          )}
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Options
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-fg-surface p-4 text-sm text-slate-400">Checking…</div>
      ) : !tab ? (
        <div className="rounded-xl border border-slate-800 bg-fg-surface p-4 text-sm text-slate-400">
          FocusGuard doesn't run on this page.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
          <p className="mb-1 truncate text-xs text-slate-400" title={tab.hostname}>
            {tab.hostname}
          </p>
          <p className={`mb-1 text-sm font-bold ${decision?.blocked ? 'text-red-400' : 'text-emerald-400'}`}>
            {decision?.blocked ? 'Blocked' : 'Allowed'}
            {decision?.category && <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">{decision.category}</span>}
          </p>
          <p className="text-xs leading-relaxed text-slate-300">{decision?.reason}</p>
          {decision?.reason === 'No rule matched' && aiSettings?.enabled && (
            <p className="mt-1 text-[11px] text-slate-500">FocusGuard will check this more closely with AI once you open the page.</p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => addDomainRule('block')}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-2 text-xs font-semibold hover:bg-slate-800"
            >
              Always block
            </button>
            <button
              onClick={() => addDomainRule('allow')}
              className="flex-1 rounded-lg border border-fg-accent bg-fg-accent px-2 py-2 text-xs font-semibold text-white hover:bg-fg-accent-hover"
            >
              Always allow
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 rounded-xl border border-slate-800 bg-fg-surface p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Pause FocusGuard</p>
        {settings?.globalPause.active ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Paused until {settings.globalPause.expiresAt ? new Date(settings.globalPause.expiresAt).toLocaleTimeString() : '—'}
            </span>
            <button
              onClick={resumeNow}
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold hover:bg-slate-800"
            >
              Resume now
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            {PAUSE_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => togglePause(opt.ms)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-2 text-xs font-semibold hover:bg-slate-800"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
