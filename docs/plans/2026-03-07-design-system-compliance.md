# Design System Compliance Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 368 design system violations found by the comprehensive audit across ~80 Nunjucks template files and CSS.

**Architecture:** Fix CSS-level component classes first (highest leverage — one fix eliminates violations across many templates), then fix templates by violation category, grouped by file similarity. Each task handles one violation category across a batch of related files.

**Tech Stack:** Nunjucks templates, Tailwind CSS, Alpine.js

**Important context:**
- Source of truth: `/home/rick/code/indiekit-dev/indiekit-eleventy-theme/` (this repo is a Git submodule)
- Design system: `.interface-design/system.md`
- No test suite — verification is visual via `cloudron restart` after deployment
- CSS focus-visible base layer already exists in `css/tailwind.css:117-142,498-506` — most "missing focus:ring-2" violations are false positives since the CSS handles focus-visible globally on `button`, `a`, `input`, `textarea`, `select`. Only elements using `focus:outline-none` (which suppresses the global style) actually need inline `focus:ring-2`.
- CSS `time` base rule already sets monospace font-family on all `<time>` elements (`css/tailwind.css:112-115,571-576`). Only `<span>` elements rendering dates via Alpine.js `x-text="formatDate()"` need explicit `font-mono` class.

---

## Task Overview

| Task | Category | Files | Violations Fixed |
|------|----------|-------|-----------------|
| 1 | CSS component class fixes | `css/tailwind.css` | ~30 (cascading to many templates) |
| 2 | Cards missing `shadow-sm` | 25 files | ~69 |
| 3 | Wrong domain colors | 8 files | ~33 |
| 4 | Date `font-mono` on `<span>` elements | 10 files | ~20 |
| 5 | Date `font-mono` on `<time>` elements (class consistency) | 20 files | ~55 |
| 6 | Hover violations | 8 files | ~14 |
| 7 | Border radius violations | 10 files | ~12 |
| 8 | Dark mode violations | 8 files | ~10 |
| 9 | Depth violations (shadow levels) | 6 files | ~14 |
| 10 | Transition violations | 6 files | ~11 |
| 11 | Inline `focus:ring-2` cleanup | 7 files | ~20 |
| 12 | Remaining button/focus violations | 15 files | ~80 |

---

### Task 1: CSS Component Class Fixes (tailwind.css)

**Files:**
- Modify: `css/tailwind.css`

These CSS-level fixes cascade to many templates automatically.

**Step 1: Fix `.widget-title` weight**

Line 398: Change `font-bold` to `font-semibold` per system.md.

```css
/* Before */
.widget-title {
  @apply font-bold text-lg mb-4;
}

/* After */
.widget-title {
  @apply font-semibold text-lg mb-4;
}
```

**Step 2: Fix `.repo-card` missing `shadow-sm`**

Line 361: Add `shadow-sm`.

```css
/* Before */
.repo-card {
  @apply p-4 border border-surface-200 dark:border-surface-700 rounded-lg;
}

/* After */
.repo-card {
  @apply p-4 border border-surface-200 dark:border-surface-700 rounded-lg shadow-sm;
}
```

**Step 3: Fix `.fab-menu-item` border radius**

Line 551: Change `rounded-xl` to `rounded-lg`.

```css
/* Before */
.fab-menu-item {
  @apply ... rounded-xl bg-surface-50 ... shadow-md ...;
}

/* After */
.fab-menu-item {
  @apply ... rounded-lg bg-surface-50 ... shadow-sm ...;
}
```

Also change `shadow-md hover:shadow-lg` to `shadow-sm` (system says cards/menu items = `shadow-sm`).

**Step 4: Fix `.p-category` hover border**

Line 335: Change `hover:border-surface-400 dark:hover:border-surface-500` to `hover:border-accent-400 dark:hover:border-accent-600`.

```css
/* Before */
.p-category {
  @apply ... hover:border-surface-400 dark:hover:border-surface-500 transition-colors;
}

/* After */
.p-category {
  @apply ... hover:border-accent-400 dark:hover:border-accent-600 transition-colors;
}
```

