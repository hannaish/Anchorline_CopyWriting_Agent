import { getDefaultList, getManualRules } from '../shared/storage'
import { domainMatches } from '../shared/rules/matcher'
import type { DefaultListEntry } from '../shared/types'

/**
 * Dynamic DNR rule ids reserved for the default distracting-domain list.
 * declarativeNetRequest is only used here and (in a later phase) for Deep
 * Focus — everything else is enforced by the content-script overlay so it
 * can show a reason and let the underlying page's media be paused/muted.
 */
const DEFAULT_LIST_ID_RANGE_START = 1000
const DEFAULT_LIST_ID_RANGE_END = 1999

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildRedirectRule(id: number, entry: DefaultListEntry): chrome.declarativeNetRequest.Rule {
  const escapedDomain = escapeRegExp(entry.domain.toLowerCase())
  // Captures the full matched hostname so blocked.html can show which site tripped the rule.
  const regexFilter = `^https?://((?:[a-z0-9-]+\\.)*${escapedDomain})(?::\\d+)?(?:[/?#].*)?$`
  const blockedPageUrl = chrome.runtime.getURL('src/pages/blocked/index.html')

  return {
    id,
    priority: 1,
    action: {
      type: 'redirect' as chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      redirect: {
        regexSubstitution: `${blockedPageUrl}?domain=\\1&reason=defaultList&label=${encodeURIComponent(entry.label)}`,
      },
    },
    condition: {
      regexFilter,
      isUrlFilterCaseSensitive: false,
      resourceTypes: ['main_frame' as chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
    },
  }
}

/**
 * Recomputes the dynamic DNR ruleset for the default distracting-domain list
 * from current storage. Call after install and whenever the default list or
 * an "always allow" domain rule changes. A matching "always allow" domain
 * rule removes a domain from the DNR set entirely (manual rules always win).
 */
export async function syncDefaultListDnrRules(): Promise<void> {
  const [defaultList, manualRules] = await Promise.all([getDefaultList(), getManualRules()])
  const allowedDomainRules = manualRules.filter((r) => r.action === 'allow' && r.target === 'domain')

  const activeEntries = defaultList.filter(
    (entry) => entry.enabled && !allowedDomainRules.some((r) => domainMatches(entry.domain, r.value)),
  )

  if (activeEntries.length > DEFAULT_LIST_ID_RANGE_END - DEFAULT_LIST_ID_RANGE_START + 1) {
    throw new Error('Default distracting list exceeds reserved DNR id range')
  }

  const newRules = activeEntries.map((entry, i) => buildRedirectRule(DEFAULT_LIST_ID_RANGE_START + i, entry))

  const existing = await chrome.declarativeNetRequest.getDynamicRules()
  const staleIds = existing
    .filter((r) => r.id >= DEFAULT_LIST_ID_RANGE_START && r.id <= DEFAULT_LIST_ID_RANGE_END)
    .map((r) => r.id)

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: staleIds,
    addRules: newRules,
  })
}
