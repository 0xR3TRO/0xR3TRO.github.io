# Security policy

This is a static website with no backend, no accounts and no analytics, so the attack surface is small. Reports are still welcome.

## Reporting a vulnerability

Please email **kontakt@klefas.me** with a description and steps to reproduce. Do not open a public issue for a security problem. You can expect a first reply within a few days.

You can also use GitHub's private vulnerability reporting (**Security -> Report a vulnerability**) on this repository.

## Scope

- the website at https://klefas.me and the code in this repository

Projects served under the same domain (`/arcade/`, `/lab/`, `/budgetly/`) live in their own repositories and have their own policies.

## What the site already does

- Content-Security-Policy and referrer policy set in `<meta>` on every page
- no third-party requests: fonts are self-hosted, no trackers
- CI validates every pull request; GitHub Actions are kept up to date by Dependabot
- workflows run with read-only repository permissions, only the Pages deploy job can publish
