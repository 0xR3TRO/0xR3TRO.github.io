# Repository rulesets

GitHub rulesets cannot be applied from the repository itself, but they can be imported in one step.

## Protect `main` and `develop`

1. Open **Settings -> Rules -> Rulesets -> New ruleset -> Import a ruleset**.
2. Choose `protect-main-develop.json` from this folder and confirm.

What it enforces on `main` and `develop`:

- the branches cannot be deleted
- no force pushes
- changes only through a pull request
- the `validate` CI check must pass

Required approvals are set to 0 because this is a one-person repository: GitHub does not let an author approve their own pull request, so requiring one would block every merge. Raise `required_approving_review_count` if more people join.

## Other settings to enable (Settings -> Code security)

- Private vulnerability reporting
- Secret scanning and push protection
- Dependabot alerts
