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
| Page titles | Inter, `text-2xl sm:text-3xl font-bold` | Main page headings |
| Section headings | Inter, `text-xl sm:text-2xl font-bold` | Widget titles, section headers |
| Subheadings | Inter, `text-lg font-semibold` | Card titles, list item titles |
| Body | Inter, `text-sm` or `text-base` | Paragraphs, descriptions |
| Labels | Inter, `font-medium` or `font-semibold` | Badges, nav items, metadata labels |
| **Dates/timestamps** | **`font-mono text-sm`** | Every `<time>` element, stat numbers, version numbers |
| Code | `font-mono` | Commit SHAs, code blocks, technical identifiers |
| Small text | `text-xs` | Metadata, secondary info, captions |

### Date treatment rule

Every rendered date (via `dateDisplay` or `date()` filter) gets `font-mono`. This adds technical texture throughout the site — like timestamps in a log.

### Weight scale

| Weight | Class | Frequency | Usage |
|--------|-------|-----------|-------|
| 400 | (default) | Body text | Paragraphs, descriptions |
| 500 | `font-medium` | 146x | Labels, metadata, nav items |
| 600 | `font-semibold` | 100x | Subheadings, emphasis |
| 700 | `font-bold` | 138x | Page titles, section headings |

## Spacing

Base: 4px (Tailwind default rem scale).

### Spacing scale (by frequency)

| Token | px | Frequency | Primary usage |
|-------|-----|-----------|---------------|
| `0.5` | 2px | 62x | Micro gaps (badge padding-y, icon margins) |
| `1` | 4px | 150x | Tight internal spacing |
| `1.5` | 6px | 45x | Button padding-y, small gaps |
| `2` | 8px | 350x+ | Standard small spacing (px, py, gap, m) |
| `3` | 12px | 180x | Standard medium spacing |
| `4` | 16px | 200x+ | Card padding, section gaps |
| `5` | 20px | 30x | Featured card padding |
| `6` | 24px | 80x | Section margins |
| `8` | 32px | 40x | Large section separation |
| `10` | 40px | 8x | Page-level vertical rhythm |
| `12` | 48px | 5x | Major section breaks |

### Common spacing patterns

| Pattern | Classes | Where |
|---------|---------|-------|
| Card padding | `p-4` | Standard cards, widgets |
| Compact padding | `p-3` | List items, tight cards |
| Featured padding | `p-5` | Hero cards, featured items |
| Tight list gap | `gap-2` | Inline elements, tag lists |
| Standard gap | `gap-3` | Card grids, form elements |
| Spacious gap | `gap-4` | Section-level grids |
| Section break | `mb-6` to `mb-8` | Between page sections |
| Badge padding | `px-2 py-0.5` | Small badges, pills |
| Pill padding | `px-3 py-1.5` | Larger pills, filter buttons |

## Border Radius

| Element | Radius | Frequency |
|---------|--------|-----------|
| Cards, inputs, buttons | `rounded-lg` | 154x (dominant) |
| Avatars, status dots, badges | `rounded-full` | 134x |
| Featured/hero cards | `rounded-xl` | 23x |
| Now-playing sections | `rounded-xl sm:rounded-2xl` | 2x |
| Audio players | `rounded-md` | — |

## Card Patterns

Five distinct card variants used across the site:

### Standard card (`.post-card`)
```
p-5 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm
hover: border-[domain]-400 dark:border-[domain]-600
```
Used for: blog post listings, search results

### Widget card (`.widget`)
```
p-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm
```
Used for: sidebar widgets, info panels

### Compact list card
```
p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm
```
Used for: list view items in news/podroll, compact listings

### Featured card
```
p-5 sm:p-6 bg-gradient-to-br from-[color]-500/10 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm
```
Used for: now-playing, YouTube hero, featured items

### Stat card
```
p-3 sm:p-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm text-center
```
Used for: statistics grids (GitHub, Funkwhale, Last.fm)

## Button Patterns

Six button variants:

### Primary action
```
px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium
focus:ring-2 focus:ring-accent-500 transition-colors
```
Used for: form submits, main CTAs

### Secondary action
```
px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700
border border-surface-200 dark:border-surface-700 rounded-lg text-sm font-medium
focus:ring-2 focus:ring-accent-500 transition-colors
```
Used for: filter toggles, view mode switches, secondary actions

### Icon button
```
p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700
focus:ring-2 focus:ring-accent-500 transition-colors
```
Used for: theme toggle, menu toggle, refresh buttons

### Domain-colored button
```
px-3 py-1.5 bg-[domain]-600 hover:bg-[domain]-700 text-white rounded-lg text-sm font-medium
focus:ring-2 focus:ring-[domain]-500 transition-colors
```
Used for: domain-specific actions (e.g., orange "Load More" on podroll)

### Link button
```
text-[domain]-600 dark:text-[domain]-400 hover:text-[domain]-700 dark:hover:text-[domain]-300
hover:underline font-medium transition-colors
```
Used for: inline actions, "View all" links

### Pagination button
```
px-3 py-1 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700
border border-surface-200 dark:border-surface-700 rounded-lg text-sm
focus:ring-2 focus:ring-accent-500 transition-colors
disabled:opacity-50 disabled:cursor-not-allowed
```
Used for: pagination controls

## Badge/Pill Patterns

Four badge variants:

### Post-type badge
```
px-2 py-0.5 text-xs font-medium rounded-full
bg-[domain]-100 dark:bg-[domain]-900/30 text-[domain]-700 dark:text-[domain]-300
```
Used for: post type indicators on cards

