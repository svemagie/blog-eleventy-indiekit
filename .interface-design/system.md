# Design System — rmendes.net

## Direction: Workshop Terminal

**Feel:** A well-configured terminal in a warm room. Structure is precise and technical. Warmth comes from surfaces and content, not decorative color. Color is signal, not decoration.

**Signature:** Chromatically quiet at rest, vivid in context. The base is warm monochrome. Color enters when content demands it — music pages glow purple, code pages pulse emerald, social feeds carry brand colors. You feel the shift as you navigate between worlds.

## Intent

**Who:** Visitors to a DevOps engineer's personal site — peers, recruiters, fellow IndieWeb enthusiasts, RSS subscribers. They're reading, browsing, discovering.

**What:** Read posts, explore interests, follow feeds, understand who this person is.

**How it should feel:** Like opening a well-used notebook in a workshop. Technical precision meets personal warmth. Not corporate, not cold, not decorative.

## Surfaces — Warm Stone

Warm neutral tones. Not yellow — just not cold. The difference is felt, not seen.

| Token | Light | Dark | Role |
|-------|-------|------|------|
| 50 | `#faf8f5` | — | Canvas background |
| 100 | `#f4f2ee` | — | Card surfaces |
| 200 | `#e8e5df` | — | Borders, dividers |
| 300 | `#d5d0c8` | — | Strong borders |
| 400 | `#a09a90` | — | Muted/placeholder text |
| 500 | `#7a746a` | — | Secondary text |
| 600 | `#5c5750` | — | — |
| 700 | `#3f3b35` | — | Dark text secondary |
| 800 | `#2a2722` | — | Card surfaces (dark) |
| 900 | `#1c1b19` | — | Canvas (dark) |
| 950 | `#0f0e0d` | — | Deepest dark |

## Text Hierarchy

| Level | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | surface-900 `#1c1b19` | surface-50 `#faf8f5` | Headlines, body |
| Secondary | surface-600 `#5c5750` | surface-400 `#a09a90` | Supporting text |
| Muted | surface-400 `#a09a90` | surface-600 `#5c5750` | Metadata, timestamps |
| Faint | surface-300 `#d5d0c8` | surface-700 `#3f3b35` | Disabled, decorative |

## Interactive — Accent (Warm Amber)

Default interactive color for generic links, CTAs, focus rings. Terminal amber warmth.

| Weight | Value | Usage |
|--------|-------|-------|
| 400 | `#fbbf24` | Dark mode links, hover states |
| 500 | `#f59e0b` | — |
| 600 | `#d97706` | Light mode links, buttons |
| 700 | `#b45309` | Light mode hover |

## Domain Colors

Each section of the site owns its chromatic identity. These override accent on their respective pages.

| Domain | Tailwind Color | Pages |
|--------|---------------|-------|
| Writing/Blog | amber (= accent) | blog, articles, notes, homepage |
| Code/GitHub | emerald | github, repo widgets |
| Music | violet | funkwhale, listening, last.fm |
| Bluesky | `#0085ff` | social-activity bluesky tab |
| Mastodon | `#a730b8` | social-activity mastodon tab |
| Bookmarks | amber | bookmarks page |
| Likes | rose | likes page |
| Replies | sky | replies page |
| Reposts | emerald | reposts page |
| Photos | violet | photos page |
| RSS/Podcasts | orange | podroll, subscribe, RSS links |
| CV | neutral (no accent) | cv page |

## Typography

- **Body:** Inter — clean, technical sans-serif
- **Metadata:** `font-mono` for dates, timestamps, stats, version numbers
- **Headlines:** Inter bold, tight tracking

## Depth Strategy

**Borders only.** No drop shadows. Low-opacity warm borders define surfaces. Hierarchy comes from surface color shifts, not elevation effects.

## Spacing

Base: 4px (Tailwind default). No custom scale needed.

## Dark Mode

- Surfaces invert (dark warm canvas, lighter warm cards)
- Domain colors use their 400-weight for dark mode (lighter/brighter)
- Borders use warm low-opacity rgba
- No shadows in either mode
