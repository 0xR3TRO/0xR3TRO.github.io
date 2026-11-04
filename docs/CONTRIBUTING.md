# Working with this repository

The site is static (HTML, CSS and JS, no bundler). The `main` branch is production: every push to `main` deploys the site to klefas.me.

## Branches

| Branch      | Purpose                                  | Created from | Merged into                  |
| ----------- | ---------------------------------------- | ------------ | ---------------------------- |
| `main`      | production, stable code only             | -            | -                            |
| `develop`   | integration of upcoming changes (optional) | `main`     | `main` (release)             |
| `feature/*` | new feature, section or content          | `develop`    | `develop`                    |
| `bugfix/*`  | fix for a bug found in `develop`         | `develop`    | `develop`                    |
| `hotfix/*`  | urgent fix for a bug in production       | `main`       | `main`, then back to `develop` |

Branch name: `kind/short-description`, lowercase, words joined with hyphens, ideally 2-3 words (`feature/about-section`, `bugfix/mail-link`, `hotfix/broken-redirect`). No names, dates or auto-generated names.

## Workflow

1. `feature/*` and `bugfix/*`: branch from `develop`, open a pull request into `develop`, **Squash and merge**, delete the branch.
2. Release: a pull request from `develop` into `main`, merged with a regular **merge commit** (no squash, so the histories of both branches do not diverge). The site deploys automatically after the merge.
3. `hotfix/*`: branch from `main`, open a pull request into `main` (merge commit), then merge `main` back into `develop`.
4. Never commit directly to `main` or `develop`. The CI check (`CI / validate`) must pass before merging.

Commit messages, pull request titles and descriptions, and documentation are written in English. Only the Polish version of the site (`/pl/`) is in Polish.

If `develop` turns out to be unnecessary, delete it: `feature/*` and `bugfix/*` then branch from `main` and merge back into `main`.

## GitHub settings to enable manually

These cannot be stored in the repository. Set them in **Settings**:

- **Branches -> Add rule** for `main` and `develop`: require a pull request and the `validate` check.
- **General -> Pull Requests**: keep squash merging and merge commits enabled, and enable "Automatically delete head branches".
- **Pages**: set the source to "GitHub Actions". The default branch stays `main`, so pull requests must be pointed at `develop` manually.

## Local validation

```bash
npx html-validate@9 --config .htmlvalidate.json "**/*.html"
```
