import { extractYouTubeChannelToken, matchDefaultList, matchManualRules, normalizeHostname } from './rules/matcher'
import { getDefaultList, getManualRules, getNeverClassifyList, getSettings, pruneExpiredTemporaryAllows, setSettings } from './storage'
import type { BlockDecision, RuleTarget, YouTubeMeta } from './types'

export interface EvaluateInput {
  url: string
  /** Visible page text (title + meta + excerpt), when available, for keyword rules and the AI classifier. */
  text?: string
  title?: string
  metaDescription?: string
  headings?: string
  youtube?: YouTubeMeta
}

function allow(reason: string): BlockDecision {
  return { blocked: false, source: null, reason }
}

function isLocalHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true
  if (hostname === '127.0.0.1' || hostname === '::1') return true
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return true
  return false
}

/**
 * The pure, local part of the decision pipeline — manual rules, pause,
 * temporary allows, the never-classify and default lists, and the music
 * fast-path. Safe to call from any extension context (no network calls),
 * so popup/options can preview a verdict without going through the
 * background worker. Returns null when the page is still undecided and
 * would need the AI classifier (background-only — see src/background/aiPipeline.ts).
 */
export async function evaluatePreAI(input: EvaluateInput): Promise<BlockDecision | null> {
  let parsed: URL
  try {
    parsed = new URL(input.url)
  } catch {
    // Malformed URL — never block on something we can't even parse.
    return allow('Internal page')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    // chrome://, file://, about:, extension pages, etc. — never block internal pages.
    return allow('Internal page')
  }
  const hostname = normalizeHostname(parsed.hostname)

  if (isLocalHostname(hostname)) {
    return allow('Local address — never checked')
  }

  const settings = await getSettings()
  if (settings.globalPause.active) {
    if (settings.globalPause.expiresAt !== null && settings.globalPause.expiresAt <= Date.now()) {
      await setSettings({ ...settings, globalPause: { active: false, expiresAt: null } })
    } else {
      return allow('FocusGuard is paused')
    }
  }

  const temporaryAllows = await pruneExpiredTemporaryAllows()
  const tempAllow = temporaryAllows.find((a) => normalizeHostname(a.domain) === hostname || hostname.endsWith(`.${normalizeHostname(a.domain)}`))
  if (tempAllow) {
    return allow('Temporarily allowed')
  }

  const manualRules = await getManualRules()
  const ctx = {
    hostname,
    url: input.url,
    youtubeChannelToken: extractYouTubeChannelToken(input.url),
    text: input.text,
  }
  const manualMatch = matchManualRules(manualRules, ctx)
  if (manualMatch) {
    if (manualMatch.action === 'allow') {
      return allow(`Always allowed (${describeTarget(manualMatch.target)}: ${manualMatch.value})`)
    }
    return {
      blocked: true,
      source: 'manualRule',
      reason: `Blocked by your rule (${describeTarget(manualMatch.target)}: ${manualMatch.value})`,
      matchedValue: manualMatch.value,
    }
  }

  const neverClassifyList = await getNeverClassifyList()
  if (matchDefaultList(neverClassifyList, hostname)) {
    return allow('Sensitive site — always allowed, never sent to AI')
  }

  // Music fast-path: skip the AI call entirely for songs, playlists, and official audio.
  if (hostname === 'music.youtube.com' || input.youtube?.genre === 'Music') {
    return { blocked: false, source: null, reason: 'Music — always allowed', category: 'music' }
  }

  const defaultList = await getDefaultList()
  const listMatch = matchDefaultList(defaultList, hostname)
  if (listMatch) {
    return {
      blocked: true,
      source: 'defaultList',
      reason: `${listMatch.label} is on your distraction list`,
      matchedValue: listMatch.domain,
    }
  }

  return null
}

/** Pure-pipeline-only decision (no AI call) — used by popup/options for a quick preview. */
export async function evaluateDecision(input: EvaluateInput): Promise<BlockDecision> {
  const pre = await evaluatePreAI(input)
  return pre ?? allow('No rule matched')
}

export function describeTarget(target: RuleTarget): string {
  switch (target) {
    case 'domain':
      return 'domain'
    case 'url':
      return 'URL'
    case 'youtubeChannel':
      return 'channel'
    case 'keyword':
      return 'keyword'
  }
}
