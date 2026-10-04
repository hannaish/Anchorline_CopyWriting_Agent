import { useEffect, useState } from 'react'
import {
  clearAiApiKey,
  getAiApiKey,
  getAISettings,
  getAiStatus,
  getAiUsage,
  setAiApiKey,
  setAISettings,
} from '../../shared/storage'
import type { AISensitivity, AISettings, AIStatus, AIUsage } from '../../shared/types'

const SENSITIVITY_OPTIONS: { value: AISensitivity; label: string }[] = [
  { value: 'lenient', label: 'Lenient — only block what\'s clearly off-focus' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'strict', label: 'Strict — only allow what\'s clearly on-focus' },
]

export default function AiTab() {
  const [settings, setSettings] = useState<AISettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [hasStoredKey, setHasStoredKey] = useState(false)
  const [status, setStatus] = useState<AIStatus | null>(null)
  const [usage, setUsage] = useState<AIUsage | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void (async () => {
      const [s, key, st, u] = await Promise.all([getAISettings(), getAiApiKey(), getAiStatus(), getAiUsage()])
      setSettings(s)
      setHasStoredKey(key !== null)
      setStatus(st)
      setUsage(u)
    })()
  }, [])

  async function save() {
    if (!settings) return
    await setAISettings(settings)
    if (apiKey.trim()) {
      await setAiApiKey(apiKey.trim())
      setHasStoredKey(true)
      setApiKey('')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function removeKey() {
    await clearAiApiKey()
    setHasStoredKey(false)
  }

  if (!settings) return <p className="text-sm text-slate-500">Loading…</p>

  return (
    <div className="space-y-4">
      {status?.unavailable && (
        <div className="rounded-xl border border-amber-700/50 bg-amber-950/40 p-3 text-sm text-amber-300">
          AI unavailable — {status.reason ?? 'falling back to rules and the default list'}. Browsing is never blocked because of this.
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <label className="mb-1 block text-sm font-semibold text-slate-300">What are you focusing on?</label>
        <p className="mb-2 text-xs text-slate-500">
          Plain language, e.g. "studying for exams" or "researching ad campaigns". This is the source of truth the AI judges every page
          against — content that teaches or analyzes something relevant is allowed even on entertainment sites; story-driven or movie
          content is blocked unless you say otherwise. Music is always allowed regardless of this.
        </p>
        <textarea
          value={settings.focusIntent}
          onChange={(e) => setSettings({ ...settings, focusIntent: e.target.value })}
          placeholder="e.g. researching Meta/Google ad campaigns, studying for exams, learning React"
          className="min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm placeholder:text-slate-500"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-300">Enable AI classification</label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="h-4 w-4"
          />
        </div>
        <p className="text-xs text-slate-500">
          Only runs for pages manual rules and the default list don't already decide. Never runs for internal pages, localhost, or the
          sensitive sites on the Privacy tab.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <label className="mb-1 block text-sm font-semibold text-slate-300">Anthropic API key</label>
        <p className="mb-2 text-xs text-slate-500">
          Stored only in this browser's local extension storage — never synced, never logged. Bring your own key from{' '}
          <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="underline">
            console.anthropic.com
          </a>
          .
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasStoredKey ? 'Key saved — enter a new one to replace it' : 'sk-ant-...'}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500"
          />
          {hasStoredKey && (
            <button onClick={removeKey} className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-semibold hover:bg-slate-800">
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">{hasStoredKey ? 'A key is currently saved.' : 'No key saved yet — AI checks stay off until one is set.'}</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <label className="mb-1 block text-sm font-semibold text-slate-300">Model</label>
        <input
          value={settings.model}
          onChange={(e) => setSettings({ ...settings, model: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <label className="mb-1 block text-sm font-semibold text-slate-300">Sensitivity</label>
        <select
          value={settings.sensitivity}
          onChange={(e) => setSettings({ ...settings, sensitivity: e.target.value as AISensitivity })}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        >
          {SENSITIVITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <label className="mb-1 block text-sm font-semibold text-slate-300">
          Block confidence threshold: {settings.confidenceThreshold.toFixed(2)}
        </label>
        <p className="mb-2 text-xs text-slate-500">Blocks only when the AI says "block" with at least this much confidence.</p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.confidenceThreshold}
          onChange={(e) => setSettings({ ...settings, confidenceThreshold: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <label className="mb-1 block text-sm font-semibold text-slate-300">Daily AI call cap</label>
        <input
          type="number"
          min={1}
          value={settings.dailyCallCap}
          onChange={(e) => setSettings({ ...settings, dailyCallCap: Math.max(1, Number(e.target.value)) })}
          className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        {usage && (
          <p className="mt-2 text-xs text-slate-500">
            Used {usage.count} of {settings.dailyCallCap} today.
          </p>
        )}
      </div>

      <button onClick={save} className="rounded-lg bg-fg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-fg-accent-hover">
        {saved ? 'Saved ✓' : 'Save'}
      </button>
    </div>
  )
}
