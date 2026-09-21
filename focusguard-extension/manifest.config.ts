import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json' with { type: 'json' }

// Manifest V3. Every permission below is justified in README.md#permissions.
export default defineManifest({
  manifest_version: 3,
  name: 'FocusGuard',
  short_name: 'FocusGuard',
  description:
    'Blocks distractions based on what a page actually contains, not just which site it is on. Includes focus-session timers.',
  version: pkg.version,
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: {
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
  },
  options_page: 'src/pages/options/index.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_start',
      all_frames: false,
    },
  ],
  // "tabs" is intentionally omitted: host_permissions below already lets
  // chrome.tabs.query() return url/title for http(s) tabs. "alarms" and
  // "notifications" are added in the focus-session phase, not needed yet.
  permissions: ['storage', 'declarativeNetRequest'],
  host_permissions: ['http://*/*', 'https://*/*'],
  web_accessible_resources: [
    {
      resources: ['src/pages/blocked/index.html'],
      matches: ['http://*/*', 'https://*/*'],
    },
  ],
})
