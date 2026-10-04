import { extractPageSignals } from './extractPageText'
import { extractYouTubeMeta } from './youtube'
import { mountBlockOverlay } from './overlay/BlockOverlay'
import type { BlockDecision, RuntimeMessage } from '../shared/types'

function sendMessage(message: RuntimeMessage): Promise<BlockDecision> {
  return chrome.runtime.sendMessage(message) as Promise<BlockDecision>
}

let overlayMounted = false
let lastSignals: { title: string; text: string } | null = null

function showBlockOverlay(decision: BlockDecision): void {
  if (overlayMounted) return
  overlayMounted = true
  mountBlockOverlay({
    hostname: location.hostname,
    url: location.href,
    reason: decision.reason,
    source: decision.source,
    category: decision.category,
    title: lastSignals?.title ?? document.title,
    textExcerpt: lastSignals?.text ?? '',
  })
}

async function checkUrlOnly(): Promise<void> {
  try {
    const decision = await sendMessage({ type: 'CHECK_URL', url: location.href })
    if (decision.blocked) showBlockOverlay(decision)
  } catch {
    // Background not reachable (e.g. extension reloading) — fail open, never break browsing.
  }
}

async function checkWithPageText(): Promise<void> {
  if (overlayMounted) return
  try {
    const signals = extractPageSignals()
    lastSignals = { title: signals.title, text: signals.text }
    const youtube = extractYouTubeMeta() ?? undefined
    const decision = await sendMessage({
      type: 'CHECK_TEXT',
      url: location.href,
      title: signals.title,
      metaDescription: signals.metaDescription,
      headings: signals.headings,
      text: signals.text,
      youtube,
    })
    if (decision.blocked) showBlockOverlay(decision)
  } catch {
    // Fail open.
  }
}

void checkUrlOnly()

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  void checkWithPageText()
} else {
  document.addEventListener('DOMContentLoaded', () => void checkWithPageText(), { once: true })
}
