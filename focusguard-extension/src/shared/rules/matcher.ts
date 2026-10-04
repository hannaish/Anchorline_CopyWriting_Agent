import type { DefaultListEntry, ManualRule } from '../types'

export interface MatchContext {
  hostname: string
  url: string
  /** Best-effort YouTube channel handle/id extracted from the URL, if any. */
  youtubeChannelToken: string | null
  /** Visible page text (title + meta + body excerpt) for keyword rules. Optional at URL-only check time. */
  text?: string
}

export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '')
}

/** True if hostname is exactly ruleDomain or a subdomain of it. */
export function domainMatches(hostname: string, ruleDomain: string): boolean {
  const host = normalizeHostname(hostname)
  const rule = normalizeHostname(ruleDomain.trim())
  if (!rule) return false
  return host === rule || host.endsWith(`.${rule}`)
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ''
    return u.toString().replace(/\/$/, '')
  } catch {
    return url.trim().replace(/\/$/, '')
  }
}

export function urlMatches(url: string, ruleUrl: string): boolean {
  return normalizeUrl(url) === normalizeUrl(ruleUrl)
}

/** Extracts a YouTube channel handle ("@name") or channel id from a video/channel URL. */
export function extractYouTubeChannelToken(url: string): string | null {
  try {
    const u = new URL(url)
    if (!/(^|\.)youtube\.com$/.test(normalizeHostname(u.hostname))) return null
    const segments = u.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null
    if (segments[0]?.startsWith('@')) return segments[0].toLowerCase()
    if (['channel', 'c', 'user'].includes(segments[0] ?? '') && segments[1]) {
      return segments[1].toLowerCase()
    }
    return null
  } catch {
    return null
  }
}

function keywordMatches(text: string, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase()
  if (!needle) return false
  return text.toLowerCase().includes(needle)
}

function ruleMatchesContext(rule: ManualRule, ctx: MatchContext): boolean {
  switch (rule.target) {
    case 'domain':
      return domainMatches(ctx.hostname, rule.value)
    case 'url':
      return urlMatches(ctx.url, rule.value)
    case 'youtubeChannel':
      return ctx.youtubeChannelToken !== null && ctx.youtubeChannelToken === rule.value.trim().toLowerCase()
    case 'keyword':
      return ctx.text !== undefined && keywordMatches(ctx.text, rule.value)
  }
}

/**
 * Manual rules always win over everything else in the pipeline. Within manual
 * rules, an explicit "allow" always beats a "block" match, since one-click
 * "Always allow" is the user's designated override tool.
 */
export function matchManualRules(rules: ManualRule[], ctx: MatchContext): ManualRule | null {
  let blockMatch: ManualRule | null = null
  for (const rule of rules) {
    if (!ruleMatchesContext(rule, ctx)) continue
    if (rule.action === 'allow') return rule
    if (!blockMatch) blockMatch = rule
  }
  return blockMatch
}

export function matchDefaultList(list: DefaultListEntry[], hostname: string): DefaultListEntry | null {
  for (const entry of list) {
    if (entry.enabled && domainMatches(hostname, entry.domain)) return entry
  }
  return null
}
