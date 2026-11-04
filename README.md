# klefas.me

> Personal website: who I am, what I do and what I'm working on.

[![Deploy](https://github.com/0xR3TRO/0xR3TRO.github.io/actions/workflows/static.yml/badge.svg)](https://github.com/0xR3TRO/0xR3TRO.github.io/actions/workflows/static.yml)
[![CI](https://github.com/0xR3TRO/0xR3TRO.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/0xR3TRO/0xR3TRO.github.io/actions/workflows/ci.yml)

**[klefas.me](https://klefas.me)**

## Projects under the same domain (separate repositories)

- [klefas.me/arcade](https://klefas.me/arcade/) - R3TRO Arcade, 14 browser games ([code](https://github.com/0xR3TRO/arcade))
- [klefas.me/lab](https://klefas.me/lab/) - R3TRO Lab, 24 small apps and UI experiments ([code](https://github.com/0xR3TRO/lab))
- [klefas.me/budgetly](https://klefas.me/budgetly/) - Budgetly, a household budget in the browser ([code](https://github.com/0xR3TRO/budgetly))

## Features

- Two language versions, `/pl/` and `/en/`. `/` picks one from the browser's language list, with no switcher and no IP lookup.
- Automatic dark and light theme with a manual toggle, applied before first paint.
- Subtle particle background and typing effect, both off with `prefers-reduced-motion`.
- Accessible: skip link, visible focus, contrast checked, labelled controls.
- Privacy: no analytics, no third-party requests, fonts are self-hosted.
- Hardened: Content-Security-Policy and referrer policy set in `<meta>`.

## Stack

- HTML5, CSS3 and vanilla JavaScript, no frameworks and no build step
- GitHub Pages with GitHub Actions
- Inter and JetBrains Mono, self-hosted (SIL OFL 1.1)

## Structure

```
├── index.html          # Language picker and redirect to /pl/ or /en/
├── pl/index.html       # Polish version
├── en/index.html       # English version
├── 404.html            # Error page and redirects of old addresses
├── assets/             # Shared CSS and JS (theme, effects, language redirect)
├── fonts/              # Fonts (SIL OFL 1.1) and fonts.css
├── r3tro-arcade/       # Redirect to /arcade/
├── web-lab/            # Redirect to /lab/
├── robots.txt, sitemap.xml
├── CNAME               # Custom domain klefas.me
├── .github/            # Workflows, PR template, Dependabot
└── docs/CONTRIBUTING.md
```

## Contributing and deploy

Branch model, naming and workflow are described in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md). Pushes to `main` deploy the site through GitHub Actions; only the site files are published, not tooling and docs.

## Licence

Site code: [MIT](LICENSE). Content (texts, name and look of the brand): all rights reserved, see [NOTICE.md](NOTICE.md). Fonts: SIL Open Font License 1.1, see `fonts/OFL-*.txt`.
