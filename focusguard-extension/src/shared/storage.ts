import { DEFAULT_BLOCKED_DOMAINS } from './defaultBlockedDomains'
import { DEFAULT_NEVER_CLASSIFY_DOMAINS } from './neverClassifyDomains'
import {
  STORAGE_KEYS,
  type AISettings,
  type AIStatus,
  type AIUsage,
  type CachedClassification,
  type Correction,
  type ManualRule,
  type SentLogEntry,
  type Settings,
  type StorageShape,
  type TemporaryAllow,
} from './types'

/** Rules and the default list sync across the user's Chrome profiles. */
const SYNC_KEYS = new Set<string>([
  STORAGE_KEYS.manualRules,
  STORAGE_KEYS.defaultList,
  STORAGE_KEYS.neverClassifyList,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.aiSettings,
])
/** Everything else — API key, temp allows, cache, logs — is device-local and/or secret. */
const LOCAL_KEYS = new Set<string>([
  STORAGE_KEYS.temporaryAllows,
  STORAGE_KEYS.aiApiKey,
  STORAGE_KEYS.aiUsage,
  STORAGE_KEYS.aiStatus,
  STORAGE_KEYS.aiCache,
  STORAGE_KEYS.sentLog,
  STORAGE_KEYS.corrections,
])

function areaFor(key: string): chrome.storage.StorageArea {
  if (SYNC_KEYS.has(key)) return chrome.storage.sync
  if (LOCAL_KEYS.has(key)) return chrome.storage.local
  throw new Error(`Unknown storage key: ${key}`)
}

export const DEFAULT_SETTINGS: Settings = {
  globalPause: { active: false, expiresAt: null },
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  enabled: false,
  provider: 'anthropic',
  model: 'claude-haiku-4-5-20251001',
  focusIntent: '',
  confidenceThreshold: 0.6,
  sensitivity: 'balanced',
  dailyCallCap: 200,
}

export async function getStorageValue<K extends keyof StorageShape>(key: K): Promise<StorageShape[K] | undefined> {
  const result = await areaFor(key).get(key)
  return result[key] as StorageShape[K] | undefined
}

export async function setStorageValue<K extends keyof StorageShape>(key: K, value: StorageShape[K]): Promise<void> {
  await areaFor(key).set({ [key]: value })
}

export async function getManualRules(): Promise<ManualRule[]> {
  return (await getStorageValue(STORAGE_KEYS.manualRules)) ?? []
}

export async function setManualRules(rules: ManualRule[]): Promise<void> {
  await setStorageValue(STORAGE_KEYS.manualRules, rules)
}

export async function getDefaultList() {
  return (await getStorageValue(STORAGE_KEYS.defaultList)) ?? DEFAULT_BLOCKED_DOMAINS
}

export async function setDefaultList(list: StorageShape[typeof STORAGE_KEYS.defaultList]): Promise<void> {
  await setStorageValue(STORAGE_KEYS.defaultList, list)
}

export async function getNeverClassifyList() {
  return (await getStorageValue(STORAGE_KEYS.neverClassifyList)) ?? DEFAULT_NEVER_CLASSIFY_DOMAINS
}

export async function setNeverClassifyList(list: StorageShape[typeof STORAGE_KEYS.neverClassifyList]): Promise<void> {
  await setStorageValue(STORAGE_KEYS.neverClassifyList, list)
}

export async function getSettings(): Promise<Settings> {
  return (await getStorageValue(STORAGE_KEYS.settings)) ?? DEFAULT_SETTINGS
}

export async function setSettings(settings: Settings): Promise<void> {
  await setStorageValue(STORAGE_KEYS.settings, settings)
}

export async function getTemporaryAllows(): Promise<TemporaryAllow[]> {
  return (await getStorageValue(STORAGE_KEYS.temporaryAllows)) ?? []
}

export async function setTemporaryAllows(allows: TemporaryAllow[]): Promise<void> {
  await setStorageValue(STORAGE_KEYS.temporaryAllows, allows)
}

/** Drops expired temporary allows; call before reading them for a block decision. */
export async function pruneExpiredTemporaryAllows(): Promise<TemporaryAllow[]> {
  const now = Date.now()
  const allows = await getTemporaryAllows()
  const active = allows.filter((a) => a.expiresAt > now)
  if (active.length !== allows.length) {
    await setTemporaryAllows(active)
  }
  return active
}

