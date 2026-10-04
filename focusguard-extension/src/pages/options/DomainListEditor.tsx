import { useState } from 'react'
import type { DefaultListEntry } from '../../shared/types'

/** Shared add/toggle/remove editor for a domain list — used for both the default distracting list and the never-classify list. */
export function DomainListEditor({ list, onChange }: { list: DefaultListEntry[]; onChange: (list: DefaultListEntry[]) => void }) {
  const [domain, setDomain] = useState('')
  const [label, setLabel] = useState('')

  function addEntry() {
    const d = domain.trim().toLowerCase()
    if (!d) return
    if (list.some((e) => e.domain === d)) return
    onChange([...list, { domain: d, label: label.trim() || d, enabled: true }])
    setDomain('')
    setLabel('')
  }

  function toggleEntry(d: string) {
    onChange(list.map((e) => (e.domain === d ? { ...e, enabled: !e.enabled } : e)))
  }

  function removeEntry(d: string) {
    onChange(list.filter((e) => e.domain !== d))
  }

  return (
    <div>
      <div className="mb-4 rounded-xl border border-slate-800 bg-fg-surface p-4">
        <p className="mb-3 text-sm font-semibold text-slate-300">Add a site</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional)"
            className="min-w-[160px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500"
          />
          <button
            onClick={addEntry}
            className="rounded-lg bg-fg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-fg-accent-hover"
          >
            Add
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        {list.map((e) => (
          <div
            key={e.domain}
            className="flex items-center justify-between border-t border-slate-800 bg-fg-surface px-4 py-2.5 first:border-t-0 odd:bg-fg-surface even:bg-slate-900/40"
          >
            <div>
              <p className="text-sm font-medium">{e.label}</p>
              <p className="text-xs text-slate-500">{e.domain}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <input type="checkbox" checked={e.enabled} onChange={() => toggleEntry(e.domain)} />
                Enabled
              </label>
              <button onClick={() => removeEntry(e.domain)} className="text-xs font-semibold text-slate-500 hover:text-red-400">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
