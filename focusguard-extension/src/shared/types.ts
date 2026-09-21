/** Domain types shared between the background worker, content script, and UI pages. */

export type RuleTarget = 'domain' | 'url' | 'youtubeChannel' | 'keyword'
export type RuleAction = 'allow' | 'block'

export interface ManualRule {
  id: string
  target: RuleTarget
  action: RuleAction
  /** Domain (e.g. "netflix.com"), exact URL, YouTube channel handle/id, or keyword. */
  value: string
  /** Case-insensitive substring match for keyword rules; exact/suffix match for domain/url. */
  createdAt: number
  note?: string
}

export interface DefaultListEntry {
  domain: string
  label: string
  /** Whether this seeded entry is currently enabled; users can disable without deleting. */
  enabled: boolean
}

export interface TemporaryAllow {
  /** Normalized domain this temporary allow applies to. */
  domain: string
  expiresAt: number
  reason?: string
}

export type BlockReasonSource = 'manualRule' | 'defaultList' | 'deepFocus'

export interface BlockDecision {
  blocked: boolean
  source: BlockReasonSource | null
  reason: string
  /** The rule or default-list entry that produced this decision, if any. */
  matchedValue?: string
}

export interface GlobalPause {
  active: boolean
  expiresAt: number | null
  reason?: string
}

export interface Settings {
  globalPause: GlobalPause
}

export const STORAGE_KEYS = {
  manualRules: 'fg.manualRules',
  defaultList: 'fg.defaultList',
  temporaryAllows: 'fg.temporaryAllows',
  settings: 'fg.settings',
} as const

export interface StorageShape {
  [STORAGE_KEYS.manualRules]: ManualRule[]
  [STORAGE_KEYS.defaultList]: DefaultListEntry[]
  [STORAGE_KEYS.temporaryAllows]: TemporaryAllow[]
  [STORAGE_KEYS.settings]: Settings
}

/** Messages exchanged between content scripts, popup/options pages, and the background worker. */
export type RuntimeMessage =
  | { type: 'CHECK_URL'; url: string }
  | { type: 'CHECK_TEXT'; url: string; text: string }
  | { type: 'ADD_QUICK_RULE'; target: RuleTarget; action: RuleAction; value: string }
  | { type: 'ALLOW_ONCE'; domain: string; minutes: number; reason: string }
  | { type: 'RULES_CHANGED' }

export type RuntimeResponse<T extends RuntimeMessage['type']> = T extends 'CHECK_URL' | 'CHECK_TEXT'
  ? BlockDecision
  : { ok: true }
