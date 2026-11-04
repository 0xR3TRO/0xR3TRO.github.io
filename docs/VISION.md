# Site vision (brainstorm, not a decision)

Status: idea captured on 2026-11-04. Nothing here is decided yet. The goal of the next session is to turn it into one clear picture of what the finished site looks like, together with the site owner.

## Why this matters

The domain is the owner's surname, so the root of klefas.me should be about **the person**, not about a portfolio of projects. The current page (and the PR #5 scaffold) still leans on the project cards. This idea separates the two.

## The idea

1. **Personal site at klefas.me** - who I am, a short story, contact. Personal first, "business card" tone. PL and EN, picked automatically from the browser language (no switcher).
2. **A separate developer area** reachable from a navigation entry such as *Experience*, *Development*, *Programming* or *Work* (name not chosen). It is **not merged into the personal root**; it lives behind a tab or menu entry and links out to its own site, also built by us.
3. **That developer site is the detailed one**:
   - a description of every project
   - project documentation
   - every project can be opened **live**, as today (R3TRO Arcade, R3TRO Lab, Budgetly), so nothing we have now is lost
   - the same projects, but presented in a more coherent and clear way than the current flat list of cards
4. Existing project URLs (`/arcade/`, `/lab/`, `/budgetly/`) keep working.

## Open questions

- Where does the developer area live? Options: a path (`klefas.me/work/`), a subdomain (`dev.klefas.me`), or its own repository served under the same domain like the current projects.
- What is the section called, in PL and in EN?
- What does the personal root contain beyond name, role and contact? Does it keep a short project teaser that links to the developer area?
- Shared design between the two sites (same tokens, same theme toggle), or deliberately different looks?
- Project page template: description, stack, screenshots, documentation, "open live". Where does the documentation come from (Markdown in each project repo, or written here)?
- Live demos: plain links, or embedded in the page?
- How much of the retro "R3TRO" identity stays, and where does it show?

## Effect on work in progress

- PR #5 (bilingual personal card scaffold) stays valid: it is the personal root. Its "Projects" section would probably shrink into a teaser that links to the developer area.
- No build work on the developer area should start before the questions above are answered.

## Next step

Hold a short planning session: answer the open questions, sketch the page map (what pages exist and how they link), then split the work into small `feature/*` pull requests.
