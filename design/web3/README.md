# Web3 design explorer

Five design proposals for klefas.me, inspired by Web3, tokenization and security interfaces, in one interactive explorer. Each proposal has its own layout, typography and signature interaction; all of them share the same content, pages, spacing scale and two themes (Black and White).

**Open it:** [`dist/web3-explorer.html`](dist/web3-explorer.html) is a single self-contained file. Open it straight from disk; no server and no network access are needed. Decision notes live in [`docs/DESIGN-WEB3.md`](../../docs/DESIGN-WEB3.md).

Nothing in `design/` is deployed to klefas.me.

## The proposals

| # | Name | Direction | Signature interaction |
| --- | --- | --- | --- |
| 1 | Vault | Identity credential | Credential card that tilts with the pointer and flips to its records |
| 2 | Ledger | Block explorer | Verify the chain with real SHA-256 hashes, including a tamper test |
| 3 | Cipher | Security console | Command palette (Ctrl+K / ⌘K), decoding headline, email revealed on request |
| 4 | Mint | Token collection | Deterministic generative artwork per project, with a shuffle preview |
| 5 | Protocol | Specification | Numbered sections, RFC 2119 requirements, index that follows the scroll |

Every proposal implements the same pages: Home, About, Developer area, Project (with Overview, Documentation, Stack and Run locally tabs) and Contact, plus a shared site map. The explorer also has an Overview and a Compare view with a decision matrix.

## Links and state

State lives in the URL hash, so one combination is one shareable link:

- `#overview`, `#compare`
- `#<proposal>-<theme>-<page>`, for example `#ledger-dark-work`
- `#<proposal>-<theme>-project-<project>`, for example `#mint-light-project-lab`

## Scripts

Requires Node 20 or newer.

```bash
npm install
```

| Command | What it does |
| --- | --- |
| `npm run build` | Regenerates `src/styles/palettes.generated.css` and writes `dist/web3-explorer.html` |
| `npm run lint` | Design-token lint: spacing, font sizes, radii and colours must come from tokens |
| `npm test` | Unit tests: SHA-256 against Node's crypto, router, templating, palette contrast |
| `npm run build:check` | Fails if the generated files are out of date |
| `npm run check` | All of the above (what CI runs) |
| `npm run test:e2e` | Playwright run over all 144 views plus interaction checks (needs Playwright and Chromium) |

To publish the explorer as a Claude artifact, `node scripts/build.mjs --artifact <file>` also writes a body-only variant.

## Structure

```
design/web3/
├── src/
│   ├── main.js                 entry point
│   ├── index.html              page template (fonts, CSS and JS are inlined at build time)
│   ├── core/                   framework-free building blocks
│   │   ├── dom.js              escaping html`` templates, delegation
│   │   ├── router.js           hash routes
│   │   ├── sha256.js           synchronous SHA-256 (tested against Node)
│   │   ├── color.js            WCAG contrast, OKLCH to hex
│   │   ├── random.js           deterministic PRNG
│   │   ├── art.js              generative token art and sigils
│   │   ├── behaviors.js        accessible tabs, disclosures, scramble, scroll spy, copy
│   │   ├── icons.js            stroke icons
│   │   └── ui.js               shared partials: brand mark, nav, copy buttons, project tabs
│   ├── data/
│   │   ├── content.js          the single source of content for all proposals
│   │   └── proposals.js        metadata for the overview and the comparison matrix
│   ├── shell/                  explorer chrome, overview, compare, site map
│   ├── proposals/              one module per proposal: render(page, ctx) and mount(root, ctx)
│   ├── styles/                 tokens.css, base.css, shell.css and one stylesheet per proposal
│   └── tokens/palettes.json    every colour of both themes of every proposal
├── scripts/                    build, design-token lint, palette tooling
├── tests/unit/                 node --test
├── tests/e2e/                  Playwright + axe-core
└── dist/web3-explorer.html     generated, committed so it opens without tooling
```

## Design contract

These rules keep the five proposals consistent and are enforced by tooling, not by convention:

- **Spacing** comes from a 4px scale (`--space-0` to `--space-10`) and three layout tokens (`--gutter`, `--section-y`, `--section-y-tight`). `npm run lint` rejects raw lengths in `margin`, `padding` and `gap`.
- **Type** uses one scale (`--text-2xs` to `--text-6xl`) and shared roles (`.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`, `.t-label`). Raw font sizes are rejected.
- **Radii** come from `--radius-*`. Each proposal picks its own (Vault rounded, Ledger sharp, and so on).
- **Colour** comes only from `src/tokens/palettes.json`. Proposal stylesheets may not contain hex, `rgb()`, `oklch()` or named colours. Every text pair is checked against WCAG AA (body text 7:1) in both themes by `npm test`.
- **Headings**: exactly one `h1` per page and no skipped levels, checked on every view by the e2e run.
- **Accessibility**: landmarks, a skip link, visible focus, keyboard support for tabs, palette, search and carousel, reduced-motion support; axe-core reports no serious or critical issues.

## Adding a proposal

1. Add its palette to `src/tokens/palettes.json` (both themes) and run `npm test` to check contrast.
2. Create `src/proposals/<id>.js` exporting `{ id, render(page, ctx), mount(root, ctx) }` and `src/styles/<id>.css` scoped under `[data-proposal="<id>"]`.
3. Register it in `src/proposals/index.js`, `src/core/router.js` (`PROPOSAL_IDS`) and `src/data/proposals.js`.
4. Run `npm run check` and `npm run test:e2e`.

## Notes

- Content in `[brackets]` is a placeholder for the owner to fill in.
- Fingerprints are SHA-256 hashes of names and paths, computed in the browser. Nothing connects to a wallet or a blockchain; Web3 is the look, not a dependency.
- The klefas mark (a K whose upper arm ends in an open node) is original artwork drawn for this project. No logos, text or illustrations from the reference sites are used.
