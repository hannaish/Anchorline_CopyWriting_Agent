import { beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluatePreAI } from './decisionEngine'

/** Minimal in-memory chrome.storage mock — enough for storage.ts's get/set-by-single-key usage. */
function makeStorageArea() {
  const data = new Map<string, unknown>()
  return {
    get: vi.fn(async (key: string) => (data.has(key) ? { [key]: data.get(key) } : {})),
    set: vi.fn(async (obj: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(obj)) data.set(k, v)
    }),
  }
}

beforeEach(() => {
  vi.stubGlobal('chrome', {
    storage: {
      sync: makeStorageArea(),
      local: makeStorageArea(),
    },
  })
})

describe('evaluatePreAI — music fast-path', () => {
  it('always allows music.youtube.com without needing the AI', async () => {
    const decision = await evaluatePreAI({ url: 'https://music.youtube.com/watch?v=xyz' })
    expect(decision).not.toBeNull()
    expect(decision?.blocked).toBe(false)
    expect(decision?.category).toBe('music')
  })

  it('allows a youtube.com watch page whose genre meta says Music', async () => {
    const decision = await evaluatePreAI({
      url: 'https://www.youtube.com/watch?v=xyz',
      youtube: { videoId: 'xyz', channel: null, tags: [], genre: 'Music' },
    })
    expect(decision?.blocked).toBe(false)
    expect(decision?.category).toBe('music')
  })

  it('does not fast-path a regular youtube.com video with no genre hint', async () => {
    const decision = await evaluatePreAI({ url: 'https://www.youtube.com/watch?v=abc' })
    // No manual rule, no default-list match, no music hint — undecided, left to the AI step.
    expect(decision).toBeNull()
  })
})

describe('evaluatePreAI — sensitive sites never reach AI', () => {
  it('always allows a seeded never-classify domain', async () => {
    const decision = await evaluatePreAI({ url: 'https://mail.google.com/mail/u/0' })
    expect(decision?.blocked).toBe(false)
    expect(decision?.reason).toMatch(/never sent to AI/)
  })
})

describe('evaluatePreAI — default distracting list', () => {
  it('blocks a seeded default-list domain', async () => {
    const decision = await evaluatePreAI({ url: 'https://www.instagram.com/explore' })
    expect(decision?.blocked).toBe(true)
    expect(decision?.source).toBe('defaultList')
  })
})

describe('evaluatePreAI — never blocks internal/local pages', () => {
  it('allows localhost and chrome:// pages without checking anything else', async () => {
    expect((await evaluatePreAI({ url: 'http://localhost:3000' }))?.blocked).toBe(false)
    expect((await evaluatePreAI({ url: 'chrome://extensions' }))?.blocked).toBe(false)
  })
})
