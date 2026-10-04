import type { YouTubeMeta } from '../shared/types'

function normalizedHost(): string {
  return location.hostname.toLowerCase().replace(/^www\./, '')
}

/**
 * Best-effort YouTube metadata from the page's own schema.org markup, which
 * YouTube emits on watch pages: itemprop="genre" (e.g. "Music"),
 * itemprop="channelId"/channel name, and a keywords meta tag for tags.
 * Any field can come back null — callers must treat this as a hint, not ground truth.
 */
export function extractYouTubeMeta(): YouTubeMeta | null {
  const host = normalizedHost()
  if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'music.youtube.com') return null

  const videoId = new URLSearchParams(location.search).get('v')

  const genre = document.querySelector('meta[itemprop="genre"]')?.getAttribute('content') ?? null

  const channel =
    document.querySelector('link[itemprop="name"]')?.getAttribute('content') ??
    document.querySelector('#channel-name a, ytd-channel-name a')?.textContent?.trim() ??
    null

  const tagsContent = document.querySelector('meta[name="keywords"]')?.getAttribute('content') ?? ''
  const tags = tagsContent
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return { videoId, channel, tags, genre }
}