**Step 5: Fix `.pagination-link` — add `transition-colors` explicitly**

Line 490: The class already has `transition-colors`. Verify it also covers focus states adequately via the base CSS layer. No change needed if base layer covers it.

**Step 6: Remove `.widget` `mb-4`**

Line 394: Remove `mb-4` since widgets are inside `space-y-*` containers which handle spacing. The `mb-4` conflicts with container spacing.

```css
/* Before */
.widget {
  @apply p-4 mb-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden;
}

/* After */
.widget {
  @apply p-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden;
}
```

**Step 7: Consolidate duplicate focus-visible systems**

Lines 117-142 and 498-506 define TWO competing focus-visible systems. Remove the duplicate at 498-506 (the outline-based one) and keep the ring-based one at 117-142 which is more specific and matches the system.md pattern.

```css
/* DELETE lines 498-506 */
/* Focus states */
@layer base {
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    @apply outline-2 outline-offset-2 outline-accent-500;
  }
}
```

**Step 8: Fix `.post-type-dropdown` dark mode**

Lines 974-986: Change `@media (prefers-color-scheme: dark)` to `.dark` class selector (the site uses class-based dark mode).

```css
/* Before */
@media (prefers-color-scheme: dark) {
  .post-type-dropdown { ... }
  .post-type-dropdown-item { ... }
  .post-type-dropdown-item:hover { ... }
}

/* After */
.dark .post-type-dropdown {
  background: #1f2937;
  border-color: #374151;
}
.dark .post-type-dropdown-item {
  color: #d1d5db;
}
.dark .post-type-dropdown-item:hover {
  background: #374151;
  color: #34d399;
}
```

**Step 9: Fix `.save-later-btn` and `.share-post-btn` dark mode**

Lines 881-932: Add `.dark` variants for these buttons (currently no dark mode support).

```css
/* Add after line 907 */
.dark body[data-indiekit-auth="true"] .save-later-btn {
  color: #9ca3af;
}
.dark body[data-indiekit-auth="true"] .save-later-btn:hover {
  border-color: #4b5563;
  color: #60a5fa;
}

/* Add after line 932 */
.dark body[data-indiekit-auth="true"] .share-post-btn {
  color: #9ca3af;
}
.dark body[data-indiekit-auth="true"] .share-post-btn:hover {
  border-color: #4b5563;
  color: #34d399;
}
```

**Step 10: Commit**

