import { extractYouTubeChannelToken, matchDefaultList, matchManualRules, normalizeHostname } from './rules/matcher'
import { getDefaultList, getManualRules, getSettings, pruneExpiredTemporaryAllows, setSettings } from './storage'
import type { BlockDecision } from './types'

export interface EvaluateInput {
  url: string
  /** Visible page text (title + meta + excerpt), when available, for keyword rules. */
  text?: string
}

function allow(reason: string): BlockDecision {
  return { blocked: false, source: null, reason }
}

/** Runs the manual-rules-first decision pipeline described in the product spec. */
export async function evaluateDecision(input: EvaluateInput): Promise<BlockDecision> {
  let hostname: string
  try {
    hostname = normalizeHostname(new URL(input.url).hostname)
  } catch {
    // Not a navigable http(s) URL (e.g. chrome://, file://) — never block internal pages.
    return allow('Internal page')
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

  return allow('No rule matched')
}

function describeTarget(target: 'domain' | 'url' | 'youtubeChannel' | 'keyword'): string {
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
