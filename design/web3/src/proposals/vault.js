/**
 * Proposal 1 · Vault (identity credential).
 *
 * The domain is the owner's name, so the site opens with an identity
 * credential: a card with a security-print pattern that tilts with the
 * pointer and flips to show its records. Below it, content panels stack on
 * scroll like passes in a wallet. Projects are "assets" with a sigil drawn
 * from their own SHA-256 fingerprint.
 */
import { html } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { sigil } from "../core/art.js";
import { shortHash } from "../core/sha256.js";
import {
    brand,
    brandMark,
    breadcrumb,
    copyButton,
    externalLink,
    FILTERS,
    filterChips,
    filtered,
    navLinks,
    projectById,
    projectTabs,
    sampleNote,
    skipLink,
    t,
    themeToggle,
} from "../core/ui.js";

const header = (ctx) => html`
    ${skipLink(ctx)}
    <header class="v-header">
        <div class="container v-header__inner">
            ${brand(ctx)}
            <nav class="v-nav" aria-label="Primary">
                <ul class="v-nav__list list-reset">${navLinks(ctx, { className: "v-nav__link" })}</ul>
            </nav>
            <div class="v-header__end">
                <span class="v-pill"><span class="v-dot" aria-hidden="true"></span>klefas.me</span>
                ${themeToggle(ctx)}
            </div>
        </div>
    </header>
`;

const footer = (ctx) => html`
    <footer class="v-footer">
        <div class="container v-footer__inner">
            <p>© 2026 klefas.me · All rights to the content reserved</p>
            <p class="mono" title="SHA-256 of klefas.me">${shortHash(ctx.content.identity.fingerprint)}</p>
        </div>
    </footer>
`;

const layout = (ctx, body) => html`${header(ctx)}<main id="main" tabindex="-1">${body}</main>${footer(ctx)}`;

/** The flippable credential card. State lives in ctx.state.flipped[id]. */
function credential(ctx, { id, title, subtitle, fingerprint, status, since, records, artLabel }) {
    const flipped = Boolean(ctx.state.flipped?.[id]);
    return html`
        <div class="v-cred" data-cred="${id}" data-flipped="${String(flipped)}">
            <div class="v-cred__inner" data-tilt>
                <div class="v-cred__face v-cred__face--front" aria-hidden="${String(flipped)}">
                    <div class="v-cred__row">
                        <span class="v-cred__issuer">${brandMark({ size: 18 })}klefas.me</span>
                        <span class="v-cred__status"><span class="v-dot" aria-hidden="true"></span>${status}</span>
                    </div>
                    <div class="v-cred__id">
                        <span class="v-cred__sigil">${sigil(fingerprint, { size: 56, label: artLabel })}</span>
                        <span class="v-cred__who">
                            <span class="v-cred__name">${title}</span>
                            <span class="v-cred__role">${subtitle}</span>
                        </span>
                    </div>
                    <div class="v-cred__row v-cred__row--end">
                        <span><span class="t-label">Fingerprint</span><span class="v-cred__fp">${shortHash(fingerprint)}</span></span>
                        <span class="t-label">${since}</span>
                    </div>
                </div>
                <div class="v-cred__face v-cred__face--back" aria-hidden="${String(!flipped)}">
                    <span class="t-label">Records</span>
                    <dl class="v-records">${records.map(([key, value]) => html`<div><dt>${key}</dt><dd>${value}</dd></div>`)}</dl>
                </div>
                <span class="v-cred__sheen" aria-hidden="true"></span>
            </div>
            <div class="v-cred__controls">
                <button type="button" class="btn btn--sm" data-action="v-flip" data-target="${id}" aria-pressed="${String(flipped)}">
                    ${icon("layers", { size: 16 })}<span data-flip-label>${flipped ? "Show front" : "Show records"}</span>
                </button>
                ${copyButton(`0x${fingerprint}`, { label: "Copy fingerprint", key: `v-copy-${id}` })}
            </div>
        </div>
    `;
}

const identityCredential = (ctx) => {
    const { person, identity } = ctx.content;
    return credential(ctx, {
        id: "identity",
        title: person.name,
        subtitle: person.role,
        fingerprint: identity.fingerprint,
        status: "Active",
        since: html`Since ${t(person.since)}`,
        artLabel: "Sigil generated from the klefas.me fingerprint",
        records: [
            ["Domain", person.domain],
            ["GitHub", person.github.replace("https://github.com/", "")],
            ["Email", person.email],
            ["Languages", person.languages.join(", ")],
        ],
    });
};