```bash
git add css/tailwind.css
git commit -m "fix(css): fix 10 design system violations in component classes

- .widget-title: font-bold -> font-semibold
- .repo-card: add shadow-sm
- .fab-menu-item: rounded-xl -> rounded-lg, shadow-md -> shadow-sm
- .p-category: hover border surface -> accent
- .widget: remove mb-4 (conflicts with space-y containers)
- Remove duplicate focus-visible system (outline vs ring)
- .post-type-dropdown: prefers-color-scheme -> .dark class
- .save-later-btn/.share-post-btn: add dark mode variants

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 2: Cards Missing `shadow-sm` (25 files)

**Files to modify:**

Group A — Page templates:
- `github.njk` — lines 30, 104, 137, 171, 226 (5 cards)
- `funkwhale.njk` — lines 188, 238 (2 cards)
- `youtube.njk` — lines 37, 176 (2 cards)
- `listening.njk` — lines 273, 327, 399, 460 (4 cards)
- `blogroll.njk` — lines 68, 112 (2 cards)
- `readlater.njk` — lines 83 (1 card)
- `starred.njk` — line 187 (1 card)
- `interactions.njk` — lines 44, 60, 76, 92, 108, 217 (6 cards)
- `changelog.njk` — line 51 (1 card)
- `digest-index.njk` — line 25 (1 card)

Group B — Components/sections:
- `_includes/components/webmentions.njk` — lines 116, 186 (2 cards)
- `_includes/components/comments.njk` — line 78 (1 card)
- `_includes/components/funkwhale-stats-content.njk` — lines 4, 29 (2 cards)
- `_includes/components/fediverse-modal.njk` — line 32 (1 card)
- `_includes/components/post-navigation.njk` — lines 34, 80 (2 cards)
- `_includes/components/sections/cv-education.njk` — line 19 (1 card)
- `_includes/components/sections/cv-skills.njk` — line 18 (1 card)
- `_includes/components/sections/cv-interests.njk` — line 18 (1 card)
- `_includes/components/sections/cv-projects.njk` — line 19 (1 card)
- `_includes/components/sections/cv-projects-work.njk` — line 29 (1 card)
- `_includes/components/sections/cv-projects-personal.njk` — line 29 (1 card)
- `_includes/components/sections/ai-usage.njk` — lines 13, 16 (2 cards)

Group C — Layout templates:
- `_includes/layouts/page.njk` — lines 36, 40, 44, 48, 83 (5 cards)
- `_includes/layouts/home.njk` — lines 82, 113, 122, 131 (4 cards)

**Pattern:** For each card element, find the `border border-surface-200 dark:border-surface-700` class string and add `shadow-sm` after it. If the element has `border` but no surface tokens, add the full pattern: `border border-surface-200 dark:border-surface-700 shadow-sm`.

**Special cases:**
- `interactions.njk` cards (lines 44-108): These cards have NO border at all — add `border border-surface-200 dark:border-surface-700 shadow-sm`
- `changelog.njk:51`: Also add `bg-surface-50 dark:bg-surface-800` (missing background)
- `page.njk:36,40,44,48`: Change `bg-white` to `bg-surface-50` (token compliance)
- `webmentions.njk:116,186` and `comments.njk:78`: Change `bg-surface-100` to `bg-surface-50` (system says card bg = surface-50)
- `post-navigation.njk:34,80`: Change `bg-surface-100` to `bg-surface-50`

**Step 1: Fix Group A files** (page templates — add `shadow-sm` to each card)

**Step 2: Fix Group B files** (components/sections)

**Step 3: Fix Group C files** (layouts)

**Step 4: Commit**

```bash
git add *.njk _includes/
git commit -m "fix(cards): add shadow-sm to all card elements across 25 files

Design system requires shadow-sm + border on all cards.
Also fixes bg-white -> bg-surface-50 and bg-surface-100 -> bg-surface-50
where card backgrounds used wrong tokens.

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 3: Wrong Domain Colors (8 files)

**Domain color reference:**
- Writing (amber): articles, notes, bookmarks, photos, blog, digest, categories, news
- Social (rose): likes, replies, reposts, interactions
- Code (emerald): github, starred
- Music (purple): funkwhale, listening
- Video (red): youtube
- Reading (orange): blogroll, podroll, readlater

**Files to modify:**

**3a. `starred.njk` — 12 violations (accent -> emerald)**

Every `accent-*` reference on this page should be `emerald-*`:
- Line 11: `text-accent-600 dark:text-accent-400` -> `text-emerald-600 dark:text-emerald-400`
- Lines 61-93: Tab button active states: `border-accent-600 text-accent-700 dark:text-accent-400` -> `border-emerald-600 text-emerald-700 dark:text-emerald-400`
- Line 111: `focus:ring-accent-500` -> `focus:ring-emerald-500`
- Line 126: Same
- Line 141: Same
- Lines 155: `bg-accent-600` -> `bg-emerald-600`
- Line 165: `text-accent-600 focus:ring-accent-500` -> `text-emerald-600 focus:ring-emerald-500`
- Lines 172-174: `text-accent-600 dark:text-accent-400` -> `text-emerald-600 dark:text-emerald-400`
- Line 193: `hover:text-surface-600` -> `hover:text-emerald-600 dark:hover:text-emerald-400`
- Lines 255-259: `bg-accent-600 hover:bg-accent-700` -> `bg-emerald-600 hover:bg-emerald-700`

**3b. `photos.njk` — 4 violations (purple -> amber)**

