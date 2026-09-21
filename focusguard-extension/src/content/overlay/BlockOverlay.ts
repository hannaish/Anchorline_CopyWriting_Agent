import { overlayStyles } from './styles'
import type { RuntimeMessage } from '../../shared/types'

const HOST_ID = 'focusguard-block-root'
const ALLOW_ONCE_WAIT_SECONDS = 15
const ALLOW_ONCE_MINUTES = 10

function sendMessage<T = { ok: true }>(message: RuntimeMessage): Promise<T> {
  return chrome.runtime.sendMessage(message) as Promise<T>
}

function pauseAndMuteMedia(): void {
  document.querySelectorAll<HTMLMediaElement>('video, audio').forEach((el) => {
    try {
      el.pause()
      el.muted = true
    } catch {
      // Media element may not support these ops yet (still loading) — ignore.
    }
  })
}

export interface BlockOverlayOptions {
  hostname: string
  reason: string
}

export function mountBlockOverlay({ hostname, reason }: BlockOverlayOptions): () => void {
  if (document.getElementById(HOST_ID)) {
    // Already showing (e.g. duplicate evaluation) — don't double-mount.
    return () => undefined
  }

  const host = document.createElement('div')
  host.id = HOST_ID
  host.style.cssText = 'all: initial; position: fixed; inset: 0; z-index: 2147483647;'
  const shadow = host.attachShadow({ mode: 'closed' })

  const style = document.createElement('style')
  style.textContent = overlayStyles
  shadow.appendChild(style)

  const overlay = document.createElement('div')
  overlay.className = 'fg-overlay'
  overlay.innerHTML = `
    <div class="fg-card">
      <div class="fg-badge"><span class="fg-dot"></span>FocusGuard</div>
      <p class="fg-title">This page is blocked</p>
      <p class="fg-reason" data-role="reason"></p>
      <div class="fg-actions">
        <button class="fg-btn fg-btn-primary" data-action="back">Go back</button>
        <button class="fg-btn" data-action="allow-once">
          Allow once
          <span class="fg-btn-sub">10 minutes, requires a short wait and a reason</span>
        </button>
        <div class="fg-panel" data-role="allow-once-panel">
          <textarea class="fg-textarea" data-role="allow-once-reason" placeholder="Why do you need this right now?"></textarea>
          <button class="fg-btn fg-btn-primary" data-action="allow-once-submit" disabled>Please wait…</button>
        </div>
        <button class="fg-btn" data-action="always-allow">Always allow this site</button>
      </div>
    </div>
  `
  shadow.appendChild(overlay)

  const reasonEl = shadow.querySelector<HTMLParagraphElement>('[data-role="reason"]')
  if (reasonEl) reasonEl.textContent = reason

  document.documentElement.appendChild(host)

  pauseAndMuteMedia()
  const mediaObserver = new MutationObserver(pauseAndMuteMedia)
  mediaObserver.observe(document.documentElement, { childList: true, subtree: true })
  const mediaInterval = window.setInterval(pauseAndMuteMedia, 400)

  function cleanup(): void {
    mediaObserver.disconnect()
    window.clearInterval(mediaInterval)
    host.remove()
  }

  shadow.querySelector('[data-action="back"]')?.addEventListener('click', () => {
    cleanup()
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = 'about:blank'
    }
  })

  shadow.querySelector('[data-action="always-allow"]')?.addEventListener('click', () => {
    void sendMessage({ type: 'ADD_QUICK_RULE', target: 'domain', action: 'allow', value: hostname }).then(() => {
      window.location.reload()
    })
  })

  const allowOnceBtn = shadow.querySelector<HTMLButtonElement>('[data-action="allow-once"]')
  const panel = shadow.querySelector<HTMLDivElement>('[data-role="allow-once-panel"]')
  const reasonInput = shadow.querySelector<HTMLTextAreaElement>('[data-role="allow-once-reason"]')
  const submitBtn = shadow.querySelector<HTMLButtonElement>('[data-action="allow-once-submit"]')

  let waitElapsed = false
  allowOnceBtn?.addEventListener('click', () => {
    if (!panel) return
    const opening = !panel.classList.contains('fg-open')
    panel.classList.toggle('fg-open', opening)
    if (opening && !waitElapsed && submitBtn) {
      let secondsLeft = ALLOW_ONCE_WAIT_SECONDS
      submitBtn.textContent = `Please wait ${secondsLeft}s…`
      const tick = window.setInterval(() => {
        secondsLeft -= 1
        if (secondsLeft <= 0) {
          window.clearInterval(tick)
          waitElapsed = true
          updateSubmitState()
        } else if (submitBtn) {
          submitBtn.textContent = `Please wait ${secondsLeft}s…`
        }
      }, 1000)
    }
  })

  function updateSubmitState(): void {
    if (!submitBtn || !reasonInput) return
    const hasReason = reasonInput.value.trim().length > 0
    submitBtn.disabled = !(waitElapsed && hasReason)
    if (waitElapsed) {
      submitBtn.textContent = hasReason ? 'Allow for 10 minutes' : 'Type a reason to continue'
    }
  }
  reasonInput?.addEventListener('input', updateSubmitState)

  submitBtn?.addEventListener('click', () => {
    if (submitBtn.disabled || !reasonInput) return
    void sendMessage({
      type: 'ALLOW_ONCE',
      domain: hostname,
      minutes: ALLOW_ONCE_MINUTES,
      reason: reasonInput.value.trim(),
    }).then(() => {
      window.location.reload()
    })
  })

  return cleanup
}
