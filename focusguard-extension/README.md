# FocusGuard

FocusGuard is a Chrome (Manifest V3) extension that blocks distractions based on
what a page actually contains, not just which site it's on — with focus-session
timers to pace your work. The same site can be productive or distracting: a
Meta Ads tutorial on YouTube is fine, a movie recap is not. Music is a special
case — songs, playlists, and official audio are allowed everywhere, since
background music is rarely actually distracting.

This is a placeholder name; nothing here is Chrome Web Store branding.

## Status: Phase 2

This repo is being built in phases (see the bottom of this README).
**Phases 1 and 2 are implemented**: manual rules, the default distracting
list, a Shadow-DOM block overlay, and now an AI content classifier (bring
your own Anthropic API key) that judges undecided pages against a plain-
language description of what you're focusing on.

Focus *modes* (saving/switching between several named intents), YouTube SPA
handling (Shorts hiding, autoplay pause on navigation), and focus-session
timers are later phases and not implemented yet — right now there's a single
"what are you focusing on?" text field in Options that the classifier uses.

## How blocking works right now

The pipeline, cheapest/most-certain checks first, stops at the first match:

1. **Internal/local pages** (non-http(s) schemes, `localhost`, IP literals) —
   always allowed, never even considered further.
2. **Manual rules always win.** Domain, exact-URL, YouTube-channel, and
   keyword rules you add always override everything else. If a domain has
   both an allow and a block rule, allow wins — "Always allow" is your
   designated override tool.
3. **Global pause and temporary allows** are checked next.
4. **Never-classify sites** (banking, email, health, password managers —
   editable in Options → Privacy) are always allowed and never reach the AI.
5. **Music fast-path.** `music.youtube.com`, or any YouTube watch page whose
   own `genre` metadata says "Music", is allowed immediately — no AI call.
6. **The default distracting list** (Netflix, Prime Video, Hotstar, Disney+,
   TikTok, Instagram, Reddit, Twitch — editable in Options) blocks everything
   else that isn't covered by a manual rule.
