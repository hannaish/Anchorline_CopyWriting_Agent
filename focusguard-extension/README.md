# FocusGuard

FocusGuard is a Chrome (Manifest V3) extension that blocks distractions based on
what a page actually contains, not just which site it's on — with focus-session
timers to pace your work. The same site can be productive or distracting: a
Meta Ads tutorial on YouTube is fine, a movie recap is not.

This is a placeholder name; nothing here is Chrome Web Store branding.

## Status: Phase 1

This repo is being built in phases (see the bottom of this README). **Phase 1
is implemented**: manifest, storage schema, manual allow/block rules, a
Shadow-DOM block overlay, and an editable default distracting-sites list.

There is **no AI classifier yet** — that's Phase 2. Right now a page is only
blocked when a manual rule matches or the domain is on the default distracting
list. Focus modes, YouTube-specific handling, and focus-session timers are
later phases and are not implemented yet.

## How blocking works right now

1. **Manual rules always win.** Domain, exact-URL, YouTube-channel, and
   keyword rules you add always override everything else. If a domain has
   both an allow and a block rule, allow wins — "Always allow" is your
   designated override tool.
2. **Global pause and temporary allows** are checked next.
3. **The default distracting list** (Netflix, Prime Video, Hotstar, Disney+,
   TikTok, Instagram, Reddit, Twitch — editable in Options) blocks everything
   else that isn't covered by a manual rule.
4. Anything not covered by 1–3 is allowed. (Phase 2 adds the AI classifier as
   a further step here, only for pages still undecided at this point.)

Two independent enforcement paths implement this:

- **`declarativeNetRequest`** hard-blocks the *default list* domains at the
  network level (redirecting `main_frame` navigations to the bundled
  `blocked.html` page), recomputed from storage whenever the list or an
  "always allow" domain rule changes. This is fast and can't be bypassed by
  disabling page JavaScript.
- **The content script** evaluates manual rules (including keyword rules,
  which need the page's own text) and shows a full-page Shadow DOM overlay
  when something matches — pausing and muting any `<video>`/`<audio>` on the
  page, and offering "Go back", "Allow once" (10 minutes, gated behind a
  15-second wait and a typed reason), and "Always allow".

Manual domain/URL/keyword rules are intentionally *not* enforced via
`declarativeNetRequest`, so they can show the reason overlay and (from Phase 2
onward) the "AI got this wrong" correction flow.

## Project structure

```
focusguard-extension/
  manifest.config.ts        MV3 manifest, built with @crxjs/vite-plugin
  vite.config.ts
  src/
    background/
      index.ts              Service worker: message handling, storage init
      dnr.ts                 Dynamic declarativeNetRequest rules for the default list
    content/
      index.ts               Content script entry (URL check, then text check)
      extractPageText.ts      Local text excerpt (title/meta/headings/body, ≤1500 chars)
      overlay/
        BlockOverlay.ts       Shadow DOM block screen (vanilla DOM, no framework)
        styles.ts
    shared/
      types.ts                Shared types, storage keys, runtime message contract
      storage.ts               chrome.storage wrapper (sync for rules/settings)
      decisionEngine.ts         The block/allow decision pipeline (Phase 1 subset)
      defaultBlockedDomains.ts  Seeded default distracting list
      importExport.ts           Rules JSON import/export + validation
      rules/matcher.ts           Pure rule-matching functions (unit tested)
    pages/
      popup/                    Current tab status, quick allow/block, pause
      options/                  Rule CRUD, default list editor, import/export
      blocked/                  Landing page for declarativeNetRequest redirects
  public/icons/                 Extension icons
```

## Load unpacked (development)

```bash
npm install
npm run build
```

Then in Chrome:

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `focusguard-extension/dist` folder.

For live-reloading development, run `npm run dev` instead of `npm run build`
— CRXJS's dev server hot-reloads the extension (you'll still need to "Load
unpacked" the `dist` folder once, and click the extensions refresh icon if a
manifest-affecting file changes).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite + CRXJS dev server with HMR |
| `npm run build` | Type-checks, then builds the unpacked extension into `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit tests for the rule matcher) |

## Permissions

Every permission in `manifest.config.ts` is requested because Phase 1 uses it
today — nothing is requested speculatively for later phases:

| Permission | Why |
| --- | --- |
| `storage` | Persists manual rules, the default list, and settings (`chrome.storage.sync`) plus temporary allows (`chrome.storage.local`). |
| `declarativeNetRequest` | Hard-blocks the default distracting-domain list at the network level (see "How blocking works" above). |
| `host_permissions: http://*/*`, `https://*/*` | Lets the content script run on any page to evaluate rules and show the block overlay, and lets `declarativeNetRequest` redirect matching navigations. This also means `chrome.tabs.query()` can read a tab's URL without the broader `tabs` permission. |

`alarms` and `notifications` will be added in the focus-session-timer phase,
not before — MV3 service workers can't use `setInterval` reliably, so session
timers are driven by `chrome.alarms` against a stored end timestamp.

## Privacy (Phase 1)

Nothing leaves the device. The "first ~1,500 characters of visible text"
extraction (`src/content/extractPageText.ts`) already exists because it's
needed for local keyword-rule matching, and is scoped now so Phase 2's AI
classifier can reuse it — but no network request is made with it yet.

## Data model note

`ManualRule.action === 'allow'` always beats a `block` match among manual
rules (see `src/shared/rules/matcher.ts`), since one-click "Always allow" is
the user's designated escape hatch from both the default list and any
conflicting rule.

## Testing

`npm run test` runs unit tests for the pure rule-matching logic
(`src/shared/rules/matcher.test.ts`): domain/subdomain matching, exact-URL
normalization, YouTube channel-token extraction, keyword matching, and the
allow-beats-block precedence rule.

The 30-labeled-example classifier accuracy harness and the session/timer
integration tests described in the full spec belong to later phases (there's
no AI classifier or session engine yet to test).

## Roadmap

1. ✅ Manifest, storage, manual rules, block overlay, default list
2. AI content classifier and full decision pipeline (cache, LLM call, fail-safe)
3. YouTube-specific handling (SPA navigation, autoplay pause, Shorts/recommendations)
4. Focus sessions: timer engine (`chrome.alarms`-driven), badge, notifications, session rules, stats
5. Focus modes, popup/options polish, schedule
6. Stats charts, classifier accuracy tests, Chrome Web Store prep