- Line 17: `text-purple-600 dark:text-purple-400` -> `text-amber-600 dark:text-amber-400` (sparkline)
- Line 28: `border-l-purple-400 dark:border-l-purple-500` -> `border-l-amber-400 dark:border-l-amber-500`
- Line 62: `text-purple-600 dark:text-purple-400` -> `text-amber-600 dark:text-amber-400`

**3c. `reposts.njk` — 1 violation (emerald sparkline -> rose)**

- Line 17: `text-emerald-600 dark:text-emerald-400` -> `text-rose-600 dark:text-rose-400`

**3d. `blog.njk` — 6 violations (red/green/sky -> rose for social types)**

- Line 42: `border-l-red-400 dark:border-l-red-500` -> `border-l-rose-400 dark:border-l-rose-500` (like card)
- Line 46: `border-l-green-400 dark:border-l-green-500` -> `border-l-rose-400 dark:border-l-rose-500` (repost card)
- Line 48: `border-l-sky-400 dark:border-l-sky-500` -> `border-l-rose-400 dark:border-l-rose-500` (reply card)
- Lines 60-61: `text-red-500` / `text-red-600 dark:text-red-400` -> `text-rose-500` / `text-rose-600 dark:text-rose-400`
- Lines 143-144: `text-green-500` / `text-green-600 dark:text-green-400` -> `text-rose-500` / `text-rose-600 dark:text-rose-400`
- Lines 182-184: `text-sky-500` / `text-sky-600 dark:text-sky-400` -> `text-rose-500` / `text-rose-600 dark:text-rose-400`

**3e. `featured.njk` — 3 violations (red/green/sky -> rose)**

- Line 56: `text-red-600 dark:text-red-400` / `text-red-500` -> `text-rose-600 dark:text-rose-400` / `text-rose-500`
- Line 85: `text-green-600 dark:text-green-400` -> `text-rose-600 dark:text-rose-400`
- Line 98: `text-sky-600 dark:text-sky-400` -> `text-rose-600 dark:text-rose-400`

**3f. `digest.njk` — 2 violations (accent -> amber on nav links)**

- Lines 154, 162: `text-accent-600 dark:text-accent-400` -> `text-amber-600 dark:text-amber-400`

**3g. `digest-index.njk` — 1 violation (orange -> amber)**

- Line 19: `text-orange-600 dark:text-orange-400` -> `text-amber-600 dark:text-amber-400`

**3h. `_includes/components/widgets/search.njk` — 2 violations (primary -> accent)**

- Line 4: `focus:ring-primary-500` -> `focus:ring-accent-500`
- Line 5: `bg-primary-600 hover:bg-primary-700` -> `bg-accent-600 hover:bg-accent-700`

**Step 1: Fix all files above**

**Step 2: Commit**

```bash
git add starred.njk photos.njk reposts.njk blog.njk featured.njk digest.njk digest-index.njk _includes/components/widgets/search.njk
git commit -m "fix(domain-colors): correct domain color assignments across 8 files

- starred.njk: accent -> emerald (Code domain)
- photos.njk: purple -> amber (Writing domain)
- reposts.njk: emerald -> rose (Social domain)
- blog.njk: red/green/sky -> rose (Social domain unified)
- featured.njk: red/green/sky -> rose (Social domain unified)
- digest.njk: accent -> amber (Writing domain)
- digest-index.njk: orange -> amber (Writing domain)
- search widget: primary -> accent (stale token)

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 4: Date `font-mono` on `<span>` Elements (Alpine.js renders)

These are dates rendered by Alpine.js `x-text="formatDate()"` into `<span>` elements (not `<time>`). The CSS base layer only covers `<time>` elements, so these `<span>` elements need explicit `font-mono`.

**Files to modify:**

- `starred.njk:27` — `<span x-text="formatDate(lastSync)">` — add `font-mono`
- `starred.njk:236` — `<span x-text="'Starred ' + formatDate(...)">` — add `font-mono`
- `changelog.njk:67` — `<span class="text-xs text-surface-500" x-text="formatDate(commit.date)">` — add `font-mono`
- `blogroll.njk:18` — `<span x-text="formatDate(status?.lastSync, 'full')">` — add `font-mono`
- `_includes/components/widgets/github-repos.njk:61` — `<span x-text="formatDate(commit.date)">` — add `font-mono`
- `_includes/components/widgets/github-repos.njk:86` — `<span x-text="formatDate(repo.updated_at)">` — add `font-mono`
- `_includes/components/widgets/github-repos.njk:142` — `<span x-text="formatDate(item.date)">` — add `font-mono`
- `interactions.njk:264` — `<time ... x-text="formatDate(...)">` — add `font-mono text-sm`
- `readlater.njk:99` — `<time ... x-text="formatDate(item.savedAt)">` — add `font-mono text-sm`
- `blogroll.njk:142` — `<time ... x-text="formatDate(item.published)">` — add `font-mono text-sm`
- `_includes/components/comments.njk:94` — `<time ... x-text="new Date(...)">` — add `font-mono text-sm`

**Step 1: Add `font-mono` class to each `<span>` and `font-mono text-sm` to each `<time>` listed above**

**Step 2: Commit**

```bash
git add starred.njk changelog.njk blogroll.njk interactions.njk readlater.njk _includes/components/widgets/github-repos.njk _includes/components/comments.njk
git commit -m "fix(dates): add font-mono to Alpine.js-rendered date spans