7. **The AI classifier** (only if enabled, an API key is set, a focus intent
   is set, and the daily call cap isn't reached) judges anything still
   undecided — e.g. a YouTube video that isn't on the default list and isn't
   music. It checks a 7-day cache first, then calls Claude Haiku with a 4s
   timeout and one retry. Verdicts of "block" only block when confidence
   meets your threshold (adjusted by sensitivity).
8. Anything still undecided after all of that is allowed — FocusGuard never
   breaks browsing. If the AI step fails for any reason (offline, over cap,
   timeout, bad key), it fails open the same way and shows a subtle
   "AI unavailable" badge in the popup instead of blocking.

Steps 1–6 are pure, local, and side-effect-free (`src/shared/decisionEngine.ts`
— `evaluatePreAI`), so the popup can preview a verdict without touching the
network. Step 7 is **background-worker-only** (`src/background/aiPipeline.ts`)
— it's the one place allowed to call the AI, which is where the debounce,
in-flight dedupe, timeout, retry, daily cap, and cache all live.

Two independent enforcement paths implement all of this:

- **`declarativeNetRequest`** hard-blocks the *default list* domains at the
  network level (redirecting `main_frame` navigations to the bundled
  `blocked.html` page), recomputed from storage whenever the list or an
  "always allow" domain rule changes. This is fast and can't be bypassed by
  disabling page JavaScript. It never runs the AI — it's domain-only.
- **The content script** evaluates everything else (manual keyword rules,
  and — once AI is enabled — the classifier's verdict, which needs the
  page's own text) and shows a full-page Shadow DOM overlay when something
  matches — pausing and muting any `<video>`/`<audio>` on the page, and
  offering "Go back", "Allow once" (10 minutes, gated behind a 15-second wait
  and a typed reason), "Always allow", and — only when the block came from
  the AI — "AI got this wrong".

## The AI classifier

- **Provider**: Anthropic Claude Haiku by default (`claude-haiku-4-5-20251001`),
  bring-your-own API key, set in Options → AI. The key is stored only in
  `chrome.storage.local`, never synced, never logged, and never leaves the
  device except as the `x-api-key` header on the classify request itself.
- **Source of truth**: a plain-language "what are you focusing on?" field
  (Options → AI) — e.g. "researching Meta/Google ad campaigns" or "studying
  for exams". The system prompt (`src/shared/ai/systemPrompt.ts`, its own
  file per the spec) tells the model this is the only thing that matters:
  content that teaches/explains/analyzes something relevant is allowed even
  on YouTube/Instagram; story-driven, scripted, movie, recap, or gossip
  content is blocked unless the focus intent says otherwise; music is
  allowed almost unconditionally. Page content is explicitly marked
  untrusted — the prompt tells the model to ignore anything in the page that
  looks like an instruction.
- **Output contract**: strict JSON — `{verdict, confidence, category, reason}`
  — parsed defensively (`src/shared/ai/anthropicProvider.ts`); an
  unparseable or malformed response is treated as a failure and fails open,
  never as a block.
- **Categories**: `education`, `research`, `work`, `music`, `entertainment`,
  `story_movie`, `social_feed`, `news`, `shopping`, `gaming`, `other`.
- **Sensitivity presets** (Lenient/Balanced/Strict) shift the *effective*
  block threshold by ±0.15 around your base confidence threshold — they
  don't change your saved threshold, just how it's applied.
- **Caching**: by YouTube video id when known, else normalized URL, 7-day
  TTL, in `chrome.storage.local`. A cache hit never re-calls the AI.
- **"AI got this wrong"** (on the block overlay, only shown for AI-sourced
  blocks): adds an exact-URL "always allow" rule for that one page/video
  (not the whole domain) and saves a few-shot correction example that gets
  fed back into the system prompt for future classifications.
- **Fail-safe**: any failure (offline, 4s timeout, bad key, daily cap hit,
  bad JSON) allows the page and sets a status flag the popup reads to show
  an "AI unavailable" badge — browsing is never blocked because the AI had a
  problem.

## Project structure

```
focusguard-extension/
  manifest.config.ts        MV3 manifest, built with @crxjs/vite-plugin
  vite.config.ts
  src/
    background/
      index.ts              Service worker: message handling, storage init
      dnr.ts                 Dynamic declarativeNetRequest rules for the default list
      aiPipeline.ts          AI-calling step: dedupe, timeout, retry, cap, cache, fail-safe
    content/
      index.ts               Content script entry (URL check, then text check)
      extractPageText.ts      Local page signals (title/meta/headings/body, ≤1500 chars)
      youtube.ts              Best-effort YouTube channel/tags/genre extraction
      overlay/
        BlockOverlay.ts       Shadow DOM block screen (vanilla DOM, no framework)
        styles.ts
    shared/
      types.ts                Shared types, storage keys, runtime message contract
      storage.ts               chrome.storage wrapper (sync for rules/settings, local for secrets/cache/logs)
      decisionEngine.ts         Pure pipeline steps 1–6 (evaluatePreAI) — no network, safe anywhere
      defaultBlockedDomains.ts  Seeded default distracting list
      neverClassifyDomains.ts   Seeded "never sent to AI" list (banking/email/health/password managers)
      importExport.ts           Rules JSON import/export + validation
      rules/matcher.ts           Pure rule-matching functions (unit tested)
      ai/
        types.ts                 AIProvider interface, ClassifyInput/Output
        systemPrompt.ts           The classifier's system prompt, in its own file
        anthropicProvider.ts      Claude Haiku implementation + strict JSON parsing
        cacheKey.ts               Cache key derivation (video id > normalized URL)
    pages/
      popup/                    Current tab status, category badge, AI-unavailable badge, pause
      options/                  Rules, default list, AI settings, Privacy (never-classify + sent log), import/export
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
4. Open the extension's **Options**, go to the **AI** tab, paste an Anthropic
   API key, describe what you're focusing on, and turn "Enable AI
   classification" on. Without a key or focus intent, AI stays off and
   FocusGuard behaves exactly like Phase 1 (manual rules + default list).

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
| `npm run test` | Vitest unit tests |

## Permissions

Every permission in `manifest.config.ts` is requested because the extension
uses it today — nothing is requested speculatively for later phases:

| Permission | Why |
| --- | --- |
| `storage` | Persists manual rules, lists, and settings (`chrome.storage.sync`) plus the API key, cache, usage counter, and "what was sent" log (`chrome.storage.local`, never synced). |
| `declarativeNetRequest` | Hard-blocks the default distracting-domain list at the network level (see "How blocking works" above). |
| `host_permissions: http://*/*`, `https://*/*` | Lets the content script run on any page to evaluate rules and show the block overlay, lets `declarativeNetRequest` redirect matching navigations, and lets the background worker call the Anthropic API directly (no separate `api.anthropic.com` permission needed — it's covered by the broad `https://*/*` grant). This also means `chrome.tabs.query()` can read a tab's URL without the broader `tabs` permission. |

`alarms` and `notifications` will be added in the focus-session-timer phase,
not before — MV3 service workers can't use `setInterval` reliably, so session
timers are driven by `chrome.alarms` against a stored end timestamp.

## Privacy

Local-first. Nothing reaches a network request until the pipeline actually
hits step 7 (the AI call) — everything before that (steps 1–6) is pure and
local. When the AI step does run, only these fields are sent, and only to
Anthropic: URL, title, meta description, headings, the first ~1,500
characters of visible text, and (on YouTube) channel name and tags. Every
field sent is logged in Options → Privacy ("What was sent to the AI") with a
one-click clear. Sites on the never-classify list (banking, email, health,
password managers) are never sent, regardless of settings. No analytics, no
remote code — the only outbound call this extension makes is the classify
request itself.

## Data model notes

- `ManualRule.action === 'allow'` always beats a `block` match among manual
  rules (`src/shared/rules/matcher.ts`), since one-click "Always allow" is
  the user's designated escape hatch from both the default list and any
  conflicting rule.
- The AI classifier never runs on music, never-classify sites, or anything a
  manual rule or the default list already decided — it only sees pages that
  are genuinely ambiguous.

## Testing

`npm run test` runs unit tests covering:

- `src/shared/rules/matcher.test.ts` — domain/subdomain matching, exact-URL
  normalization, YouTube channel-token extraction, keyword matching, and the
  allow-beats-block precedence rule.
- `src/shared/decisionEngine.test.ts` — the music fast-path (`music.youtube.com`
  and `genre: "Music"`), the never-classify list, the default distracting
  list, and that internal/local pages are never blocked.
- `src/shared/ai/anthropicProvider.test.ts` — strict JSON parsing, recovering
  JSON wrapped in prose/code-fences, clamping confidence, and rejecting a
  missing/invalid verdict.
- `src/shared/ai/cacheKey.test.ts` — video-id-based cache keys ignoring URL
  query-string churn.

The 30-labeled-example classifier accuracy harness and the session/timer
integration tests described in the full spec belong to later phases (there's
no session engine yet, and the accuracy harness needs a real API key to run
against, so it's deferred to the phase that also adds the eval tooling).

## Roadmap

1. ✅ Manifest, storage, manual rules, block overlay, default list
2. ✅ AI content classifier and full decision pipeline (cache, LLM call, fail-safe, music fast-path)
3. YouTube-specific handling (SPA navigation, autoplay pause, Shorts/recommendations)
4. Focus sessions: timer engine (`chrome.alarms`-driven), badge, notifications, session rules, stats
5. Focus modes (save/switch between several named intents), popup/options polish, schedule
6. Stats charts, classifier accuracy tests, Chrome Web Store prep
