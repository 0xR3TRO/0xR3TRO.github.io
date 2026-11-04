/**
 * The explorer shell: a neutral control bar (proposal, theme, page) and the
 * stage where the chosen proposal renders. Owns routing, page state, focus
 * restoration and listener clean-up, so proposals only describe their pages.
 */
import { $, delegate, html, prefersReducedMotion, raw } from "../core/dom.js";
import { copyText, mountDisclosures, mountTabs } from "../core/behaviors.js";
import { brandMark } from "../core/ui.js";
import { DEFAULT_ROUTE, formatRoute, pageKey, parseRoute } from "../core/router.js";
import { proposalMeta } from "../data/proposals.js";
import { mountCompare, renderCompare } from "./compare.js";
import { renderOverview } from "./overview.js";
import { mountSitemap, renderSitemap } from "./sitemap.js";

const PAGE_LINKS = [
    ["home", "Home"],
    ["about", "About"],
    ["work", "Developer area"],
    ["project", "Project"],
    ["contact", "Contact"],
    ["map", "Site map"],
];

const clean = (patch) => Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));

export function createShell(app, { proposals, content }) {
    const projectIds = content.projects.map((project) => project.id);
    const prefersLight = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: light)").matches;
    let route = parseRoute(location.hash, projectIds, { ...DEFAULT_ROUTE, theme: prefersLight ? "light" : "dark" });
    let state = {};
    let session = 0;
    let disposers = [];

    app.innerHTML = String(html`
        <header class="xc" id="xc"></header>
        <div class="stage" id="stage"></div>
        <p class="sr-only" id="live" aria-live="polite"></p>
    `);
    const chrome = $("#xc", app);
    const stage = $("#stage", app);
    const live = $("#live", app);

    const announce = (message) => {
        live.textContent = "";
        requestAnimationFrame(() => (live.textContent = message));
    };

    const hrefFor = (target) => `#${formatRoute({ ...route, ...clean(target) })}`;

    const writeHash = () => {
        try {
            history.replaceState(null, "", `#${formatRoute(route)}`);
        } catch {
            /* sandboxed frames may refuse; the view still updates */
        }
    };

    function setTheme(theme) {
        if (route.view !== "site" || route.theme === theme) return;
        route = { ...route, theme };
        writeHash();
        render({ scroll: "keep" });
        announce(`${theme === "dark" ? "Black" : "White"} theme`);
    }

    function navigate(next) {
        const changedPage = pageKey(next) !== pageKey(route);
        route = next;
        if (changedPage) {
            state = {};
            session += 1;
        }
        render({ scroll: changedPage ? "top" : "keep" });
    }

    function chromeMarkup() {
        const isSite = route.view === "site";
        const proposalHref = (id) => hrefFor({ view: "site", proposal: id, page: isSite ? route.page : "home" });
        return html`
            <div class="xc__row">
                <a class="xc__brand" href="#overview" data-key="xc-brand">${brandMark({ size: 20 })}<span>klefas.me</span><span class="xc__sub">Web3 look · 5 proposals</span></a>
                <nav class="xc__nav" aria-label="Explorer">
                    <a class="xc__btn" href="#overview" data-key="xc-overview" ${route.view === "overview" ? raw('aria-current="page"') : ""}>Overview</a>
                    <a class="xc__btn" href="#compare" data-key="xc-compare" ${route.view === "compare" ? raw('aria-current="page"') : ""}>Compare</a>
                    <span class="xc__divider" aria-hidden="true"></span>
                    ${proposalMeta.map(
                        (p) =>
                            html`<a class="xc__btn" href="${proposalHref(p.id)}" data-key="xc-${p.id}" ${isSite && route.proposal === p.id ? raw('aria-current="true"') : ""}><span class="xc__num" aria-hidden="true">${p.number}</span>${p.name}</a>`,
                    )}
                </nav>
            </div>
            ${isSite
                ? html`
                      <div class="xc__row xc__row--site">
                          <div class="xc__group" role="group" aria-label="Theme">
                              <span class="xc__label">Theme</span>
                              <button type="button" class="xc__btn" data-action="set-theme" data-value="dark" data-key="xc-dark" aria-pressed="${String(route.theme === "dark")}">Black</button>
                              <button type="button" class="xc__btn" data-action="set-theme" data-value="light" data-key="xc-light" aria-pressed="${String(route.theme === "light")}">White</button>
                          </div>
                          <nav class="xc__group" aria-label="Pages of this proposal">
                              <span class="xc__label">Page</span>
                              ${PAGE_LINKS.map(
                                  ([page, label]) =>
                                      html`<a class="xc__btn" href="${hrefFor({ page })}" data-key="xc-page-${page}" ${route.page === page ? raw('aria-current="page"') : ""}>${label}</a>`,
                              )}
                          </nav>
                      </div>
                  `
                : ""}
        `;
    }

    function makeContext() {
        return {
            route,
            content,
            state,
            session,
            isCurrent: (id) => id === session,
            href: (patch = {}) => hrefFor({ view: "site", ...patch }),
            hrefFor,
            set(patch) {
                Object.assign(state, patch);
                render({ scroll: "keep" });
            },
            on(type, selector, handler, target = stage) {
                disposers.push(delegate(target, type, selector, handler));
            },
            cleanup(fn) {
                disposers.push(fn);
            },
            announce,
            copy: copyText,
            setTheme,
            reducedMotion: prefersReducedMotion(),
        };
    }

    function render({ scroll = "keep" } = {}) {
        const focusKey = document.activeElement?.closest?.("[data-key]")?.dataset.key;
        const y = window.scrollY;
        for (const dispose of disposers.splice(0)) dispose();

        chrome.innerHTML = String(chromeMarkup());
        if (route.view === "site") {
            stage.dataset.proposal = route.proposal;
            stage.dataset.theme = route.theme;
        } else {
            delete stage.dataset.proposal;
            delete stage.dataset.theme;
        }

        const ctx = makeContext();
        const proposal = proposals[route.proposal];
        let view;
        if (route.view === "overview") view = { render: renderOverview };
        else if (route.view === "compare") view = { render: renderCompare, mount: mountCompare };
        else if (route.page === "map") view = { render: renderSitemap, mount: mountSitemap };
        else view = { render: (c) => proposal.render(route.page, c), mount: proposal.mount };

        stage.innerHTML = String(view.render(ctx));
        mountTabs(stage, state);
        mountDisclosures(stage, state);
        view.mount?.(stage, ctx);

        const meta = proposalMeta.find((p) => p.id === route.proposal);
        document.title =
            route.view === "site" ? `${meta.name} · ${route.page} · Klefas Web3 Look` : `${route.view === "compare" ? "Compare" : "Overview"} · Klefas Web3 Look`;

        window.scrollTo(0, scroll === "top" ? 0 : y);
        if (focusKey) {
            const target = app.querySelector(`[data-key="${CSS.escape(focusKey)}"]`);
            if (target && target !== document.activeElement) target.focus({ preventScroll: true });
        }
    }

    async function copyFrom(button) {
        const ok = await copyText(button.dataset.copy);
        const label = button.querySelector("[data-copy-label]");
        if (label) {
            const original = label.textContent;
            label.textContent = ok ? "Copied" : "Copy failed";
            setTimeout(() => (label.textContent = original), 1600);
        }
        announce(ok ? "Copied to the clipboard" : "Copy failed. Select the text instead.");
    }

    delegate(app, "click", "[data-action]", (event, el) => {
        const action = el.dataset.action;
        if (action === "theme") setTheme(route.theme === "dark" ? "light" : "dark");
        else if (action === "set-theme") setTheme(el.dataset.value);
        else if (action === "copy") copyFrom(el);
        else if (action === "set") {
            state[el.dataset.state] = el.dataset.value;
            render({ scroll: "keep" });
        } else if (action === "skip" || action === "scroll") {
            event.preventDefault();
            const target = action === "skip" ? $("#main", stage) : stage.querySelector(`#${CSS.escape(el.dataset.target)}`);
            if (!target) return;
            target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
            if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        }
    });

    window.addEventListener("hashchange", () => navigate(parseRoute(location.hash, projectIds, route)));

    if ("ResizeObserver" in window) {
        new ResizeObserver(() => document.documentElement.style.setProperty("--chrome-h", `${chrome.offsetHeight}px`)).observe(chrome);
    }

    render({ scroll: "top" });
    return { navigate, setTheme, get route() { return route; } };
}
