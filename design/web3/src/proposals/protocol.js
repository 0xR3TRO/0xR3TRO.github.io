/**
 * Proposal 5 · Protocol (specification).
 *
 * The site reads like a protocol specification: numbered sections, an
 * abstract, requirements written with RFC 2119 keywords, a registry of
 * modules (the projects) with their HTTP interface, and endpoints for contact.
 * Documentation layout: section tree, reading column, "On this page" index
 * that follows the scroll, and previous / next links in reading order.
 */
import { html } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { scrollSpy } from "../core/behaviors.js";
import { shortHash } from "../core/sha256.js";
import { brand, copyButton, externalLink, FILTERS, filterChips, filtered, navLinks, projectById, projectTabs, skipLink, t, themeToggle } from "../core/ui.js";

const ORDER = ["home", "about", "work", "contact"];
const NUM = { home: "0", about: "1", work: "2", contact: "3" };
const TITLES = { home: "Abstract", about: "About", work: "Modules", contact: "Contact" };

/** Module section number: 2.1 and 2.2 belong to the Modules page itself. */
const modNum = (p) => `2.${p.index + 2}`;

const kw = (word) => html`<strong class="p-kw">${word}</strong>`;

const REQUIREMENTS = [
    { id: "fast", text: html`Every project ${kw("MUST")} run in the browser, with nothing to install.` },
    { id: "private", text: html`Pages ${kw("MUST NOT")} track visitors, set cookies or call third parties.` },
    { id: "documented", text: html`Every project ${kw("SHOULD")} document what it is, how it works and how to run it.` },
];

/** Heading with a section number; also registers the section for the index. */
const section = (sections, number, title, body, { id = `s-${number.replaceAll(".", "-")}` } = {}) => {
    sections.push({ id, number, title });
    return html`<section class="p-section" aria-labelledby="${id}">
        <h2 class="p-h2" id="${id}"><span class="p-num">${number}</span>${title}</h2>
        ${body}
    </section>`;
};

const header = (ctx) => html`
    ${skipLink(ctx)}
    <header class="p-header">
        <div class="p-wide p-header__inner">
            ${brand(ctx)}
            <span class="p-badge">Spec · Draft 1.0</span>
            <nav class="p-nav" aria-label="Primary"><ul class="p-nav__list list-reset">${navLinks(ctx, { className: "p-nav__link" })}</ul></nav>
            ${themeToggle(ctx)}
        </div>
    </header>
`;

function sidebar(ctx) {
    const { projects } = ctx.content;
    const here = (page, project) => ctx.route.page === page && (!project || ctx.route.project === project);
    const link = (page, label, number, project) =>
        html`<a class="p-tree__link" href="${ctx.href({ page, project })}" ${here(page, project) ? html`aria-current="page"` : ""}><span class="p-tree__num">${number}</span>${label}</a>`;
    return html`
        <nav class="p-sidebar" aria-label="Specification contents">
            <p class="p-sidebar__title">The Klefas Specification</p>
            <ol class="p-tree list-reset">
                <li>${link("home", TITLES.home, NUM.home)}</li>
                <li>${link("about", TITLES.about, NUM.about)}</li>
                <li>
                    ${link("work", TITLES.work, NUM.work)}
                    <ol class="p-tree p-tree--nested list-reset">
                        ${projects.map((p) => html`<li>${link("project", p.name, modNum(p), p.id)}</li>`)}
                    </ol>
                </li>
                <li>${link("contact", TITLES.contact, NUM.contact)}</li>
            </ol>
        </nav>
    `;
}

