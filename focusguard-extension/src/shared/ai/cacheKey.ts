/** Cache key for a classification: by video id when known (stable across YouTube's own query param churn), else the normalized URL. */
export function computeCacheKey(url: string, videoId?: string | null): string {
  if (videoId) return `yt:${videoId}`
  try {
    const u = new URL(url)
    u.hash = ''
    return u.toString().replace(/\/$/, '')
  } catch {
    return url
  }
}