CSS base layer covers <time> elements automatically, but dates
rendered via x-text into <span> elements need explicit font-mono.

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 5: Date `font-mono` on `<time>` Elements (class consistency)

The CSS base layer sets `font-family: monospace` on all `<time>` elements globally, so these render correctly already. However, the design system convention is to also add `font-mono text-sm` as Tailwind classes for consistency and to ensure `text-sm` sizing. This task adds the classes to all `<time>` elements that are missing them.

**Files to modify:**

Group A — Post collection pages:
- `articles.njk:37-39` — `<time class="dt-published">` add `font-mono text-sm`
- `notes.njk:31-33` — `<time class="dt-published text-sm ... font-medium">` add `font-mono`
- `bookmarks.njk:39-41` — same pattern
- `photos.njk:30-32` — same
- `likes.njk:37-39` — same
- `replies.njk:42-44` — same
- `reposts.njk:42-44` — same
- `blog.njk:67,106,150,189,227,271,298` — 7 `<time>` elements, add `font-mono`
- `digest.njk:22,54,71,84,107,121,130` — 7 `<time>` elements
- `digest-index.njk:31` — 2 `<time>` elements
- `featured.njk:58,70,87,100,116,130` — 6 `<time>` elements
- `categories.njk:63-65` — 1 `<time>` element

Group B — Layouts:
- `_includes/layouts/page.njk:20` — `<time class="dt-updated">` add `font-mono text-sm`
- `_includes/layouts/post.njk:23-25` — `<time class="dt-published">` add `font-mono text-sm`
- `_includes/layouts/home.njk:92-94` — `<time>` add `font-mono`

Group C — Sections/components:
- `_includes/components/sections/recent-posts.njk:55,83,116,144,173,210,224` — 7 `<time>` elements
- `_includes/components/sections/featured-posts.njk:58,86,119,148,176,213,227` — 7 `<time>` elements
- `_includes/components/webmentions.njk:138,168` — 2 `<time>` elements
- `_includes/components/post-navigation.njk:46,92` — 2 `<time>` elements (also change `text-xs` to `text-sm`)
- `_includes/components/sections/cv-experience.njk:27` — date text, add `font-mono`
- `_includes/components/sections/cv-education.njk:43,47,72,76` — date text, add `font-mono`
- `_includes/components/sections/cv-projects.njk:55,82` — date text, add `font-mono`
- `_includes/components/sections/cv-projects-work.njk:65,92` — date text
- `_includes/components/sections/cv-projects-personal.njk:65,92` — date text
- `_includes/components/cv-builder.njk:163` — `<time>` add `font-mono text-sm`
- `cv.njk:130` — `<time>` add `font-mono text-sm`

