import { useMemo, useState } from 'react'
import { useCountdown } from '../shared/useCountdown'
import { sendRuntimeMessage } from '../shared/messaging'

const ALLOW_ONCE_WAIT_SECONDS = 15
const ALLOW_ONCE_MINUTES = 10

function useBlockedParams() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      domain: params.get('domain') ?? '',
      label: params.get('label') ?? '',
      reason: params.get('reason') ?? '',
    }
  }, [])
}

export default function Blocked() {
  const { domain, label } = useBlockedParams()
  const [panelOpen, setPanelOpen] = useState(false)
  const [reasonText, setReasonText] = useState('')
  const [busy, setBusy] = useState(false)
  const { secondsLeft, done } = useCountdown(ALLOW_ONCE_WAIT_SECONDS)

  function goBack() {
    if (window.history.length > 1) window.history.back()
    else window.close()
  }

  async function alwaysAllow() {
    setBusy(true)
    await sendRuntimeMessage({ type: 'ADD_QUICK_RULE', target: 'domain', action: 'allow', value: domain })
    window.location.href = `https://${domain}`
  }

  async function submitAllowOnce() {
    if (!done || reasonText.trim().length === 0) return
    setBusy(true)
    await sendRuntimeMessage({
      type: 'ALLOW_ONCE',
      domain,
      minutes: ALLOW_ONCE_MINUTES,
      reason: reasonText.trim(),
    })
    window.location.href = `https://${domain}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-fg-surface p-7 shadow-2xl">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-fg-accent" />
          FocusGuard
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-100">This site is blocked</h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          {label ? `${label} (${domain})` : domain} is on your distraction list.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={goBack}
            className="rounded-lg border border-fg-accent bg-fg-accent px-4 py-2.5 text-left text-sm font-semibold text-white hover:bg-fg-accent-hover"
          >
            Go back
          </button>

          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-left text-sm font-semibold text-slate-100 hover:bg-slate-800"
          >
            Allow once
            <span className="mt-0.5 block text-xs font-normal text-slate-400">
              {ALLOW_ONCE_MINUTES} minutes, requires a short wait and a reason
            </span>
          </button>

          {panelOpen && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 p-3.5">
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="Why do you need this right now?"
                className="min-h-[60px] w-full resize-y rounded-md border border-slate-700 bg-fg-surface p-2 text-sm text-slate-100 placeholder:text-slate-500"
              />
              <button
                onClick={submitAllowOnce}
                disabled={!done || reasonText.trim().length === 0 || busy}
                className="rounded-lg bg-fg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!done
                  ? `Please wait ${secondsLeft}s…`
                  : reasonText.trim().length === 0
                    ? 'Type a reason to continue'
                    : 'Allow for 10 minutes'}
              </button>
            </div>
          )}

          <button
            onClick={alwaysAllow}
            disabled={busy}
            className="rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-left text-sm font-semibold text-slate-100 hover:bg-slate-800 disabled:opacity-50"
          >
            Always allow this site
          </button>
        </div>
      </div>
    </div>
  )
}
