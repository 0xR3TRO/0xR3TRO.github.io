# Crypto-exchange look: three proposals

Direction chosen after the first design explorer was rejected: a look inspired by crypto exchanges, in two themes only, **Black** and **White**. Explorer: [`design/crypto/index.html`](../design/crypto/index.html).

The explorer starts on a clickable **site map**. Every box opens that page. Link format: `design/crypto/index.html#p2-dark-home` (proposal, theme, page).

## What was taken from the references

Based on screenshots of OKX and TradingView supplied by the owner (the sites themselves could not be fetched from the build environment). Nothing is copied: no logos, text, illustrations or exact assets, only the visual language.

From OKX: stark black and white, very large bold headings with tight tracking, pill-shaped buttons (solid white on black, thin outline), a black top bar in both themes, numbered steps in two columns, a side contents list with a bar on the active item, a split screen (black statement on one side, a form on the other), a lime underlined link in a bottom banner.

From TradingView: pure black ground, filter pills with a thin outline, a screener table with rounded symbol chips and small trend lines, mint for rises and coral for falls, an area chart with a faint glow, tabs with a line under the active one, a row of period buttons with the change for each.

Deliberately left out: the green neon room illustration from the OKX hero. Glow is used only on the chart line and the page title in proposal 2, in the Black theme.

## Themes

| Token | Black | White |
| --- | --- | --- |
| `--bg` | `#000000` | `#ffffff` |
| `--surface` / `--surface2` | `#121212` / `#1b1b1b` | `#f6f6f6` / `#ececec` |
| `--line` | `#262626` | `#e4e4e4` |
| `--fg` / `--muted` | `#ffffff` / `#8f8f8f` | `#000000` / `#6a6a6a` |
| `--up` / `--down` | `#22d6a8` / `#ff5c6c` | `#0a8a6a` / `#e0314a` |
| `--link` | `#d4ff3d` | `#1b6a2e` |

Type: Inter (headings at 800 with tight tracking, tabular numerals for data) and JetBrains Mono for symbols and labels. Both are already self-hosted in `fonts/`.

## Proposals

1. **Exchange** (OKX-led): centered giant headline, white and outline pills, a four-number strip, "Step one / two / three", big project rows, a sticky banner.
2. **Market view** (TradingView-led): the owner as a "symbol" with a ticker chip, a headline number, tabs, an area chart with period buttons, a screener-style table with filters and small trend lines.
3. **Split ledger** (both): a sticky side column with a contents list and an active bar, content in label / description rows, projects as expandable rows.

All three share the same pages: Home, About, Developer area, Project (with Overview, Documentation, Stack and Run locally tabs), Contact, plus the site map.

## Notes

- All content is placeholder. Charts and percentages are **sample data** generated for the design and are labelled as such. They must not be shown as real numbers on the live site.
- State is kept in the URL hash, so one combination is one shareable link.
