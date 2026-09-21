import { extractPageText } from './extractPageText'
import { mountBlockOverlay } from './overlay/BlockOverlay'
import type { BlockDecision, RuntimeMessage } from '../shared/types'

function sendMessage(message: RuntimeMessage): Promise<BlockDecision> {
  return chrome.runtime.sendMessage(message) as Promise<BlockDecision>
}

let overlayMounted = false

function showBlockOverlay(reason: string): void {
  if (overlayMounted) return
  overlayMounted = true
  mountBlockOverlay({ hostname: location.hostname, reason })
}

async function checkUrlOnly(): Promise<void> {
  try {
    const decision = await sendMessage({ type: 'CHECK_URL', url: location.href })
    if (decision.blocked) showBlockOverlay(decision.reason)
  } catch {
    // Background not reachable (e.g. extension reloading) — fail open, never break browsing.
  }
}

async function checkWithPageText(): Promise<void> {
  if (overlayMounted) return
  try {
    const text = extractPageText()
    const decision = await sendMessage({ type: 'CHECK_TEXT', url: location.href, text })
    if (decision.blocked) showBlockOverlay(decision.reason)
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
