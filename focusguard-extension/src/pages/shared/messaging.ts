import type { BlockDecision, RuntimeMessage } from '../../shared/types'

export function sendRuntimeMessage(message: RuntimeMessage): Promise<BlockDecision | { ok: true }> {
  return chrome.runtime.sendMessage(message)
}
