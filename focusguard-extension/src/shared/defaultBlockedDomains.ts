import type { DefaultListEntry } from './types'

/**
 * Sites that are almost always distracting regardless of focus mode.
 * Seeded on install; fully editable (enable/disable or remove) from Options.
 * A "Always allow" manual rule for one of these domains overrides it.
 */
export const DEFAULT_BLOCKED_DOMAINS: DefaultListEntry[] = [
  { domain: 'netflix.com', label: 'Netflix', enabled: true },
  { domain: 'primevideo.com', label: 'Prime Video', enabled: true },
  { domain: 'hotstar.com', label: 'Hotstar', enabled: true },
  { domain: 'disneyplus.com', label: 'Disney+', enabled: true },
  { domain: 'tiktok.com', label: 'TikTok', enabled: true },
  { domain: 'instagram.com', label: 'Instagram', enabled: true },
  { domain: 'reddit.com', label: 'Reddit', enabled: true },
  { domain: 'twitch.tv', label: 'Twitch', enabled: true },
]
