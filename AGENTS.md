# D.U.M.B. Static Website Specification

## Purpose

This repository contains the public static website for **D.U.M.B. — Developers Under Machine Brainrot**.

The site is a sharp public warning for developers who use AI tools without preserving understanding, judgment, debugging ability, and ownership.

The official GitHub organization URL is:

`https://github.com/D-U-M-B`

## Relationship To The Organization Profile

The reference repository at `/home/dev/projects/D.U.M.B-github` provides the core identity and theme.

This website must not copy that profile verbatim. It expands the theme into a richer public site with cases, warnings, field notes, recovery guidance, and calls to action.

The protected file `/home/dev/projects/D.U.M.B-github/profile/README.md` must not be modified by this website project.

## Content Strategy

The site should keep the D.U.M.B. position clear:

1. AI tools are not the enemy.
2. Unexamined dependence is the enemy.
3. Generated code is not understanding.
4. Assistance is not competence.
5. Developers remain responsible for what they ship.

The tone should be confrontational, direct, and memorable. The writing may be satirical and severe, but it should remain intelligible and focused on developer behavior rather than attacking real individuals.

Copy should stay short and high-density. Prefer sharp sentences, compressed cases, and compact warnings over long explanations.

Copy should also read naturally in every supported language. Do not make Chinese or Japanese copy follow English sentence structure when a clearer local expression is available.

Major headings may omit terminal punctuation and use deliberate line breaks for rhythm.

English, Simplified Chinese, Taiwan Traditional Chinese, and Japanese headings do not need matching line breaks. Use separate line breaks when each language reads better with a different rhythm.

Chinese paired phrases may use two-line layouts when the wording has a parallel or couplet-like rhythm.

## Synthetic Content Rules

The website may use synthetic cases, composite confessions, and editorial field notes to dramatize common failure patterns.

These sections must not pretend to be real interviews, real journalism, real incidents, real statistics, or real third-party reports.

Synthetic or composite sections should be clearly labeled in the page copy or surrounding context.

Do not invent real company names, real person names, real media brands, or fake citations.

## Multilingual Rules

The site supports English, Simplified Chinese, Taiwan Traditional Chinese, and Japanese.

Copy in each language should be semantically aligned, but each language should read naturally rather than mechanically translating the English.

The `zh-Hant` copy must use Taiwan Traditional Chinese terminology and phrasing, not generic Traditional Chinese or Hong Kong/Macau wording.

The language switch is implemented as a native `select` control with static HTML attributes and a small dependency-free JavaScript file.

The initial language should use the saved user preference when available, then fall back to the browser language.

Default browser-language selection should use this order:

1. Saved user preference.
2. Japanese when the browser language starts with `ja`.
3. Taiwan Traditional Chinese for `zh-Hant`, `zh-TW`, `zh-HK`, or `zh-MO`.
4. Simplified Chinese for other `zh` languages.
5. English for all other languages.

## Visual Direction

The website primarily uses text, CSS, spacing, borders, color, and browser-native rendering.

The local `D.U.M.B-logo.png` file is allowed as the site logo and favicon.

No generated artwork, SVG illustrations, icon libraries, web fonts, video, canvas, external visual assets, or decorative images are allowed.

The visual system should feel like a public alarm from a technical organization:

1. Strong contrast.
2. Hard boundaries.
3. Dense but readable information blocks.
4. Controlled warning colors.
5. Large typographic statements.
6. A modern dark interface with deliberate tension.

The site should be visually forceful without sacrificing readability on mobile or desktop.

## Technical Constraints

The site is pure static HTML, CSS, and JavaScript.

There is no build step, package manager, runtime framework, or external dependency.

The repository can be served directly by GitHub Pages.

The main files are:

1. `index.html`
2. `styles.css`
3. `script.js`
4. `AGENTS.md`

## Accessibility And Responsiveness

All essential text must remain selectable, readable, and accessible in HTML.

Interactive controls must use semantic links, buttons, or native form controls.

The current language state must be reflected through the native selected option.

The document language must update when the user changes language.

Layouts must prevent text overlap and horizontal overflow on narrow viewports.

## Maintenance Rules

Keep the site dependency-free unless a future requirement explicitly changes the project direction.

Do not add decorative image assets. The only image exception is the local brand logo used for the header and favicon.

Do not introduce external CSS, external scripts, web fonts, SVG icon packs, or build outputs.

When expanding content, keep synthetic material clearly labeled and never present it as factual reporting.

When changing tone, preserve the core D.U.M.B. warning: use AI, but do not surrender judgment.