Group D — Widgets:
- `_includes/components/widgets/social-activity.njk:46,76` — 2 `<time>` elements
- `_includes/components/widgets/recent-posts.njk:25,40,55,70,81` — 5 `<time>` elements
- `_includes/components/widgets/recent-posts-blog.njk:23,36,49,62,72` — 5 `<time>` elements
- `github.njk:114,150` — 2 `<time>` elements

**Pattern for each fix:**

For `<time class="dt-published">`:
```html
<!-- Before -->
<time class="dt-published">

<!-- After -->
<time class="dt-published font-mono text-sm">
```

For `<time class="dt-published text-sm ... font-medium">` (already has text-sm):
```html
<!-- Before -->
<time class="dt-published text-sm text-surface-500 dark:text-surface-400 font-medium">

<!-- After -->
<time class="dt-published font-mono text-sm text-surface-500 dark:text-surface-400 font-medium">
```

For CV date text in `<span>` or `<p>`:
```html
<!-- Before -->
<span class="text-xs text-surface-500">Jan 2020 - Present</span>

<!-- After -->
<span class="text-xs text-surface-500 font-mono">Jan 2020 - Present</span>
```

**Step 1: Fix Group A** (collection pages)
**Step 2: Fix Group B** (layouts)
**Step 3: Fix Group C** (sections/components)
**Step 4: Fix Group D** (widgets)

**Step 5: Commit**

```bash
git add *.njk _includes/
git commit -m "fix(dates): add font-mono text-sm to all <time> elements

System convention: every rendered date gets font-mono class.
CSS base layer handles font-family, but classes ensure consistency
and proper text-sm sizing across all templates.

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 6: Hover Violations (8 files)

**Files to modify:**

- `github.njk:226` — `hover:border-surface-400 dark:hover:border-surface-600` -> `hover:border-emerald-400 dark:hover:border-emerald-600`
- `starred.njk:187` — `hover:border-surface-400 dark:hover:border-surface-500` -> `hover:border-emerald-400 dark:hover:border-emerald-600`
- `_includes/components/sections/featured-posts.njk:45` — `hover:border-surface-400 dark:hover:border-surface-500` -> `hover:border-accent-400 dark:hover:border-accent-600`
- `_includes/components/widgets/toc.njk:10` — add `hover:underline` to ToC links
- `_includes/components/widgets/subscribe.njk:6,12` — add `hover:underline` to RSS/JSON feed links
- `_includes/components/widgets/categories.njk:8` — add `hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors` to category links
- `_includes/components/widgets/blogroll.njk:30` — add `hover:underline` to blog list links
- `news.njk:128,193` — `hover:border-accent-400` -> `hover:border-amber-400` (Writing domain)
- `digest-index.njk:25` — `hover:border-accent-300` -> `hover:border-amber-400 dark:hover:border-amber-600`

**Step 1: Fix all files above**

**Step 2: Commit**

```bash
git add github.njk starred.njk news.njk digest-index.njk _includes/
git commit -m "fix(hover): correct card hover borders to domain colors

Replace hover:border-surface-400 with domain-colored borders.
Add hover:underline to text links missing it.

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 7: Border Radius Violations (10 files)

**Files to modify:**

- `_includes/layouts/page.njk:92,97,102` — AI level badges: `rounded` -> `rounded-full`
- `_includes/layouts/page.njk:33` — AI stats container: `rounded-xl` -> `rounded-lg`
- `_includes/layouts/home.njk:96` — post type badge: `rounded` -> `rounded-full`
- `blogroll.njk:68,112` — standard cards: `rounded-xl` -> `rounded-lg`
- `readlater.njk:83` — standard cards: `rounded-xl` -> `rounded-lg`
- `news.njk:193,246` — standard cards: `rounded-xl` -> `rounded-lg`
- `podroll.njk:66` — standard cards: `rounded-xl` -> `rounded-lg`
- `_includes/components/sections/cv-projects.njk:94` — tech badges: `rounded` -> `rounded-full`
- `_includes/components/sections/cv-projects-work.njk:104` — same
- `_includes/components/sections/cv-projects-personal.njk:104` — same
- `_includes/components/sections/ai-usage.njk:13` — stats panel: `rounded-xl` -> `rounded-lg`
- `_includes/components/sections/funkwhale-stats-content.njk:4` — stat cards: `rounded-xl` -> `rounded-lg`
- `_includes/components/h-card.njk:90` — category span: `rounded` -> `rounded-full`
- `_includes/components/sections/recent-posts.njk:214,229` — post type badges: `rounded` -> `rounded-full`
- `_includes/components/sections/featured-posts.njk:217,232` — same
- `funkwhale.njk:147` — trends chart container: `rounded-xl` -> `rounded-lg`

