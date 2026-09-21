import { DEFAULT_BLOCKED_DOMAINS } from './defaultBlockedDomains'
import { STORAGE_KEYS, type ManualRule, type Settings, type StorageShape, type TemporaryAllow } from './types'

/** Rules and the default list sync across the user's Chrome profiles. */
const SYNC_KEYS = new Set<string>([STORAGE_KEYS.manualRules, STORAGE_KEYS.defaultList, STORAGE_KEYS.settings])
/** Temporary allows are short-lived and device-local by nature. */
const LOCAL_KEYS = new Set<string>([STORAGE_KEYS.temporaryAllows])

function areaFor(key: string): chrome.storage.StorageArea {
  if (SYNC_KEYS.has(key)) return chrome.storage.sync
  if (LOCAL_KEYS.has(key)) return chrome.storage.local
  throw new Error(`Unknown storage key: ${key}`)
}

export const DEFAULT_SETTINGS: Settings = {
  globalPause: { active: false, expiresAt: null },
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

/** Seeds storage with defaults on first install. Safe to call multiple times. */
export async function initializeStorageDefaults(): Promise<void> {
  const [rules, list, settings] = await Promise.all([getStorageValue(STORAGE_KEYS.manualRules), getStorageValue(STORAGE_KEYS.defaultList), getStorageValue(STORAGE_KEYS.settings)])

  const writes: Promise<void>[] = []
  if (rules === undefined) writes.push(setManualRules([]))
  if (list === undefined) writes.push(setDefaultList(DEFAULT_BLOCKED_DOMAINS))
  if (settings === undefined) writes.push(setSettings(DEFAULT_SETTINGS))
  await Promise.all(writes)
}