function pager(ctx) {
    const { projects } = ctx.content;
    const entries = [
        { page: "home", label: `0 ${TITLES.home}` },
        { page: "about", label: `1 ${TITLES.about}` },
        { page: "work", label: `2 ${TITLES.work}` },
        ...projects.map((p) => ({ page: "project", project: p.id, label: `${modNum(p)} ${p.name}` })),
        { page: "contact", label: `3 ${TITLES.contact}` },
    ];
    const index = entries.findIndex((e) => e.page === ctx.route.page && (e.page !== "project" || e.project === ctx.route.project));
    const prev = entries[index - 1];
    const next = entries[index + 1];
    return html`<nav class="p-pager" aria-label="Previous and next section">
        ${prev ? html`<a class="p-pager__link" href="${ctx.href({ page: prev.page, project: prev.project })}"><span class="p-pager__dir">${icon("arrowLeft", { size: 16 })} Previous</span><span class="p-pager__label">${prev.label}</span></a>` : html`<span></span>`}
        ${next ? html`<a class="p-pager__link p-pager__link--next" href="${ctx.href({ page: next.page, project: next.project })}"><span class="p-pager__dir">Next ${icon("arrowRight", { size: 16 })}</span><span class="p-pager__label">${next.label}</span></a>` : html`<span></span>`}
    </nav>`;
}

function toc(ctx, sections) {
    return html`<aside class="p-toc" aria-labelledby="p-toc-title">
        <p class="p-toc__title" id="p-toc-title">On this page</p>
        <ol class="p-toc__list list-reset">
            ${sections.map(
                (s) => html`<li><a class="p-toc__link" href="${ctx.href({})}" data-action="scroll" data-target="${s.id}" data-toc="${s.id}"><span class="p-num">${s.number}</span>${s.title}</a></li>`,
            )}
        </ol>
        <p class="p-toc__meta">Fingerprint<br /><span class="p-mono">${shortHash(ctx.content.identity.fingerprint)}</span></p>
    </aside>`;
}

/** Page frame: header, three-column documentation layout, footer. */
function layout(ctx, { number, title, lead, label }, build) {
    const sections = [];
    const body = build(sections);
    return html`
        ${header(ctx)}
        <div class="p-wide p-docs">
            ${sidebar(ctx)}
            <main class="p-main" id="main" tabindex="-1">
                <header class="p-dochead">
                    <p class="t-label">${label}</p>
                    <h1 class="p-h1">${number ? html`<span class="p-num">${number}</span>` : ""}${title}</h1>
                    ${lead ? html`<p class="p-lead">${lead}</p>` : ""}
                </header>
                ${body}
                ${pager(ctx)}
            </main>
            ${toc(ctx, sections)}
        </div>
        <footer class="p-footer"><div class="p-wide p-footer__inner"><p>© 2026 klefas.me · All rights to the content reserved</p><p>Key words follow RFC 2119.</p></div></footer>
    `;
}

const requirementsList = () =>
    html`<ol class="p-reqs list-reset">${REQUIREMENTS.map((r, i) => html`<li><span class="p-reqs__id">R${i + 1}</span><p>${r.text}</p></li>`)}</ol>`;

function home(ctx) {
    const { person, projects, identity } = ctx.content;
    return layout(
        ctx,
        { title: "The Klefas Specification", label: "Specification · Draft 1.0", lead: `${person.tagline} This document describes who I am, how I work and what I have built.` },
        (sections) => html`
            <dl class="p-meta">
                <div><dt>Status</dt><dd>Draft</dd></div>
                <div><dt>Version</dt><dd>1.0</dd></div>
                <div><dt>Author</dt><dd>${person.name}, ${person.role}</dd></div>
                <div><dt>Languages</dt><dd>${person.languages.join(", ")}</dd></div>
                <div><dt>Updated</dt><dd>${t("[Date]")}</dd></div>
                <div><dt>Fingerprint</dt><dd class="p-mono">${shortHash(identity.fingerprint)}</dd></div>
            </dl>
            ${section(sections, "0.1", "Abstract", html`<p class="p-text">${person.intro}</p><p class="p-text">${t(person.story)}</p>`)}
            ${section(
                sections,
                "0.2",
                "Requirements",
                html`${requirementsList()}
                    <p class="p-note">${icon("shield", { size: 16 })}<span>The key words MUST, MUST NOT and SHOULD are to be read as described in RFC 2119.</span></p>`,
            )}
            ${section(
                sections,
                "0.3",
                "Modules",
                html`<div class="p-table-wrap" role="region" aria-label="Modules, scrolls sideways" tabindex="0"><table class="p-table">
                        <thead><tr><th scope="col">§</th><th scope="col">Module</th><th scope="col">Type</th><th scope="col">Interface</th></tr></thead>
                        <tbody>${projects.map(
                            (p) => html`<tr><td class="p-mono">${modNum(p)}</td><td><a class="p-link" href="${ctx.href({ page: "project", project: p.id })}">${p.name}</a></td><td>${p.kind}</td><td class="p-mono">GET ${p.path}</td></tr>`,
                        )}</tbody>
                    </table></div>
                    <a class="p-more" href="${ctx.href({ page: "work" })}">Read section 2, Modules ${icon("arrowRight", { size: 16 })}</a>`,
            )}
            ${section(
                sections,
                "0.4",
                "Contact",
                html`<p class="p-text">Write to <span class="p-mono">${person.email}</span>. Details in section 3.</p>
                    <div class="cluster">${copyButton(person.email, { label: "Copy email", className: "btn btn--primary btn--sm", key: "p-copy-email-home" })}${externalLink(person.github, "GitHub", { className: "btn btn--sm" })}</div>`,
            )}
        `,
    );
}

