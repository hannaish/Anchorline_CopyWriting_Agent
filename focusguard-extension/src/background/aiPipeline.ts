import { anthropicProvider } from '../shared/ai/anthropicProvider'
import { computeCacheKey } from '../shared/ai/cacheKey'
import type { ClassifyOutput } from '../shared/ai/types'
import { evaluatePreAI, type EvaluateInput } from '../shared/decisionEngine'
import {
  appendSentLog,
  getAiApiKey,
  getAISettings,
  getAiUsage,
  getCachedClassification,
  getCorrections,
  incrementAiUsage,
  setAiStatus,
  setCachedClassification,
} from '../shared/storage'
import type { AISensitivity, BlockDecision } from '../shared/types'

const CLASSIFY_TIMEOUT_MS = 4000
const RETRY_BACKOFF_MS = 500

/** Nudges the effective block threshold per sensitivity preset without changing the user's base setting. */
const SENSITIVITY_ADJUSTMENT: Record<AISensitivity, number> = {
  lenient: 0.15,
  balanced: 0,
  strict: -0.15,
}

function allow(reason: string): BlockDecision {
  return { blocked: false, source: null, reason }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function describeError(err: unknown): string {
  if (err instanceof DOMException && err.name === 'AbortError') return 'AI request timed out'
  if (err instanceof Error) return err.message
  return 'Unknown AI error'
}

/** Coalesces concurrent classification requests for the same page/video within one service-worker lifetime. */
const inFlight = new Map<string, Promise<ClassifyOutput>>()

async function classifyWithRetry(
  input: Parameters<typeof anthropicProvider.classify>[0],
  opts: Omit<Parameters<typeof anthropicProvider.classify>[1], 'signal'>,
): Promise<ClassifyOutput> {
  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS))
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CLASSIFY_TIMEOUT_MS)
    try {
      return await anthropicProvider.classify(input, { ...opts, signal: controller.signal })
    } catch (err) {
      lastError = err
    } finally {
      clearTimeout(timeout)
    }
  }
  throw lastError
}

/**
 * The full decision pipeline, background-only because it's the only place
 * allowed to call the AI classifier (debounce/dedupe/timeout/retry/cap all
 * live here, per the product spec). Everything before the AI step is the
 * pure, local `evaluatePreAI` — see src/shared/decisionEngine.ts.
 */
export async function evaluateDecisionWithAI(input: EvaluateInput): Promise<BlockDecision> {
  const pre = await evaluatePreAI(input)
  if (pre) return pre

  // No page text yet (this is the fast URL-only check) — nothing more to decide until the text-based check runs.
  if (input.text === undefined) return allow('No rule matched yet')

  const aiSettings = await getAISettings()
  const apiKey = await getAiApiKey()
  if (!aiSettings.enabled || !apiKey || aiSettings.focusIntent.trim() === '') {
    return allow('No rule matched')
  }

  const usage = await getAiUsage()
  if (usage.count >= aiSettings.dailyCallCap) {
    await setAiStatus({ unavailable: true, reason: 'Daily AI call cap reached', since: Date.now() })
    return allow('No rule matched (AI daily cap reached)')
  }

  const videoId = input.youtube?.videoId ?? null
  const cacheKey = computeCacheKey(input.url, videoId)

  const cached = await getCachedClassification(cacheKey)
  let result: ClassifyOutput

  if (cached) {
    result = cached
  } else {
    try {
      const corrections = await getCorrections()
      const classifyInput = {
        url: input.url,
        title: input.title ?? '',
        metaDescription: input.metaDescription ?? '',
        headings: input.headings ?? '',
        text: input.text,
        youtubeChannel: input.youtube?.channel ?? undefined,
        youtubeTags: input.youtube?.tags,
      }

      let pending = inFlight.get(cacheKey)
      if (!pending) {
        pending = classifyWithRetry(classifyInput, {
          apiKey,
          model: aiSettings.model,
          focusIntent: aiSettings.focusIntent,
          sensitivity: aiSettings.sensitivity,
          corrections,
        })
        inFlight.set(cacheKey, pending)
        void pending.finally(() => inFlight.delete(cacheKey))
      }
      result = await pending

      await setCachedClassification(cacheKey, { ...result, cachedAt: Date.now() })
      await incrementAiUsage()
      await setAiStatus({ unavailable: false })
      await appendSentLog({
        timestamp: Date.now(),
        url: input.url,
        fieldsSent: ['url', 'title', 'metaDescription', 'headings', 'text', input.youtube ? 'youtubeMeta' : null].filter(Boolean) as string[],
        excerptPreview: input.text.slice(0, 200),
        category: result.category,
        verdict: result.verdict,
      })
    } catch (err) {
      await setAiStatus({ unavailable: true, reason: describeError(err), since: Date.now() })
      return allow('AI unavailable — allowing by default')
    }
  }

  const effectiveThreshold = clamp01(aiSettings.confidenceThreshold + SENSITIVITY_ADJUSTMENT[aiSettings.sensitivity])
  const blocked = result.verdict === 'block' && result.confidence >= effectiveThreshold

  return {
    blocked,
    source: blocked ? 'aiClassifier' : null,
    reason: result.reason,
    category: result.category,
    confidence: result.confidence,
  }
}
