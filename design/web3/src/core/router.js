/**
 * Hash routing for the explorer.
 *
 * Hash names use only ASCII letters, digits and hyphens so they survive being
 * shared as links (including inside a Claude artifact):
 *   #overview, #compare
 *   #<proposal>-<theme>-<page>             e.g. #ledger-dark-work
 *   #<proposal>-<theme>-project-<project>  e.g. #mint-light-project-lab
 */

export const PROPOSAL_IDS = ["vault", "ledger", "cipher", "mint", "protocol"];
export const THEMES = ["dark", "light"];
export const PAGES = ["home", "about", "work", "project", "contact", "map"];
export const VIEWS = ["overview", "compare"];

export const DEFAULT_ROUTE = Object.freeze({
    view: "overview",
    proposal: "vault",
    theme: "dark",
    page: "home",
    project: "arcade",
});

/**
 * @param {string} hash location.hash (with or without the leading #)
 * @param {string[]} projectIds valid project ids
 * @param {typeof DEFAULT_ROUTE} [base] values to fall back to
 */
export function parseRoute(hash, projectIds, base = DEFAULT_ROUTE) {
    const parts = String(hash || "").replace(/^#/, "").toLowerCase().split("-").filter(Boolean);
    if (parts.length === 1 && VIEWS.includes(parts[0])) return { ...base, view: parts[0] };
    if (!PROPOSAL_IDS.includes(parts[0])) return { ...base, view: "overview" };

    const [proposal, theme, page, project] = parts;
    const route = {
        view: "site",
        proposal,
        theme: THEMES.includes(theme) ? theme : base.theme,
        page: PAGES.includes(page) ? page : "home",
        project: base.project,
    };
    if (route.page === "project") route.project = projectIds.includes(project) ? project : projectIds[0];
    return route;
}

/** Inverse of parseRoute. */
export function formatRoute(route) {
    if (route.view !== "site") return route.view;
    const base = `${route.proposal}-${route.theme}-${route.page}`;
    return route.page === "project" ? `${base}-${route.project}` : base;
}

/** Identity of a page regardless of theme: used to decide when page state resets. */
export const pageKey = (route) =>
    route.view === "site" ? `${route.proposal}/${route.page}/${route.page === "project" ? route.project : ""}` : route.view;
