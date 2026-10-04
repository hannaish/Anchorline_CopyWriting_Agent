const MAX_CHARS = 1500

export interface PageSignals {
  title: string
  metaDescription: string
  headings: string
  /** First ~1500 characters of visible text — used for local keyword matching and, from the AI phase onward, as the classifier's "visible text" input. */
  text: string
}

/**
 * Builds the local page signals used for keyword rule matching and (once
 * the AI classifier is enabled) sent to the model. Everything here stays on
 * the device until the pipeline actually reaches the LLM step.
 */
export function extractPageSignals(): PageSignals {
  const title = document.title.trim()
  const metaDescription =
    document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? ''
  const headings = Array.from(document.querySelectorAll('h1, h2'))
    .map((el) => el.textContent?.trim() ?? '')
    .filter(Boolean)
    .slice(0, 10)
    .join(' | ')
  const bodyText = document.body?.innerText?.trim() ?? ''

  const combined = [title, metaDescription, headings, bodyText].filter(Boolean).join('\n')
  return { title, metaDescription, headings, text: combined.slice(0, MAX_CHARS) }
}