const traits = (items) =>
    html`<dl class="v-traits">${items.map(([key, value]) => html`<div class="v-traits__item"><dt class="t-label">${key}</dt><dd>${value}</dd></div>`)}</dl>`;

const asset = (ctx, project) => {
    const detail = ctx.href({ page: "project", project: project.id });
    return html`
        <article class="v-asset" aria-labelledby="v-asset-${project.id}">
            <div class="v-asset__media">
                ${sigil(project.fingerprint, { size: 72 })}
                <span class="v-asset__fp">${shortHash(project.fingerprint)}</span>
            </div>
            <div class="v-asset__body">
                <p class="t-label">${project.kind} · ${project.size.value} ${project.size.unit}</p>
                <h3 class="t-h3" id="v-asset-${project.id}"><a class="v-asset__link" href="${detail}">${project.name}</a></h3>
                <p class="t-small">${project.summary}</p>
            </div>
            <div class="v-asset__actions">
                ${externalLink(project.live, "Open live", { className: "btn btn--sm" })}
                <a class="btn btn--ghost btn--sm" href="${detail}" aria-label="Details for ${project.name}">Details ${icon("arrowRight", { size: 16 })}</a>
            </div>
        </article>
    `;
};

const principlesList = (ctx, extra = "") =>
    html`<ul class="v-principles ${extra} list-reset">
        ${ctx.content.principles.map(
            (p) => html`<li>
                <span class="v-principles__icon" aria-hidden="true">${icon("check", { size: 16 })}</span>
                <div><h3 class="v-principles__title">${p.title}</h3><p class="t-small">${p.text}</p></div>
            </li>`,
        )}
    </ul>`;

const channels = (ctx) => {
    const { person } = ctx.content;
    return html`<ul class="v-channels list-reset" aria-label="Contact channels">
        <li class="v-channel">
            <span class="v-channel__icon" aria-hidden="true">${icon("mail")}</span>
            <div><p class="t-label">Email</p><p class="v-channel__value">${person.email}</p></div>
            ${copyButton(person.email, { label: "Copy", key: "v-copy-email" })}
        </li>
        <li class="v-channel">
            <span class="v-channel__icon" aria-hidden="true">${icon("github")}</span>
            <div><p class="t-label">GitHub</p><p class="v-channel__value">${person.github.replace("https://", "")}</p></div>
            ${externalLink(person.github, "Open", { className: "btn btn--ghost btn--sm" })}
        </li>
        <li class="v-channel">
            <span class="v-channel__icon" aria-hidden="true">${icon("key")}</span>
            <div><p class="t-label">Location</p><p class="v-channel__value">${t(person.location)}</p></div>
        </li>
    </ul>`;
};

