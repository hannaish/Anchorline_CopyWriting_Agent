import { describe, expect, it } from 'vitest'
import { parseClassifyOutput } from './anthropicProvider'

describe('parseClassifyOutput', () => {
  it('parses a well-formed response', () => {
    const out = parseClassifyOutput('{"verdict":"block","confidence":0.92,"category":"story_movie","reason":"Movie recap"}')
    expect(out).toEqual({ verdict: 'block', confidence: 0.92, category: 'story_movie', reason: 'Movie recap' })
  })

  it('pulls JSON out of surrounding prose or code fences', () => {
    const out = parseClassifyOutput('Sure, here you go:\n```json\n{"verdict":"allow","confidence":0.8,"category":"music","reason":"Song"}\n```')
    expect(out.verdict).toBe('allow')
    expect(out.category).toBe('music')
  })

  it('falls back to "other" for an unrecognized category and clamps confidence', () => {
    const out = parseClassifyOutput('{"verdict":"allow","confidence":5,"category":"not-a-real-category","reason":"x"}')
    expect(out.category).toBe('other')
    expect(out.confidence).toBe(1)
  })

  it('throws when verdict is missing or invalid', () => {
    expect(() => parseClassifyOutput('{"confidence":0.5,"category":"other","reason":"x"}')).toThrow()
    expect(() => parseClassifyOutput('not json at all')).toThrow()
  })
})