**Step 1: Fix all files above**

**Step 2: Commit**

```bash
git add *.njk _includes/
git commit -m "fix(radius): correct border-radius to match system

- rounded -> rounded-full for badges/pills
- rounded-xl -> rounded-lg for standard cards (xl reserved for hero/featured)

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 8: Dark Mode Violations (8 files)

**Files to modify:**

- `_includes/layouts/page.njk:36,40,44,48` — `bg-white` -> `bg-surface-50` (with existing `dark:bg-surface-800`)
- `_includes/components/sections/ai-usage.njk:16,20,24,28` — `bg-white` -> `bg-surface-50`
- `_includes/components/sections/ai-usage.njk:13` — `dark:bg-surface-800/50` -> `dark:bg-surface-800` (remove opacity)
- `_includes/components/comments.njk:41` — add `dark:text-surface-100`, fix `dark:border-surface-600` -> `dark:border-surface-700`
- `_includes/components/comments.njk:59` — same fix for textarea
- `_includes/components/fediverse-modal.njk:32` — `dark:bg-surface-700` -> `dark:bg-surface-800`
- `_includes/components/widgets/post-categories.njk:8,13` — `bg-accent-900` -> `bg-accent-900/30` (badge pattern)
- `changelog.njk:51` — add `bg-surface-50 dark:bg-surface-800`

**Step 1: Fix all files above**

**Step 2: Commit**

```bash
git add *.njk _includes/
git commit -m "fix(dark-mode): correct dark mode token pairs

- bg-white -> bg-surface-50 (token compliance)
- Add missing dark:text-surface-100 on inputs
- Fix dark:border-surface-600 -> dark:border-surface-700
- Fix badge bg opacity (dark:bg-accent-900/30)

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 9: Depth Violations (6 files)

**Files to modify:**

Avatar/album art images need `shadow-lg`:
- `_includes/components/h-card.njk:32` — avatar img: add `shadow-lg`
- `_includes/components/widgets/author-card-compact.njk:12` — avatar: add `shadow-lg`
- `_includes/components/widgets/funkwhale.njk:33` — now-playing cover: add `shadow-lg`
- `_includes/components/widgets/funkwhale.njk:55` — track thumbnail: add `shadow-lg`
- `_includes/components/widgets/funkwhale.njk:83` — scrobble thumbnail: add `shadow-lg`
- `_includes/components/widgets/recent-comments.njk:11` — commenter avatar: add `shadow-lg`
- `_includes/components/sections/funkwhale-stats-content.njk:47` — album cover: add `shadow-lg`

Stat number `font-mono`:
- `_includes/components/sections/funkwhale-stats-content.njk:5` — stat numbers: add `font-mono`
- `_includes/components/sections/ai-usage.njk:17` — stat numbers: add `font-mono`

**Step 1: Fix all files above**

**Step 2: Commit**

