import { useEffect, useState } from 'react'
import { DomainListEditor } from './DomainListEditor'
import { clearSentLog, getNeverClassifyList, getSentLog, setNeverClassifyList } from '../../shared/storage'
import type { DefaultListEntry, SentLogEntry } from '../../shared/types'

export default function PrivacyTab() {
  const [neverClassify, setNeverClassify] = useState<DefaultListEntry[] | null>(null)
  const [log, setLog] = useState<SentLogEntry[] | null>(null)

  useEffect(() => {
    void (async () => {
      const [list, sentLog] = await Promise.all([getNeverClassifyList(), getSentLog()])
      setNeverClassify(list)
      setLog(sentLog)
    })()
  }, [])

  async function persistNeverClassify(next: DefaultListEntry[]) {
    setNeverClassify(next)
    await setNeverClassifyList(next)
  }

  async function handleClearLog() {
    await clearSentLog()
    setLog([])
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-1 text-sm font-semibold text-slate-200">Never sent to AI</h2>
        <p className="mb-3 text-sm text-slate-400">
          These sites are always allowed and never reach the AI classifier — banking, email, health, and password managers by default.
        </p>
        {neverClassify && <DomainListEditor list={neverClassify} onChange={persistNeverClassify} />}
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">What was sent to the AI</h2>
          <button onClick={handleClearLog} className="text-xs font-semibold text-slate-500 hover:text-red-400">
            Clear log
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-400">
          Every time a page reached the AI step, here's exactly what was sent — nothing more leaves the device.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          {!log ? (
            <p className="bg-fg-surface p-4 text-sm text-slate-500">Loading…</p>
          ) : log.length === 0 ? (
            <p className="bg-fg-surface p-4 text-sm text-slate-500">Nothing sent yet.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {log.map((entry, i) => (
                <div key={`${entry.timestamp}-${i}`} className="border-t border-slate-800 bg-fg-surface p-3 first:border-t-0 odd:bg-fg-surface even:bg-slate-900/40">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-semibold text-slate-300">
                      {entry.category} → {entry.verdict}
                    </span>
                  </div>
                  <p className="mb-1 truncate text-xs text-slate-400" title={entry.url}>
                    {entry.url}
                  </p>
                  <p className="text-xs text-slate-500">Fields sent: {entry.fieldsSent.join(', ')}</p>
                  <p className="mt-1 text-xs italic text-slate-600">{entry.excerptPreview}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
