import { describe, expect, it } from 'vitest'
import { computeCacheKey } from './cacheKey'

describe('computeCacheKey', () => {
  it('prefers the video id when given, ignoring URL churn', () => {
    expect(computeCacheKey('https://youtube.com/watch?v=abc123&t=42', 'abc123')).toBe('yt:abc123')
    expect(computeCacheKey('https://youtube.com/watch?v=abc123&t=999', 'abc123')).toBe('yt:abc123')
  })

  it('falls back to a normalized URL without a video id', () => {
    expect(computeCacheKey('https://example.com/page/#frag')).toBe(computeCacheKey('https://example.com/page'))
  })
})
