# Design System — rmendes.net

## Palette

**Surfaces:** Warm stone — not yellow, not cold. The difference is felt, not seen.

| Token | Hex | Role |
|-------|-----|------|
| surface-50 | `#faf8f5` | Canvas (light) |
| surface-100 | `#f4f2ee` | Cards, elevated surfaces (light) |
| surface-200 | `#e8e5df` | Standard borders, dividers |
| surface-300 | `#d5d0c8` | Strong borders, input borders |
| surface-400 | `#a09a90` | Muted text, placeholders |
| surface-500 | `#7a746a` | Secondary text |
| surface-600 | `#5c5750` | Supporting text |
| surface-700 | `#3f3b35` | Dark mode borders |
| surface-800 | `#2a2722` | Cards, elevated surfaces (dark) |
| surface-900 | `#1c1b19` | Canvas (dark) |
| surface-950 | `#0f0e0d` | Deepest dark |

**Accent (Warm Amber):** Default interactive color — links, CTAs, focus rings.

| Token | Hex | Usage |
|-------|-----|-------|
| accent-400 | `#fbbf24` | Dark mode: links, hover |
| accent-500 | `#f59e0b` | — |
| accent-600 | `#d97706` | Light mode: links, buttons |
| accent-700 | `#b45309` | Light mode: hover, pressed |

## Domain Colors

Every section of the site has a color identity. On domain pages, links, hover states, and card borders use the domain color instead of amber.

### Domain Map (complete — every page accounted for)

| Domain | Tailwind color | Light text | Dark text | Pages |
|--------|---------------|------------|-----------|-------|
| **Writing** | amber (= accent) | amber-700 | amber-400 | `/blog/`, `/articles/`, `/notes/`, `/bookmarks/`, `/digest/`, `/news/`, `/categories/`, individual posts |
| **Social** | rose | rose-600 | rose-400 | `/likes/`, `/replies/`, `/reposts/`, `/interactions/` |
| **Code** | emerald | emerald-600 | emerald-400 | `/github/`, `/github/starred/` |
| **Music** | purple | purple-600 | purple-400 | `/funkwhale/`, `/listening/` |
| **Video** | red | red-600 | red-400 | `/youtube/` |
| **Reading** | orange | orange-600 | orange-400 | `/blogroll/`, `/podroll/`, `/readlater/` |
| **Neutral** | — (use accent) | — | — | `/` (home), `/about/`, `/cv/`, `/slashes/`, `/search/`, `/changelog/`, `/404` |

### Brand Colors (hardcoded hex — not domain colors)

These are third-party brand colors used in syndication badges and social widgets. Not part of the domain system.

| Brand | Hex | Where |
|-------|-----|-------|
| Mastodon | `#a730b8` | Syndication badges, social-activity widget |
| Bluesky | `#0085ff` | Syndication badges, social-activity widget |
| LinkedIn | `#0a66c2` | Syndication badges |
| IndieNews | `#ff5c00` | Syndication badges |
| Mastodon alt | `#6364ff` | Syndication badges |

### Domain Prominence (medium)

On a domain page, these elements adopt the domain color:
- **Page title** — tinted text or accent underline
- **Links** — `text-[domain]-600 dark:text-[domain]-400`
- **Hover states** — `hover:text-[domain]-700 dark:hover:text-[domain]-300`
- **Card borders on hover** — `hover:border-[domain]-400 dark:hover:border-[domain]-600`
- **Post-type badges** — domain-colored background/text

These stay neutral (accent or surface) regardless of domain:
- Header/navigation
- Sidebar widget containers
- Footer
- Global UI (search, theme toggle)

## Depth

**Subtle shadows.** One consistent shadow level for elevated surfaces. Borders + shadow together.

| Element | Treatment |
|---------|-----------|
| Cards, widgets | `shadow-sm` + `border border-surface-200 dark:border-surface-700` |
| Avatars, album art | `shadow-lg` (depth gives images presence against flat surfaces) |
| Modals | `shadow-xl` (overlay needs clear elevation) |
| Hover on cards | No shadow change — border color shift only |

**Gradients are allowed** for:
- Now-playing cards (domain color tinted: `bg-gradient-to-br from-[color]-500/10`)
- YouTube hero/live cards
- Icon containers in reading pages (`from-[color]-400 to-[color]-600`)

Gradients are NOT used for:
- Standard cards, widgets, or page backgrounds

## Typography

| Role | Style | Usage |
|------|-------|-------|
| Headlines | Inter, `font-bold` | Page titles, section headings |
| Body | Inter, normal weight | Paragraphs, descriptions |
| Labels | Inter, `font-medium` or `font-semibold` | Badges, nav items, metadata labels |
| **Dates/timestamps** | **`font-mono text-sm`** | Every `<time>` element, stat numbers, version numbers |
| Code | `font-mono` | Commit SHAs, code blocks, technical identifiers |

### Date treatment rule

Every rendered date (via `dateDisplay` or `date()` filter) gets `font-mono`. This adds technical texture throughout the site — like timestamps in a log.

## Spacing

Base: 4px (Tailwind default rem scale).

Extracted dominant patterns:
- Component internal: `p-4` (cards), `p-3` (compact), `p-5` (featured)
- Gaps: `gap-2` (tight lists), `gap-3` (standard), `gap-4` (spacious)
- Section separation: `mb-6` to `mb-8`
- Micro: `px-2 py-0.5` (badges), `px-3 py-1.5` (pills)

## Border Radius

| Element | Radius |
|---------|--------|
| Cards, inputs, buttons | `rounded-lg` (dominant: 124×) |
| Avatars, status dots, badges | `rounded-full` (89×) |
| Featured/hero cards | `rounded-xl` (21×) |
| Now-playing sections | `rounded-xl sm:rounded-2xl` |

## Interaction States

Every interactive element needs:
- **hover:** color shift (`transition-colors` — already dominant at 93×)
- **focus:** visible ring (`focus:ring-2 focus:ring-accent-500` or domain equivalent)
- **active:** not currently implemented — add where it matters (buttons)

Card hover pattern: border color shifts to domain color, no shadow change.

## Dark Mode

- Class-based: `darkMode: "class"` — toggled via button in header
- Surfaces invert: light canvas (`surface-50`) → dark canvas (`surface-900`)
- Cards: `surface-100` → `surface-800`
- Domain colors shift to 400-weight (brighter) in dark mode
- Borders: `surface-200` → `surface-700`
- Shadows remain `shadow-sm` (less visible but still present for subtle lift)

## What Needs Implementation

Audit findings — these are the gaps between this system and the current code:

1. **font-mono on dates** — 80+ date elements need `font-mono text-sm` added
2. **Domain colors on section pages** — page titles, links, hovers, card borders need domain color on their respective pages
3. **Shadow standardization** — currently mixed; standardize to the levels defined above
4. **Gradient cleanup** — remove `to-white` (github.njk), standardize gradient pattern
5. **Focus states** — add `focus:ring-2` to all interactive elements (currently only 10 across 6 files)
6. **Active states** — add to buttons
