/**
 * Small markup partials shared by every proposal. Proposals keep their own
 * layout and styling; these helpers only guarantee the same semantics
 * (labels, new-tab hints, placeholders, copy buttons) everywhere.
 */
import { html, raw } from "./dom.js";
import { icon } from "./icons.js";

export const NAV = [
    { page: "home", label: "Home" },
    { page: "about", label: "About" },
    { page: "work", label: "Developer area" },
    { page: "contact", label: "Contact" },
];

/** Content written as "[...]" is a placeholder still to be filled in. */
export const isPlaceholder = (value) => typeof value === "string" && /^\[.*\]$/.test(value.trim());

/** Render text, marking placeholders visibly. */
export const t = (value) => (isPlaceholder(value) ? html`<span class="ph">${value}</span>` : value);

/**
 * The klefas mark: a K whose upper arm ends in an open node, read as both a
 * key ring and a network node. Original artwork, drawn for this project.
 */
export function brandMark({ size = 24, className = "mark" } = {}) {
    return raw(
        `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3.5v17"/><path d="M6 14.2 13.6 6.6"/><circle cx="16.1" cy="4.6" r="2.3"/><path d="M9.6 10.8 16.8 20.5"/></svg>`,
    );
}

/** Logo link: mark + wordmark, always pointing home. */
export const brand = (ctx, { className = "brand" } = {}) =>
    html`<a class="${className}" href="${ctx.href({ page: "home" })}" aria-label="klefas.me, home">${brandMark()}<span class="brand__word" aria-hidden="true">klefas</span></a>`;

/** Primary navigation list items with aria-current. */
export const navLinks = (ctx, { className = "nav__link" } = {}) =>
    NAV.map((item) => {
        const current = ctx.route.page === item.page || (item.page === "work" && ctx.route.page === "project");
        return html`<li><a class="${className}" href="${ctx.href({ page: item.page })}" ${current ? raw('aria-current="page"') : ""}>${item.label}</a></li>`;
    });

export const themeToggle = (ctx, { className = "theme-toggle" } = {}) => {
    const next = ctx.route.theme === "dark" ? "light" : "dark";
    return html`<button type="button" class="${className}" data-action="theme" data-key="theme-toggle" aria-label="Switch to ${next === "light" ? "White" : "Black"} theme">${icon(next === "light" ? "sun" : "moon")}</button>`;
};

export const copyButton = (value, { label = "Copy", className = "btn btn--ghost btn--sm", key } = {}) =>
    html`<button type="button" class="${className}" data-action="copy" data-copy="${value}" data-key="${key || `copy-${value}`}">${icon("copy", { size: 16 })}<span data-copy-label>${label}</span></button>`;

export const externalLink = (href, label, { className = "" } = {}) =>
    html`<a class="${className}" href="${href}" target="_blank" rel="noopener noreferrer">${label}${icon("arrowUpRight", { size: 16 })}<span class="sr-only"> (opens in a new tab)</span></a>`;

/** Skip link that focuses <main> without touching the router's hash. */
export const skipLink = (ctx) => html`<a class="skip-link" href="${ctx.href({})}" data-action="skip">Skip to content</a>`;

export const filterChips = (ctx, filters, { className = "chip-toggle" } = {}) => {
    const active = ctx.state.filter || "All";
    return html`<div class="filters" role="group" aria-label="Filter projects by type">${filters.map(
        (filter) =>
            html`<button type="button" class="${className}" data-action="set" data-state="filter" data-value="${filter}" data-key="filter-${filter}" aria-pressed="${String(active === filter)}">${filter}</button>`,
    )}</div>`;
};

export const filtered = (ctx, projects) => {
    const active = ctx.state.filter || "All";
    return active === "All" ? projects : projects.filter((project) => project.kind === active);
};

export const FILTERS = ["All", "Games", "Tools", "Apps"];

/** Sample-data note required wherever generated or placeholder values appear. */
export const sampleNote = (text = "Fingerprints are SHA-256 hashes of each name. Everything in [brackets] is a placeholder.") =>
    html`<p class="sample-note">${text}</p>`;

/**
 * Project documentation as accessible tabs (shared structure, styled per proposal).
 * Panel ids are prefixed so two tab groups never clash.
 */
export function projectTabs(project, { prefix, className = "tabs" }) {
    const tabs = [
        ["overview", "Overview", html`<div class="stack"><p class="t-body">${project.summary}</p><p class="t-body">${t(project.docs.what)}</p></div>`],
        [
            "docs",
            "Documentation",
            html`<dl class="${className}__dl">
                <div><dt class="t-label">What it is</dt><dd>${t(project.docs.what)}</dd></div>
                <div><dt class="t-label">How it works</dt><dd>${t(project.docs.how)}</dd></div>
                <div><dt class="t-label">Decisions</dt><dd>${t(project.docs.decisions)}</dd></div>
            </dl>`,
        ],
        ["stack", "Stack", html`<ul class="cluster list-reset" aria-label="Technologies">${project.stack.map((item) => html`<li class="chip">${item}</li>`)}</ul>`],
        ["run", "Run locally", html`<pre class="${className}__code"><code>${project.run.map((line) => html`<span class="${className}__line">${t(line)}</span>`)}</code></pre>`],
    ];
    return html`<div class="${className}" data-tabs="${prefix}-${project.id}">
        <div class="${className}__list" role="tablist" aria-label="${project.name} documentation">
            ${tabs.map(
                ([id, label], index) =>
                    html`<button type="button" class="${className}__tab" role="tab" id="${prefix}-tab-${id}" aria-controls="${prefix}-panel-${id}" aria-selected="${String(index === 0)}" tabindex="${index === 0 ? "0" : "-1"}" data-key="${prefix}-tab-${id}">${label}</button>`,
            )}
        </div>
        ${tabs.map(
            ([id, , body], index) =>
                html`<div class="${className}__panel" role="tabpanel" id="${prefix}-panel-${id}" aria-labelledby="${prefix}-tab-${id}" tabindex="0" ${index === 0 ? "" : raw("hidden")}>${body}</div>`,
        )}
    </div>`;
}

/** Breadcrumb for project pages. */
export const breadcrumb = (ctx, project, { className = "crumbs" } = {}) =>
    html`<nav class="${className}" aria-label="Breadcrumb"><ol class="list-reset">
        <li><a href="${ctx.href({ page: "work" })}">Developer area</a></li>
        <li aria-current="page">${project.name}</li>
    </ol></nav>`;

export const projectById = (ctx) => ctx.content.projects.find((p) => p.id === ctx.route.project) || ctx.content.projects[0];