### Category tag
```
px-2 py-0.5 text-xs bg-surface-100 dark:bg-surface-800
text-surface-600 dark:text-surface-400 rounded-full
hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors
```
Used for: category tags, hashtags

### Status badge
```
px-2 py-0.5 text-xs font-medium rounded-full
bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300
```
Variants: emerald (active/success), amber (warning), red (error)
Used for: status indicators, sync state

### Syndication badge
```
px-2 py-0.5 text-xs font-medium rounded-full text-white
bg-[brand-hex]
```
Used for: Mastodon/Bluesky/LinkedIn syndication indicators

## Layout Patterns

### Page layouts

| Layout | Classes | Usage |
|--------|---------|-------|
| Full-width | `max-w-7xl mx-auto px-4 sm:px-6` | Page container |
| With sidebar | `.layout-with-sidebar` = `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8` | Blog, post pages |
| Content area | `.main-content` = `min-w-0` (prevents overflow in grid) | Main column |
| Sidebar | `.sidebar` = `space-y-4 lg:space-y-6` | Sidebar column |
| Centered narrow | `max-w-3xl mx-auto` | About, CV pages |

### Grid patterns

| Pattern | Classes | Usage |
|---------|---------|-------|
| Stats grid | `grid grid-cols-2 sm:grid-cols-4 gap-3` | Statistics panels |
| Card grid | `grid grid-cols-1 sm:grid-cols-2 gap-4` | Card view mode |
| Post list | `space-y-4` or `space-y-3` | List view mode |
| Widget stack | `space-y-4 lg:space-y-6` | Sidebar widgets |

### Responsive breakpoints

| Breakpoint | px | Frequency | Purpose |
|------------|-----|-----------|---------|
| `sm:` | 640px | 170x+ | Primary responsive step (dominant) |
| `md:` | 768px | 19x | Tablet-specific adjustments |
| `lg:` | 1024px | 6x | Sidebar layout switch |

**Mobile-first:** Base styles are mobile. `sm:` is the primary breakpoint for responsive changes. Most layouts switch from stacked to side-by-side at `sm:`.

## Interaction States

Every interactive element needs:
- **hover:** color shift (`transition-colors` — dominant at 131x)
- **focus:** visible ring (`focus:ring-2 focus:ring-accent-500` or domain equivalent)
- **active:** not currently implemented — add where it matters (buttons)

### Hover patterns

| Element | Hover treatment |
|---------|----------------|
| Text links | `hover:underline` (163x — dominant link hover) |
| Card borders | `hover:border-[domain]-400 dark:hover:border-[domain]-600` |
| Buttons (filled) | Background darken (`hover:bg-[color]-700`) |
| Buttons (ghost) | `hover:bg-surface-200 dark:hover:bg-surface-700` |
| Nav items | `hover:text-surface-900 dark:hover:text-surface-100` |

### Focus pattern

All interactive elements: `focus:ring-2 focus:ring-[domain]-500 rounded` (or `focus:ring-accent-500` on neutral pages).

### Transitions

Default: `transition-colors` (131x). No duration override — uses Tailwind default (150ms).

Exceptions:
- Collapsible widgets: `transition-all` for height animation
- Mobile menu: `transition-transform` for slide-in

## Dark Mode

- Class-based: `darkMode: "class"` — toggled via button in header
- Surfaces invert: light canvas (`surface-50`) -> dark canvas (`surface-900`)
- Cards: `surface-100` -> `surface-800`
- Domain colors shift to 400-weight (brighter) in dark mode
- Borders: `surface-200` -> `surface-700`
- Shadows remain `shadow-sm` (less visible but still present for subtle lift)

### Dark mode pairs (reference)

| Light | Dark |
|-------|------|
| `bg-surface-50` | `dark:bg-surface-900` (canvas) |
| `bg-surface-100` | `dark:bg-surface-800` (cards) |
| `bg-surface-200` | `dark:bg-surface-700` (hover bg) |
| `border-surface-200` | `dark:border-surface-700` |
| `text-surface-900` | `dark:text-surface-100` (primary text) |
| `text-surface-600` | `dark:text-surface-400` (secondary text) |
| `text-[domain]-600` | `dark:text-[domain]-400` (domain color) |
| `bg-[domain]-100` | `dark:bg-[domain]-900/30` (badge bg) |

## CSS Component Classes

Reusable utility classes defined in `css/tailwind.css`:

| Class | Definition | Usage |
|-------|------------|-------|
| `.widget` | `p-4 bg-surface-50 rounded-lg border shadow-sm` + dark | Sidebar widgets |
| `.widget-title` | `text-lg font-semibold` | Widget headings |
| `.widget-header` | `flex items-center justify-between mb-3` | Widget header row |
| `.widget-collapsible` | Alpine.js collapsible wrapper | Expandable widgets |
| `.post-card` | `p-5 bg-surface-50 rounded-lg border shadow-sm` + dark | Post listing cards |
| `.post-list` | `space-y-4` | Post list container |
| `.layout-with-sidebar` | `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8` | Two-column layout |
| `.main-content` | `min-w-0` | Main column (prevents grid overflow) |
| `.sidebar` | `space-y-4 lg:space-y-6` | Sidebar stack |
| `.share-post-btn` | Blue share button | Post sharing |
| `.save-later-btn` | Accent save button | Read-later action |

## What Needs Implementation

Audit findings — remaining gaps between this system and the current code:

1. **Domain colors on section pages** — some pages still use generic accent instead of domain color for links, hovers, card borders
2. **Active states** — add to buttons where appropriate
3. **Consistent card hover** — some older templates use `hover:border-surface-400` instead of domain-colored border hover