```bash
git add _includes/
git commit -m "fix(depth): add shadow-lg to avatars/album art, font-mono to stat numbers

System: avatars/album art get shadow-lg for presence.
Stat numbers get font-mono like dates/timestamps.

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 10: Transition Violations (6 files)

**Files to modify:**

- `_includes/components/widgets/author-card-compact.njk:16` — author name link: add `transition-colors`
- `_includes/components/widgets/categories.njk:8` — category links: add `transition-colors`
- `_includes/components/widgets/post-navigation.njk:18,44` — nav links: add `transition-colors`
- `_includes/components/widgets/webmentions.njk:55,69,83,94,105,114` — links: add `transition-colors`
- `podroll.njk:119-128` — "View Episode" link: add `transition-colors`
- `podroll.njk:131-137` — "Subscribe to feed" link: add `transition-colors`

**Step 1: Fix all files above**

**Step 2: Commit**

```bash
git add _includes/ podroll.njk
git commit -m "fix(transitions): add transition-colors to interactive elements

System requires transition-colors on all elements with hover states.

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 11: Inline `focus:ring-2` Cleanup (7 files)

Some templates use `focus:outline-none focus:ring-2 focus:ring-accent-500` which **suppresses** the CSS base layer focus-visible styles and replaces them with a focus (not focus-visible) ring. This means mouse clicks also trigger the ring. The system uses `focus-visible` in CSS. These inline `focus:outline-none` should be removed so the base CSS handles focus consistently.

**Files to modify:**

- `news.njk:15,48,59,70,332,342` — remove `focus:outline-none focus:ring-2 focus:ring-accent-500` (CSS base layer handles it)
- `podroll.njk:19,50,175` — remove inline focus classes
- `starred.njk:111,126,141,165` — remove inline focus classes (but domain color is handled in Task 3)
- `readlater.njk:44,61` — remove inline focus classes
- `_includes/components/webmentions.njk` line with `focus:ring-2` — remove
- `_includes/components/fediverse-modal.njk:63` — remove `focus:ring-2 focus:ring-[#a730b8]`
- `_includes/components/widgets/search.njk:4` — remove inline focus (after Task 3 fixes primary -> accent)

**Step 1: In each file, remove `focus:outline-none focus:ring-2 focus:ring-*-500` class groups**

The CSS base layer at `tailwind.css:117-142` provides `ring-2 ring-amber-500/70` on `:focus-visible` for all buttons, links, and inputs. This is the correct, centralized approach.

**Step 2: Commit**

```bash
git add *.njk _includes/
git commit -m "fix(focus): remove inline focus:ring-2 classes, rely on CSS base layer

The CSS base layer provides focus-visible rings on all interactive
elements. Inline focus:outline-none suppresses this and replaces
it with focus (not focus-visible) behavior. Removing these lets
the centralized system handle focus states consistently.

Confab-Link: http://localhost:8080/sessions/0ec83454-d346-4329-8aaf-6b12139bf596"
```

---

### Task 12: Remaining Button/Focus Violations

After Task 11 removes conflicting inline focus classes, the CSS base layer handles focus-visible for all `button`, `a`, `input`, `textarea`, `select` elements. The remaining "missing focus:ring-2" violations from the audit are now **resolved by the CSS base layer** — no further template changes needed.

**Verification step:** After all previous tasks are committed, do a grep to confirm no `focus:outline-none` remains that would suppress the base styles:

```bash
grep -rn "focus:outline-none" --include="*.njk" /home/rick/code/indiekit-dev/indiekit-eleventy-theme/ | grep -v node_modules
```

If any remain, remove them.

**Commit:** No commit needed if grep finds nothing.

---

## Deployment

After all tasks are complete:

```bash
cd /home/rick/code/indiekit-dev/indiekit-eleventy-theme
git push origin main

cd /home/rick/code/indiekit-dev/indiekit-cloudron
git submodule update --remote eleventy-site
git add eleventy-site
git commit -m "chore: update eleventy-site submodule (design system compliance)"
git push origin main
make prepare
cloudron build --no-cache && cloudron update --app rmendes.net --no-backup
```

## Visual Verification

After deployment, verify key pages with `playwright-cli`:
- `/` (home) — cards have shadows, dates are mono
- `/blog/` — social types use rose domain color
- `/github/` — emerald domain color throughout
- `/github/starred/` — emerald, not accent
- `/listening/` — cards have shadows
- `/podroll/` — rounded-lg, not rounded-xl
- Dark mode toggle — check all pages render correctly
