import { buildSystemPrompt } from './systemPrompt'
import type { AIProvider, ClassifyInput, ClassifyOutput } from './types'
import type { ContentCategory } from '../types'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

const VALID_CATEGORIES: ContentCategory[] = [
  'education',
  'research',
  'work',
  'music',
  'entertainment',
  'story_movie',
  'social_feed',
  'news',
  'shopping',
  'gaming',
  'other',
]

function buildUserMessage(input: ClassifyInput): string {
  const parts = [
    `URL: ${input.url}`,
    `Title: ${input.title}`,
    input.metaDescription ? `Meta description: ${input.metaDescription}` : null,
    input.youtubeChannel ? `YouTube channel: ${input.youtubeChannel}` : null,
    input.youtubeTags && input.youtubeTags.length > 0 ? `YouTube tags: ${input.youtubeTags.join(', ')}` : null,
    input.headings ? `Headings: ${input.headings}` : null,
    `Visible text excerpt:\n${input.text}`,
  ]
  return parts.filter(Boolean).join('\n')
}

export function parseClassifyOutput(raw: string): ClassifyOutput {
  let parsed: unknown
  try {
    // Models occasionally wrap JSON in prose/fences despite instructions — pull out the object.
    const match = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(match ? match[0] : raw)
  } catch {
    throw new Error('AI response was not valid JSON')
  }
  if (typeof parsed !== 'object' || parsed === null) throw new Error('AI response was not a JSON object')
  const p = parsed as Record<string, unknown>
  const verdict = p.verdict === 'block' ? 'block' : p.verdict === 'allow' ? 'allow' : null
  const category = VALID_CATEGORIES.includes(p.category as ContentCategory) ? (p.category as ContentCategory) : 'other'
  const confidence = typeof p.confidence === 'number' ? Math.min(1, Math.max(0, p.confidence)) : 0.5
  const reason = typeof p.reason === 'string' ? p.reason : 'No reason given'
  if (!verdict) throw new Error('AI response missing a valid verdict')
  return { verdict, confidence, category, reason }
}

export const anthropicProvider: AIProvider = {
  async classify(input, { apiKey, model, focusIntent, sensitivity, corrections, signal }): Promise<ClassifyOutput> {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        // Required for calling the Messages API directly from a browser/extension context.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 200,
        system: buildSystemPrompt(focusIntent, sensitivity, corrections),
        messages: [{ role: 'user', content: buildUserMessage(input) }],
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Anthropic API error ${response.status}: ${body.slice(0, 200)}`)
    }

    const data = (await response.json()) as { content?: { type: string; text?: string }[] }
    const text = data.content?.find((block) => block.type === 'text')?.text
    if (!text) throw new Error('Anthropic response had no text content')
    return parseClassifyOutput(text)
  },
}
