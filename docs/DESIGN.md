# Design exploration

Three candidate design systems and five candidate layouts for the personal site, all in one interactive explorer: [`design/index.html`](../design/index.html).

Everything in the explorer is **placeholder content**. Nothing here is deployed; `design/` is excluded from the published site.

## How to open it

- From the repository: open `design/index.html` in a browser (it loads fonts from `../fonts/`).
- Locally with a server: `python3 -m http.server` in the repo root, then open `http://localhost:8000/design/`.
- Every state lives in the URL hash, so a link such as `design/index.html#ds=c&layout=4&mode=light&view=home` opens one exact combination and can be shared.

The top bar switches: **design system**, **layout**, **view** (personal site, developer area, design sheet) and **dark/light mode**. All 3 x 5 x 2 x 2 combinations were checked in Chromium with no console errors and no horizontal overflow.

## Design systems

All three are built from the same token names, so a layout works with any of them and the final choice is a matter of swapping token values.

| Token | Meaning |
| --- | --- |
| `--bg`, `--surface`, `--surface2` | page, card and raised-surface backgrounds |
| `--fg`, `--muted` | primary and secondary text |
| `--accent`, `--accent2`, `--on-accent` | brand colours and text on accent |
| `--border` | hairlines and card borders |
| `--radius`, `--radius-sm` | corner radii |
| `--font-display`, `--font-body`, `--font-mono` | type families |
| `--h-weight`, `--h-track` | heading weight and letter-spacing |

### A - Retro Terminal

Heritage of the R3TRO projects. Monospace everywhere, neon green and amber on near-black (or a pale terminal paper in light mode), 2px corners, bracketed buttons (`[ live demo ]`), corner marks on cards, a `>` prompt before headings.
Best for: a strong developer identity. Risk: monospace body text is tiring for long reading.

### B - Soft Modern

Closest to the current site. Inter, violet and pink accents with a gradient on key words and primary buttons, 16px rounded cards, soft shadows.
Best for: a friendly, familiar look; lowest migration cost. Risk: the most generic of the three.

### C - Editorial

Calm and personal. Serif display type, warm paper background, hairline rules instead of boxes, one rust accent, italic accent word in the headline, square corners.
Best for: a personal site where the surname is the domain; reads like a page about a person. Risk: needs good copy to carry it.

### Contrast

Text and accent colours were chosen to keep body text at WCAG AA or better on their backgrounds in both modes. Secondary text (`--muted`) is the one to re-check if colours are changed.

## Layouts

Each layout has a personal view and a developer-area view, and links the two.

1. **Centered hero** - single column, centered headline, sections stacked. The safest, most familiar structure.
2. **Split sidebar** - sticky profile column on the left (name, role, navigation, contacts), content scrolling on the right. Feels like a CV, works well for a person-first site.
3. **Bento grid** - a mosaic of tiles (intro, now, languages, about, stack, developer area, contact). Dense and modern; every tile is a small entry point.
4. **Story timeline** - short intro, then a vertical timeline of milestones that expand on click. Best if there is a story to tell.
5. **Terminal CLI** - the page is a terminal: type or click `whoami`, `about`, `stack`, `work`, `contact`. Most distinctive, least conventional; best paired with design system A.

### Developer area

All layouts share one developer-area component, matching the idea in [`VISION.md`](VISION.md): project cards with a tag, description, stack chips, a **Live demo** button and a **Docs** toggle that expands an inline documentation stub, plus category filters.

## Choosing

Suggested starting points, not decisions:

- Person-first and calm: **C + layout 2 or 4**
- Closest to today with the least risk: **B + layout 1 or 3**
- Strongest developer identity: **A + layout 5** (with layout 1 as a plain fallback)

The next step is to pick one system and one layout (or mix: a different layout for the developer area), then implement it in `pl/` and `en/` using the chosen tokens in `assets/css/`.
