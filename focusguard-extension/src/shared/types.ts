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

export type BlockReasonSource = 'manualRule' | 'defaultList' | 'deepFocus' | 'aiClassifier'

/** What the AI classifier judged the page as. "music" is also used by the local fast-path heuristic. */
export type ContentCategory =
  | 'education'
  | 'research'
  | 'work'
  | 'music'
  | 'entertainment'
  | 'story_movie'
  | 'social_feed'
  | 'news'
  | 'shopping'
  | 'gaming'
  | 'other'

export interface BlockDecision {
  blocked: boolean
  source: BlockReasonSource | null
  reason: string
  /** The rule or default-list entry that produced this decision, if any. */
  matchedValue?: string
  category?: ContentCategory
  confidence?: number
}

export interface GlobalPause {
  active: boolean
  expiresAt: number | null
  reason?: string
}

export interface Settings {
  globalPause: GlobalPause
}

export type AISensitivity = 'lenient' | 'balanced' | 'strict'

export interface AISettings {
  enabled: boolean
  provider: 'anthropic'
  model: string
  /** Plain-language description of what the user is currently focusing on — the classifier's source of truth. */
  focusIntent: string
  /** Block when verdict is "block" and confidence meets this threshold (0-1). */
  confidenceThreshold: number
  sensitivity: AISensitivity
  dailyCallCap: number
}

export interface AIUsage {
  /** YYYY-MM-DD in the user's local time; the counter resets when this changes. */
  date: string
  count: number
}

export interface AIStatus {
  unavailable: boolean
  reason?: string
  since?: number
}

export interface CachedClassification {
  verdict: 'allow' | 'block'
  confidence: number
  category: ContentCategory
  reason: string
  cachedAt: number
}

export interface SentLogEntry {
  timestamp: number
  url: string
  fieldsSent: string[]
  excerptPreview: string
  category: ContentCategory
  verdict: 'allow' | 'block'
}

/** A few-shot correction saved from "AI got this wrong", fed back into future prompts. */
export interface Correction {
  id: string
  url: string
  title: string
  textExcerpt: string
  categoryGiven: ContentCategory
  correctVerdict: 'allow' | 'block'
  createdAt: number
}

export const STORAGE_KEYS = {
  manualRules: 'fg.manualRules',
  defaultList: 'fg.defaultList',
  neverClassifyList: 'fg.neverClassifyList',
  temporaryAllows: 'fg.temporaryAllows',
  settings: 'fg.settings',
  aiSettings: 'fg.aiSettings',
  aiApiKey: 'fg.aiApiKey',
  aiUsage: 'fg.aiUsage',
  aiStatus: 'fg.aiStatus',
  aiCache: 'fg.aiCache',
  sentLog: 'fg.sentLog',
  corrections: 'fg.corrections',
} as const

export interface StorageShape {
  [STORAGE_KEYS.manualRules]: ManualRule[]
  [STORAGE_KEYS.defaultList]: DefaultListEntry[]
  [STORAGE_KEYS.neverClassifyList]: DefaultListEntry[]
  [STORAGE_KEYS.temporaryAllows]: TemporaryAllow[]
  [STORAGE_KEYS.settings]: Settings
  [STORAGE_KEYS.aiSettings]: AISettings
  [STORAGE_KEYS.aiApiKey]: string
  [STORAGE_KEYS.aiUsage]: AIUsage
  [STORAGE_KEYS.aiStatus]: AIStatus
  [STORAGE_KEYS.aiCache]: Record<string, CachedClassification>
  [STORAGE_KEYS.sentLog]: SentLogEntry[]
  [STORAGE_KEYS.corrections]: Correction[]
}

/** Best-effort metadata scraped from a YouTube watch/music page; null fields mean "couldn't find it". */
export interface YouTubeMeta {
  videoId: string | null
  channel: string | null
  tags: string[]
  /** YouTube's own schema.org genre tag, e.g. "Music" — lets us skip the AI call entirely for songs. */
  genre: string | null
}

/** Messages exchanged between content scripts, popup/options pages, and the background worker. */
export type RuntimeMessage =
  | { type: 'CHECK_URL'; url: string }
  | {
      type: 'CHECK_TEXT'
      url: string
      title: string
      metaDescription: string
      headings: string
      text: string
      youtube?: YouTubeMeta
    }
  | { type: 'ADD_QUICK_RULE'; target: RuleTarget; action: RuleAction; value: string }
  | { type: 'ALLOW_ONCE'; domain: string; minutes: number; reason: string }
  | { type: 'AI_CORRECTION'; url: string; title: string; textExcerpt: string; categoryGiven: ContentCategory }
  | { type: 'RULES_CHANGED' }

export type RuntimeResponse<T extends RuntimeMessage['type']> = T extends 'CHECK_URL' | 'CHECK_TEXT'
  ? BlockDecision
  : { ok: true }
