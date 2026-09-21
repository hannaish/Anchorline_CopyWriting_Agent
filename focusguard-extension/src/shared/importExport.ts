import type { DefaultListEntry, ManualRule, RuleAction, RuleTarget } from './types'

const RULE_TARGETS: RuleTarget[] = ['domain', 'url', 'youtubeChannel', 'keyword']
const RULE_ACTIONS: RuleAction[] = ['allow', 'block']

export interface ExportPayload {
  version: 1
  exportedAt: string
  manualRules: ManualRule[]
  defaultList: DefaultListEntry[]
}

export function buildExportPayload(manualRules: ManualRule[], defaultList: DefaultListEntry[]): ExportPayload {
  return { version: 1, exportedAt: new Date().toISOString(), manualRules, defaultList }
}

function isManualRule(value: unknown): value is ManualRule {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.value === 'string' &&
    typeof r.createdAt === 'number' &&
    RULE_TARGETS.includes(r.target as RuleTarget) &&
    RULE_ACTIONS.includes(r.action as RuleAction)
  )
}

function isDefaultListEntry(value: unknown): value is DefaultListEntry {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return typeof r.domain === 'string' && typeof r.label === 'string' && typeof r.enabled === 'boolean'
}

/** Parses and validates an imported rules JSON file. Returns null if the shape is invalid. */
export function parseImportPayload(raw: unknown): { manualRules: ManualRule[]; defaultList: DefaultListEntry[] } | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.manualRules) || !Array.isArray(r.defaultList)) return null
  if (!r.manualRules.every(isManualRule)) return null
  if (!r.defaultList.every(isDefaultListEntry)) return null
  return { manualRules: r.manualRules, defaultList: r.defaultList }
}