function about(ctx) {
    const { person, principles, milestones, skills } = ctx.content;
    return layout(ctx, { number: "1", title: "About", label: "Section 1", lead: person.tagline }, (sections) => html`
        ${section(sections, "1.1", "Story", html`<p class="p-text">${t(person.story)}</p><p class="p-text p-muted">Now: ${t(person.now)}</p>`)}
        ${section(
            sections,
            "1.2",
            "Principles",
            html`<dl class="p-defs">${principles.map((p, i) => html`<div><dt><span class="p-reqs__id">R${i + 1}</span>${p.title}</dt><dd>${p.text}</dd></div>`)}</dl>`,
        )}
        ${section(
            sections,
            "1.3",
            "Changelog",
            html`<ol class="p-changelog list-reset">${milestones.map((m) => html`<li><span class="p-changelog__ver p-mono">${t(m.when)}</span><div><h3 class="p-h3">${t(m.title)}</h3><p class="p-muted">${t(m.text)}</p></div></li>`)}</ol>`,
        )}
        ${section(sections, "1.4", "Stack", html`<ul class="cluster list-reset" aria-label="Skills">${skills.map((s) => html`<li class="chip">${t(s)}</li>`)}</ul>`)}
    `);
}

function work(ctx) {
    const { projects } = ctx.content;
    const list = filtered(ctx, projects);
    return layout(
        ctx,
        { number: "2", title: "Modules", label: "Section 2", lead: "Each module is a project served under klefas.me, with its own repository, documentation and live version." },
        (sections) => html`
            ${section(
                sections,
                "2.1",
                "Registry",
                html`<div class="p-toolbar">${filterChips(ctx, FILTERS)}<p class="p-muted p-small" aria-live="polite">${list.length} of ${projects.length} modules</p></div>
                    <div class="p-table-wrap" role="region" aria-label="Module registry, scrolls sideways" tabindex="0"><table class="p-table">
                        <thead><tr><th scope="col">§</th><th scope="col">Module</th><th scope="col">Type</th><th scope="col">Size</th><th scope="col">Interface</th><th scope="col"><span class="sr-only">Live version</span></th></tr></thead>
                        <tbody>${list.map(
                            (p) => html`<tr>
                                <td class="p-mono">${modNum(p)}</td>
                                <td><a class="p-link" href="${ctx.href({ page: "project", project: p.id })}">${p.name}</a></td>
                                <td>${p.kind}</td>
                                <td class="num">${p.size.value} ${p.size.unit}</td>
                                <td class="p-mono">GET ${p.path}</td>
                                <td>${externalLink(p.live, "Open", { className: "btn btn--sm" })}</td>
                            </tr>`,
                        )}</tbody>
                    </table></div>`,
            )}
            ${section(
                sections,
                "2.2",
                "Conventions",
                html`<ol class="p-reqs list-reset">
                    <li><span class="p-reqs__id">C1</span><p>A module ${kw("MUST")} live at <span class="p-mono">klefas.me/&lt;name&gt;/</span> and be reachable with a plain GET.</p></li>
                    <li><span class="p-reqs__id">C2</span><p>A module ${kw("MUST")} have a public source repository.</p></li>
                    <li><span class="p-reqs__id">C3</span><p>A module ${kw("SHOULD")} explain its decisions in its documentation.</p></li>
                </ol>`,
            )}
        `,
    );
}

