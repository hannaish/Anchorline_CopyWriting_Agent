import type { ContentCategory, Correction } from '../types'

export interface ClassifyInput {
  url: string
  title: string
  metaDescription: string
  headings: string
  /** First ~1500 characters of visible page text. */
  text: string
  youtubeChannel?: string
  youtubeTags?: string[]
}

export interface ClassifyOutput {
  verdict: 'allow' | 'block'
  confidence: number
  category: ContentCategory
  reason: string
}

export interface AIProvider {
  classify(input: ClassifyInput, opts: { apiKey: string; model: string; focusIntent: string; sensitivity: string; corrections: Correction[]; signal: AbortSignal }): Promise<ClassifyOutput>
}
