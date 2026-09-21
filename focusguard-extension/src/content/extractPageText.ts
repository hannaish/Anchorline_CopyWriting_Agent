const MAX_CHARS = 1500

/**
 * Builds the local text excerpt used for keyword rule matching (and, from
 * the AI phase onward, as the "visible text" input to the classifier).
 * Never reaches outside the page in phase 1 — everything here is local.
 */
export function extractPageText(): string {
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
  return combined.slice(0, MAX_CHARS)
}
