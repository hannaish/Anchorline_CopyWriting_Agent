import { useEffect, useMemo, useRef, useState } from 'react'
import AiTab from './AiTab'
import PrivacyTab from './PrivacyTab'
import { DomainListEditor } from './DomainListEditor'
import { getDefaultList, getManualRules, setDefaultList, setManualRules } from '../../shared/storage'
import { buildExportPayload, parseImportPayload } from '../../shared/importExport'
import type { DefaultListEntry, ManualRule, RuleAction, RuleTarget } from '../../shared/types'

type Tab = 'rules' | 'defaultList' | 'ai' | 'privacy' | 'importExport'

const TARGET_LABELS: Record<RuleTarget, string> = {
  domain: 'Domain',
  url: 'Exact URL',
  youtubeChannel: 'YouTube channel',
  keyword: 'Keyword',
}

const TARGET_PLACEHOLDERS: Record<RuleTarget, string> = {
  domain: 'example.com',
  url: 'https://example.com/some/page',
  youtubeChannel: '@channelhandle',
  keyword: 'movie recap',
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
        active ? 'bg-fg-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

export default function Options() {
  const [tab, setTab] = useState<Tab>('rules')
  const [rules, setRules] = useState<ManualRule[]>([])
  const [defaultList, setDefaultListState] = useState<DefaultListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    void (async () => {
      const [r, d] = await Promise.all([getManualRules(), getDefaultList()])
      setRules(r)
      setDefaultListState(d)
      setLoading(false)
    })()
  }, [])

  async function persistRules(next: ManualRule[]) {
    setRules(next)
    await setManualRules(next)
  }

  async function persistDefaultList(next: DefaultListEntry[]) {
    setDefaultListState(next)
    await setDefaultList(next)
  }

  if (loading) {
    return <div className="min-h-screen bg-fg-bg p-8 text-slate-400">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-fg-bg text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-fg-accent" />
          <h1 className="text-lg font-bold">FocusGuard</h1>
          <span className="text-sm text-slate-500">Options</span>
        </div>

        <div className="mb-6 flex gap-1 border-b border-slate-800 pb-2">
          <TabButton active={tab === 'rules'} onClick={() => setTab('rules')}>
            Rules
          </TabButton>
          <TabButton active={tab === 'defaultList'} onClick={() => setTab('defaultList')}>
            Default distracting list
          </TabButton>
          <TabButton active={tab === 'ai'} onClick={() => setTab('ai')}>
            AI
          </TabButton>
          <TabButton active={tab === 'privacy'} onClick={() => setTab('privacy')}>
            Privacy
          </TabButton>
          <TabButton active={tab === 'importExport'} onClick={() => setTab('importExport')}>
            Import / Export
          </TabButton>
        </div>

        {tab === 'rules' && (
          <RulesTab rules={rules} search={search} onSearchChange={setSearch} onChange={persistRules} />
        )}
        {tab === 'defaultList' && (
          <div>
            <p className="mb-3 text-sm text-slate-400">
              Sites here are blocked by default in every focus mode. An "Always allow" rule for a domain overrides it.
            </p>
            <DomainListEditor list={defaultList} onChange={persistDefaultList} />
          </div>
        )}
        {tab === 'ai' && <AiTab />}
        {tab === 'privacy' && <PrivacyTab />}
        {tab === 'importExport' && (
          <ImportExportTab
            rules={rules}
            defaultList={defaultList}
            onImport={async (r, d) => {
              await persistRules(r)
              await persistDefaultList(d)
            }}
          />
        )}
      </div>
    </div>
  )
}

function RulesTab({
  rules,
  search,
  onSearchChange,
  onChange,
}: {
  rules: ManualRule[]
  search: string
  onSearchChange: (v: string) => void
  onChange: (rules: ManualRule[]) => void
}) {
  const [target, setTarget] = useState<RuleTarget>('domain')
  const [action, setAction] = useState<RuleAction>('block')
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rules
    return rules.filter((r) => r.value.toLowerCase().includes(q) || (r.note ?? '').toLowerCase().includes(q))
  }, [rules, search])

  function addRule() {
    const trimmed = value.trim()
    if (!trimmed) return
    const newRule: ManualRule = {
      id: crypto.randomUUID(),
      target,
      action,
      value: trimmed,
      note: note.trim() || undefined,
      createdAt: Date.now(),
    }
    onChange([...rules, newRule])
    setValue('')
    setNote('')
  }

  function removeRule(id: string) {
    onChange(rules.filter((r) => r.id !== id))
  }

  return (
    <div>
      <div className="mb-4 rounded-xl border border-slate-800 bg-fg-surface p-4">
        <p className="mb-3 text-sm font-semibold text-slate-300">Add a rule</p>
        <div className="flex flex-wrap gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as RuleTarget)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-sm"
          >
            {(Object.keys(TARGET_LABELS) as RuleTarget[]).map((t) => (
              <option key={t} value={t}>
                {TARGET_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as RuleAction)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-sm"
          >
            <option value="block">Block</option>
            <option value="allow">Allow</option>
          </select>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={TARGET_PLACEHOLDERS[target]}
            className="min-w-[220px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="min-w-[160px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500"
          />
          <button
            onClick={addRule}
            className="rounded-lg bg-fg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-fg-accent-hover"
          >
            Add rule
          </button>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search rules…"
        className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500"
      />

      <div className="overflow-hidden rounded-xl border border-slate-800">
        {filtered.length === 0 ? (
          <p className="bg-fg-surface p-4 text-sm text-slate-500">No rules yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {filtered
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((r) => (
                  <tr key={r.id} className="border-t border-slate-800 first:border-t-0 odd:bg-fg-surface even:bg-slate-900/40">
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                          r.action === 'block' ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {r.action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-400">{TARGET_LABELS[r.target]}</td>
                    <td className="px-3 py-2.5 font-medium">{r.value}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{r.note}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={() => removeRule(r.id)} className="text-xs font-semibold text-slate-500 hover:text-red-400">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ImportExportTab({
  rules,
  defaultList,
  onImport,
}: {
  rules: ManualRule[]
  defaultList: DefaultListEntry[]
  onImport: (rules: ManualRule[], defaultList: DefaultListEntry[]) => Promise<void>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function exportJson() {
    const payload = buildExportPayload(rules, defaultList)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focusguard-rules-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(file: File) {
    setError(null)
    try {
      const text = await file.text()
      const parsed = parseImportPayload(JSON.parse(text))
      if (!parsed) {
        setError('That file doesn\'t look like a FocusGuard export.')
        return
      }
      const confirmed = window.confirm(
        `Import ${parsed.manualRules.length} rule(s) and ${parsed.defaultList.length} default-list entr(ies)? This replaces your current rules and default list.`,
      )
      if (!confirmed) return
      await onImport(parsed.manualRules, parsed.defaultList)
    } catch {
      setError('Could not read that file as JSON.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <p className="mb-2 text-sm font-semibold text-slate-300">Export</p>
        <p className="mb-3 text-xs text-slate-500">Download your rules and default list as a JSON file.</p>
        <button onClick={exportJson} className="rounded-lg bg-fg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-fg-accent-hover">
          Export JSON
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-fg-surface p-4">
        <p className="mb-2 text-sm font-semibold text-slate-300">Import</p>
        <p className="mb-3 text-xs text-slate-500">Importing replaces your current rules and default list.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
        >
          Choose file…
        </button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}
