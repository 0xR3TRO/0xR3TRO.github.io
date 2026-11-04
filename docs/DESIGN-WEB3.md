# Design direction: five Web3 proposals

Status: proposals ready for a decision. Explorer: [`design/web3/dist/web3-explorer.html`](../design/web3/dist/web3-explorer.html) (open the file directly). Code and tooling: [`design/web3/`](../design/web3/README.md).

## Brief

- The domain is the owner's surname, so the site is personal first, with a separate developer area for projects, documentation and live demos (see [`VISION.md`](VISION.md) where available).
- Visual language: inspired by crypto exchanges and market tools (bold grotesque headlines, black and white, restrained accents), Web3, tokenization and cybersecurity. Inspired, not copied.
- Two themes: Black and White.
- No charts or graphs on the site.
- Advanced, well-structured code with consistent headings, layouts and spacing.

Earlier attempts (the first explorer and the exchange-style proposals) were rejected: the first for its look, the second for being too close to the reference sites. This set starts from scratch.

## The five proposals

| | Vault | Ledger | Cipher | Mint | Protocol |
| --- | --- | --- | --- | --- | --- |
| Direction | Identity credential | Block explorer | Security console | Token collection | Specification |
| Layout | Split hero with a credential card, panels that stack on scroll | Narrow column, vertical chain of blocks, header search | App shell: page tree, document, inspector, status bar | Gallery: rail of tokens, large token pages | Docs: section tree, reading column, on-this-page index |
| Signature | Card tilts and flips to its records | Verify the SHA-256 chain, tamper test | Command palette, decoding headline, email revealed on request | Generative art per project, shuffle preview | Numbered sections, RFC 2119 requirements, scroll-following index |
| Accent | Mint | Lime | Amber | Coral (+ artwork colours) | Electric blue |
| Effort | Medium | Medium | High | Medium | Low |
| Best for | A calling card | Precision and method | A site that feels like a tool | Showing the projects | Thoughtful, documentation-first |

The Compare view in the explorer has the full matrix (concept, layout, typography, colour, signature, strengths, watch-outs, effort, best for) and lets you pick one and copy the decision.

## What is shared

- Same content and pages in all five: Home, About, Developer area, Project, Contact, plus a site map.
- One spacing scale, one type scale and shared radii; a lint script rejects raw values.
- Palettes in one JSON file; every text colour passes WCAG AA in both themes, checked by tests.
- No trackers, no wallet connection, no blockchain calls. Fingerprints are real SHA-256 hashes computed in the browser.
- An original klefas mark.

## Verification

- `npm run check`: design-token lint, 10 unit tests (including SHA-256 against Node's crypto and palette contrast) and a stale-build check. Runs in CI.
- `npm run test:e2e`: 144 views (5 proposals × 2 themes × 7 pages, plus overview and compare, at desktop and phone width). Each view has no console errors, one `main`, one `h1`, no skipped heading levels, no duplicate ids, named controls, no horizontal overflow, and no serious or critical axe-core issues. Interaction checks cover the card flip, chain verification and tamper test, search, sorting, the command palette, filtering, the email reveal, art shuffle, the scroll-following index, keyboard tabs, the decision picker and the site map.

## Next step

Pick one proposal and one theme as the default. The chosen design then replaces the scaffold in `pl/` and `en/` (see the bilingual card pull request), with the real content filled in where the explorer shows `[brackets]`.
