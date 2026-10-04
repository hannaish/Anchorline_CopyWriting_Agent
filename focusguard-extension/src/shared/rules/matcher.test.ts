import { describe, expect, it } from 'vitest'
import { domainMatches, extractYouTubeChannelToken, matchDefaultList, matchManualRules, urlMatches } from './matcher'
import type { DefaultListEntry, ManualRule } from '../types'

describe('domainMatches', () => {
  it('matches exact and subdomains, ignoring www and case', () => {
    expect(domainMatches('netflix.com', 'netflix.com')).toBe(true)
    expect(domainMatches('www.netflix.com', 'netflix.com')).toBe(true)
    expect(domainMatches('m.netflix.com', 'netflix.com')).toBe(true)
    expect(domainMatches('NETFLIX.com', 'netflix.com')).toBe(true)
    expect(domainMatches('notnetflix.com', 'netflix.com')).toBe(false)
    expect(domainMatches('netflix.co', 'netflix.com')).toBe(false)
  })
})

describe('urlMatches', () => {
  it('ignores trailing slash and hash', () => {
    expect(urlMatches('https://example.com/page#frag', 'https://example.com/page')).toBe(true)
    expect(urlMatches('https://example.com/page/', 'https://example.com/page')).toBe(true)
    expect(urlMatches('https://example.com/page', 'https://example.com/other')).toBe(false)
  })
})

describe('extractYouTubeChannelToken', () => {
  it('extracts @handle and /channel/ id', () => {
    expect(extractYouTubeChannelToken('https://www.youtube.com/@somechannel/videos')).toBe('@somechannel')
    expect(extractYouTubeChannelToken('https://www.youtube.com/channel/UC12345')).toBe('uc12345')
    expect(extractYouTubeChannelToken('https://www.youtube.com/watch?v=abc')).toBeNull()
    expect(extractYouTubeChannelToken('https://vimeo.com/@somechannel')).toBeNull()
  })
})

describe('matchManualRules', () => {
  const rules: ManualRule[] = [
    { id: '1', target: 'domain', action: 'block', value: 'reddit.com', createdAt: 1 },
    { id: '2', target: 'keyword', action: 'block', value: 'movie recap', createdAt: 2 },
  ]

  it('blocks on a matching domain rule', () => {
    const match = matchManualRules(rules, { hostname: 'reddit.com', url: 'https://reddit.com/r/funny', youtubeChannelToken: null })
    expect(match?.id).toBe('1')
  })

  it('an allow rule always beats a block match', () => {
    const withAllow: ManualRule[] = [...rules, { id: '3', target: 'domain', action: 'allow', value: 'reddit.com', createdAt: 3 }]
    const match = matchManualRules(withAllow, { hostname: 'reddit.com', url: 'https://reddit.com/r/marketing', youtubeChannelToken: null })
    expect(match?.action).toBe('allow')
  })

  it('matches keyword rules only when text is provided', () => {
    const ctxNoText = { hostname: 'youtube.com', url: 'https://youtube.com/watch?v=x', youtubeChannelToken: null }
    expect(matchManualRules(rules, ctxNoText)).toBeNull()

    const ctxWithText = { ...ctxNoText, text: 'Movie Recap Explained: full story breakdown' }
    expect(matchManualRules(rules, ctxWithText)?.id).toBe('2')
  })
})

describe('matchDefaultList', () => {
  const list: DefaultListEntry[] = [
    { domain: 'netflix.com', label: 'Netflix', enabled: true },
    { domain: 'tiktok.com', label: 'TikTok', enabled: false },
  ]

  it('matches only enabled entries', () => {
    expect(matchDefaultList(list, 'www.netflix.com')?.label).toBe('Netflix')
    expect(matchDefaultList(list, 'tiktok.com')).toBeNull()
    expect(matchDefaultList(list, 'example.com')).toBeNull()
  })
})