function project(ctx) {
    const p = projectById(ctx);
    const n = modNum(p);
    return layout(ctx, { number: n, title: p.name, label: `Section ${n} · Module`, lead: p.summary }, (sections) => html`
        ${section(
            sections,
            `${n}.1`,
            "Summary",
            html`<dl class="p-meta p-meta--inline">
                    <div><dt>Type</dt><dd>${p.kind}</dd></div>
                    <div><dt>Size</dt><dd>${p.size.value} ${p.size.unit}</dd></div>
                    <div><dt>Stack</dt><dd>${p.stack.join(", ")}</dd></div>
                    <div><dt>Fingerprint</dt><dd class="p-mono">${shortHash(p.fingerprint)}</dd></div>
                </dl>
                <div class="cluster">${externalLink(p.live, "Open live", { className: "btn btn--primary btn--sm" })}${externalLink(p.source, "Source", { className: "btn btn--sm" })}</div>`,
        )}
        ${section(
            sections,
            `${n}.2`,
            "Interface",
            html`<pre class="p-code"><code><span class="p-code__key">GET</span> ${p.live}
<span class="p-code__dim">→ 200 text/html · no cookies · no third-party requests</span>
<span class="p-code__key">SOURCE</span> ${p.source}</code></pre>
                ${copyButton(p.live, { label: "Copy URL", key: "p-copy-url" })}`,
        )}
        ${section(sections, `${n}.3`, "Documentation", projectTabs(p, { prefix: "p-doc", className: "p-tabs" }))}
    `);
}

function contact(ctx) {
    const { person } = ctx.content;
    return layout(ctx, { number: "3", title: "Contact", label: "Section 3", lead: "How to reach the author of this specification." }, (sections) => html`
        ${section(
            sections,
            "3.1",
            "Endpoints",
            html`<dl class="p-endpoints">
                <div><dt class="p-mono">mailto</dt><dd><span class="p-mono">${person.email}</span>${copyButton(person.email, { label: "Copy", key: "p-copy-email" })}</dd></div>
                <div><dt class="p-mono">github</dt><dd>${externalLink(person.github, person.github.replace("https://", ""), { className: "p-link p-mono" })}</dd></div>
                <div><dt class="p-mono">location</dt><dd>${t(person.location)}</dd></div>
            </dl>`,
        )}
        ${section(sections, "3.2", "Response", html`<p class="p-text">${t("[How quickly you usually reply, and in which languages.]")}</p>`)}
        ${section(
            sections,
            "3.3",
            "Privacy",
            html`<p class="p-text">This site ${kw("MUST NOT")} set cookies or load anything from third parties. Nothing is sent until you write an email yourself.</p>`,
        )}
    `);
}

const PAGES = { home, about, work, project, contact };

function mount(root, ctx) {
    const sections = Array.from(root.querySelectorAll(".p-main .p-h2[id]"));
    const links = new Map(Array.from(root.querySelectorAll("[data-toc]")).map((a) => [a.dataset.toc, a]));
    const offset = (document.querySelector(".xc")?.offsetHeight || 0) + 96;
    ctx.cleanup(
        scrollSpy(sections, (id) => {
            for (const [key, link] of links) {
                if (key === id) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            }
        }, { offset }),
    );
}

export const protocol = {
    id: "protocol",
    render: (page, ctx) => PAGES[page](ctx),
    mount,
};