function home(ctx) {
    const { person, projects } = ctx.content;
    return layout(
        ctx,
        html`
            <section class="v-hero" aria-labelledby="v-title">
                <div class="container v-hero__grid">
                    <div class="v-hero__copy">
                        <p class="v-eyebrow t-label"><span class="v-dot" aria-hidden="true"></span>Identity credential · ${person.domain}</p>
                        <h1 class="t-display v-hero__title" id="v-title">${person.name}</h1>
                        <p class="v-hero__role">${person.role}</p>
                        <p class="t-lead">${person.tagline} ${person.intro}</p>
                        <div class="cluster">
                            <a class="btn btn--primary" href="${ctx.href({ page: "work" })}">Open the developer area ${icon("arrowRight", { size: 16 })}</a>
                            <a class="btn" href="${ctx.href({ page: "contact" })}">Contact</a>
                        </div>
                    </div>
                    ${identityCredential(ctx)}
                </div>
                <div class="container">
                    ${traits([
                        ["Role", person.role],
                        ["Stack", "HTML · CSS · JavaScript"],
                        ["Privacy", "No trackers, no cookies"],
                        ["Languages", person.languages.join(" · ")],
                    ])}
                </div>
            </section>

            <div class="container v-deck">
                <section class="v-panel" style="--i: 0" aria-labelledby="v-about">
                    <div class="v-panel__grid">
                        <div class="v-panel__intro">
                            <p class="t-label">About</p>
                            <h2 class="t-h2" id="v-about">The person behind the name</h2>
                            <p class="t-body muted">${t(person.story)}</p>
                            <a class="v-more" href="${ctx.href({ page: "about" })}">Read the full story ${icon("arrowRight", { size: 16 })}</a>
                        </div>
                        ${principlesList(ctx)}
                    </div>
                </section>

                <section class="v-panel" style="--i: 1" aria-labelledby="v-assets">
                    <div class="v-panel__head">
                        <div class="v-panel__intro">
                            <p class="t-label">Developer area</p>
                            <h2 class="t-h2" id="v-assets">Assets on this domain</h2>
                        </div>
                        <a class="v-more" href="${ctx.href({ page: "work" })}">All projects ${icon("arrowRight", { size: 16 })}</a>
                    </div>
                    <div class="v-assets">${projects.map((project) => asset(ctx, project))}</div>
                </section>

                <section class="v-panel v-panel--accent" style="--i: 2" aria-labelledby="v-channel">
                    <div class="v-panel__grid">
                        <div class="v-panel__intro">
                            <p class="t-label">Contact</p>
                            <h2 class="t-h2" id="v-channel">Open a channel</h2>
                            <p class="t-body">Questions, ideas or a project in mind. Email is the fastest way to reach me.</p>
                        </div>
                        <div class="v-panel__cta">
                            <p class="v-panel__email">${person.email}</p>
                            <div class="cluster">
                                ${copyButton(person.email, { label: "Copy email", className: "btn btn--primary", key: "v-copy-email-home" })}
                                ${externalLink(person.github, "GitHub", { className: "btn" })}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `,
    );
}

function about(ctx) {
    const { person, milestones, skills } = ctx.content;
    return layout(
        ctx,
        html`
            <section class="container v-pagehead" aria-labelledby="v-title">
                <p class="t-label">About</p>
                <h1 class="t-h1" id="v-title">About ${person.name}</h1>
                <p class="t-lead">${person.tagline}</p>
            </section>
            <div class="container v-split">
                <aside class="v-split__aside" aria-label="Identity credential">${identityCredential(ctx)}</aside>
                <div class="v-split__main">
                    <section class="v-block" aria-labelledby="v-story">
                        <h2 class="t-h2" id="v-story">Story</h2>
                        <p class="t-body">${t(person.story)}</p>
                        <p class="t-body muted">Now: ${t(person.now)}</p>
                    </section>
                    <section class="v-block" aria-labelledby="v-principles">
                        <h2 class="t-h2" id="v-principles">Principles</h2>
                        ${principlesList(ctx, "v-principles--wide")}
                    </section>
                    <section class="v-block" aria-labelledby="v-history">
                        <h2 class="t-h2" id="v-history">Milestones</h2>
                        <ol class="v-history list-reset">
                            ${milestones.map(
                                (m) => html`<li>
                                    <span class="v-history__when num">${t(m.when)}</span>
                                    <div><h3 class="v-history__title">${t(m.title)}</h3><p class="t-small">${t(m.text)}</p></div>
                                </li>`,
                            )}
                        </ol>
                    </section>
                    <section class="v-block" aria-labelledby="v-stack">
                        <h2 class="t-h2" id="v-stack">Stack</h2>
                        <ul class="cluster list-reset" aria-label="Skills">${skills.map((skill) => html`<li class="chip">${t(skill)}</li>`)}</ul>
                    </section>
                </div>
            </div>
        `,
    );
}

function work(ctx) {
    const { projects } = ctx.content;
    const list = filtered(ctx, projects);
    return layout(
        ctx,
        html`
            <section class="container v-pagehead" aria-labelledby="v-title">
                <p class="t-label">Developer area</p>
                <h1 class="t-h1" id="v-title">Assets</h1>
                <p class="t-lead">Every project on this domain, with documentation and a live version you can open.</p>
            </section>
            <section class="container v-work" aria-labelledby="v-list">
                <h2 class="sr-only" id="v-list">Projects</h2>
                <div class="v-work__bar">
                    ${filterChips(ctx, FILTERS)}
                    <p class="t-small" aria-live="polite">${list.length} of ${projects.length} projects</p>
                </div>
                <div class="v-assets">${list.map((project) => asset(ctx, project))}</div>
                ${sampleNote()}
            </section>
        `,
    );
}