export async function getAISettings(): Promise<AISettings> {
  return (await getStorageValue(STORAGE_KEYS.aiSettings)) ?? DEFAULT_AI_SETTINGS
}

export async function setAISettings(settings: AISettings): Promise<void> {
  await setStorageValue(STORAGE_KEYS.aiSettings, settings)
}

/** The API key never syncs and is only ever read from chrome.storage.local. */
export async function getAiApiKey(): Promise<string | null> {
  return (await getStorageValue(STORAGE_KEYS.aiApiKey)) ?? null
}

export async function setAiApiKey(key: string): Promise<void> {
  await setStorageValue(STORAGE_KEYS.aiApiKey, key)
}

export async function clearAiApiKey(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.aiApiKey)
}

const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Reads today's AI call count, resetting the counter if the date rolled over. */
export async function getAiUsage(): Promise<AIUsage> {
  const usage = await getStorageValue(STORAGE_KEYS.aiUsage)
  const today = todayLocal()
  if (!usage || usage.date !== today) return { date: today, count: 0 }
  return usage
}

export async function incrementAiUsage(): Promise<AIUsage> {
  const usage = await getAiUsage()
  const next = { date: usage.date, count: usage.count + 1 }
  await setStorageValue(STORAGE_KEYS.aiUsage, next)
  return next
}

export async function getAiStatus(): Promise<AIStatus> {
  return (await getStorageValue(STORAGE_KEYS.aiStatus)) ?? { unavailable: false }
}

export async function setAiStatus(status: AIStatus): Promise<void> {
  await setStorageValue(STORAGE_KEYS.aiStatus, status)
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function getCachedClassification(key: string): Promise<CachedClassification | null> {
  const cache = (await getStorageValue(STORAGE_KEYS.aiCache)) ?? {}
  const entry = cache[key]
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null
  return entry
}

export async function setCachedClassification(key: string, entry: CachedClassification): Promise<void> {
  const cache = (await getStorageValue(STORAGE_KEYS.aiCache)) ?? {}
  cache[key] = entry
  await setStorageValue(STORAGE_KEYS.aiCache, cache)
}

const SENT_LOG_LIMIT = 100

export async function appendSentLog(entry: SentLogEntry): Promise<void> {
  const log = (await getStorageValue(STORAGE_KEYS.sentLog)) ?? []
  const next = [entry, ...log].slice(0, SENT_LOG_LIMIT)
  await setStorageValue(STORAGE_KEYS.sentLog, next)
}

export async function getSentLog(): Promise<SentLogEntry[]> {
  return (await getStorageValue(STORAGE_KEYS.sentLog)) ?? []
}

export async function clearSentLog(): Promise<void> {
  await setStorageValue(STORAGE_KEYS.sentLog, [])
}

const CORRECTIONS_LIMIT = 25

export async function getCorrections(): Promise<Correction[]> {
  return (await getStorageValue(STORAGE_KEYS.corrections)) ?? []
}

export async function appendCorrection(correction: Correction): Promise<void> {
  const corrections = await getCorrections()
  const next = [correction, ...corrections].slice(0, CORRECTIONS_LIMIT)
  await setStorageValue(STORAGE_KEYS.corrections, next)
}

/** Seeds storage with defaults on first install. Safe to call multiple times. */
export async function initializeStorageDefaults(): Promise<void> {
  const [rules, list, neverClassify, settings, aiSettings] = await Promise.all([
    getStorageValue(STORAGE_KEYS.manualRules),
    getStorageValue(STORAGE_KEYS.defaultList),
    getStorageValue(STORAGE_KEYS.neverClassifyList),
    getStorageValue(STORAGE_KEYS.settings),
    getStorageValue(STORAGE_KEYS.aiSettings),
  ])

  const writes: Promise<void>[] = []
  if (rules === undefined) writes.push(setManualRules([]))
  if (list === undefined) writes.push(setDefaultList(DEFAULT_BLOCKED_DOMAINS))
  if (neverClassify === undefined) writes.push(setNeverClassifyList(DEFAULT_NEVER_CLASSIFY_DOMAINS))
  if (settings === undefined) writes.push(setSettings(DEFAULT_SETTINGS))
  if (aiSettings === undefined) writes.push(setAISettings(DEFAULT_AI_SETTINGS))
  await Promise.all(writes)
}
