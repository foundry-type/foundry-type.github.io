# Foundry — a typography playground

Live: https://kumarnikhildeveloperaccount.github.io/foundry/

Foundry is a free, static, client-side typography playground with an editorial Swiss-poster / letterpress look.

## Features
- **Pairing Studio** — 19 Google Fonts (loaded on demand, only when picked) + 8 system font stacks that work offline. Curated pairings, shuffle, swap.
- **Sliders** — heading/body weight (respects each font's real weight range), tracking (letter-spacing), leading (line-height), italic, all caps.
- **Type scale generator** — base size × 8 musical ratios (minor second → golden ratio), px + rem.
- **Specimen posters** — 4 canvas layouts (Zürich Grid, Letterpress, Big Glyph, Waterfall) with procedural ink distress and paper grain, optional animation, PNG download.
- **WCAG contrast checker** — AA/AAA for normal and large text plus 3:1 UI check, preset palettes, one-click "Fix for AA" that keeps the hue.
- **CSS export** — `@import`, custom properties, scale steps (optional fluid `clamp()`), plus a JSON design-tokens view. Copy or download.
- **Guess the Font** — 10 rounds, harder decoys later, hints, streak bonus, best score saved locally.
- **Type-history timeline** — 23 events from Bi Sheng's clay type to variable fonts, filterable by era.
- **Themes** — Swiss, Letterpress, Night Press, Riso.
- **Sounds** — synthesized with Web Audio (press thunk, tick, bell); off until you switch them on.
- **Easter eggs** — type `comic sans` or `keming` anywhere outside a text field; tap the round "F" logo five times.

## Saving
The whole design lives in the **URL query string** (`?h=fraunces&b=inter&hw=800…`) — bookmark it or share it. The
"Type Drawer" keeps a list of designs you file, in `localStorage` (this device only).

## Files
- `index.html`, `404.html`, `favicon.svg`, `manifest.webmanifest`
- `css/base.css`, `css/sections.css`
- `js/data.js`, `js/core.js`, `js/studio.js`, `js/poster.js`, `js/tools.js`, `js/game.js`, `js/main.js`

## External resources
- Google Fonts CSS API: `https://fonts.googleapis.com/css2?family=…&display=swap` (font files from `fonts.gstatic.com`). Every family has a system fallback; offline, the site keeps working with system stacks.
- No libraries, no trackers, no API keys.

## Credits
Designed & built by Kumar Nikhil — [Portfolio](https://kumarnikhildeveloperaccount.github.io/) · [LinkedIn](https://www.linkedin.com/in/kumar-nikhil-1000a9192/) · [Email](mailto:nkashyapnikhilnk@gmail.com)

With gratitude to God — Om Namah Paarvati Pateh, Har Har Mahadev. May God bless you and everyone.