function project(ctx) {
    const p = projectById(ctx);
    const others = ctx.content.projects.filter((item) => item.id !== p.id);
    return layout(
        ctx,
        html`
            <div class="container">${breadcrumb(ctx, p, { className: "v-crumbs" })}</div>
            <section class="container v-hero__grid v-project" aria-labelledby="v-title">
                <div class="v-hero__copy">
                    <p class="t-label">${p.kind} · Asset ${String(p.index).padStart(3, "0")}</p>
                    <h1 class="t-h1" id="v-title">${p.name}</h1>
                    <p class="t-lead">${p.summary}</p>
                    <div class="cluster">
                        ${externalLink(p.live, "Open live", { className: "btn btn--primary" })}
                        ${externalLink(p.source, "Source code", { className: "btn" })}
                    </div>
                    ${traits([
                        ["Type", p.kind],
                        ["Size", `${p.size.value} ${p.size.unit}`],
                        ["Stack", p.stack.slice(0, 2).join(" · ")],
                        ["Tracking", "None"],
                    ])}
                </div>
                ${credential(ctx, {
                    id: p.id,
                    title: p.name,
                    subtitle: `${p.kind} · ${p.size.value} ${p.size.unit}`,
                    fingerprint: p.fingerprint,
                    status: "Live",
                    since: `klefas.me${p.path}`,
                    artLabel: `Sigil generated from the ${p.name} fingerprint`,
                    records: [
                        ["Live", p.live.replace("https://", "")],
                        ["Source", p.source.replace("https://", "")],
                        ["Type", p.kind],
                        ["Stack", p.stack.join(", ")],
                    ],
                })}
            </section>
            <section class="container v-docs" aria-labelledby="v-docs">
                <h2 class="t-h2" id="v-docs">Documentation</h2>
                ${projectTabs(p, { prefix: "v-doc", className: "v-tabs" })}
            </section>
            <section class="container v-others" aria-labelledby="v-others">
                <h2 class="t-h2" id="v-others">Other assets</h2>
                <div class="v-assets v-assets--two">${others.map((item) => asset(ctx, item))}</div>
            </section>
        `,
    );
}

function contact(ctx) {
    return layout(
        ctx,
        html`
            <section class="container container--narrow v-contact" aria-labelledby="v-title">
                <p class="t-label">Contact</p>
                <h1 class="t-h1" id="v-title">Open a channel</h1>
                <p class="t-lead">Questions, ideas or a project in mind. Email is the fastest way to reach me.</p>
                ${channels(ctx)}
                <p class="sample-note">No forms and no tracking. Nothing is sent until you write to me yourself.</p>
            </section>
        `,
    );
}

const PAGES = { home, about, work, project, contact };

function mount(root, ctx) {
    ctx.on("click", '[data-action="v-flip"]', (event, button) => {
        const id = button.dataset.target;
        const card = root.querySelector(`[data-cred="${id}"]`);
        if (!card) return;
        const flipped = card.dataset.flipped !== "true";
        card.dataset.flipped = String(flipped);
        ctx.state.flipped = { ...ctx.state.flipped, [id]: flipped };
        button.setAttribute("aria-pressed", String(flipped));
        button.querySelector("[data-flip-label]").textContent = flipped ? "Show front" : "Show records";
        card.querySelector(".v-cred__face--front").setAttribute("aria-hidden", String(flipped));
        card.querySelector(".v-cred__face--back").setAttribute("aria-hidden", String(!flipped));
        ctx.announce(flipped ? "Showing the records" : "Showing the front of the card");
    });

    const finePointer = typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (ctx.reducedMotion || !finePointer) return;
    for (const surface of root.querySelectorAll("[data-tilt]")) {
        surface.addEventListener("pointermove", (event) => {
            const box = surface.getBoundingClientRect();
            const x = (event.clientX - box.left) / box.width;
            const y = (event.clientY - box.top) / box.height;
            surface.classList.add("is-tilting");
            surface.style.setProperty("--ry", `${((x - 0.5) * 12).toFixed(2)}deg`);
            surface.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
            surface.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
            surface.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        });
        surface.addEventListener("pointerleave", () => {
            surface.classList.remove("is-tilting");
            surface.style.setProperty("--rx", "0deg");
            surface.style.setProperty("--ry", "0deg");
        });
    }
}

export const vault = {
    id: "vault",
    render: (page, ctx) => PAGES[page](ctx),
    mount,
};
