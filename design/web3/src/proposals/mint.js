/**
 * Proposal 4 · Mint (token collection).
 *
 * Projects are presented as a collection of tokens. Each one gets generative
 * artwork seeded by its own SHA-256 fingerprint (Truchet arcs, offset rings or
 * a mirrored mosaic), an edition number and a sheet of traits. The home page
 * opens on a horizontal rail of tokens; every project has a token page.
 * "Shuffle preview" shows other variations; the default returns on reload.
 */
import { html } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { tokenArt } from "../core/art.js";
import { sha256, shortHash } from "../core/sha256.js";
import { brand, breadcrumb, copyButton, externalLink, FILTERS, filterChips, filtered, navLinks, projectById, projectTabs, sampleNote, skipLink, t, themeToggle } from "../core/ui.js";

const edition = (p, total) => html`<span class="m-edition"><span>#${String(p.index).padStart(3, "0")}</span><span class="m-edition__total">/${String(total).padStart(3, "0")}</span></span>`;

const art = (ctx, hex, label) => tokenArt(hex, { theme: ctx.route.theme, nonce: ctx.state.nonce || 0, label });

const header = (ctx) => html`
    ${skipLink(ctx)}
    <header class="m-header">
        <div class="container m-header__inner">
            ${brand(ctx)}
            <nav class="m-nav" aria-label="Primary"><ul class="m-nav__list list-reset">${navLinks(ctx, { className: "m-nav__link" })}</ul></nav>
            <span class="m-count">${ctx.content.projects.length} tokens</span>
            ${themeToggle(ctx)}
        </div>
    </header>
`;

const footer = () => html`
    <footer class="m-footer">
        <div class="container m-footer__inner">
            <p>© 2026 klefas.me · All rights to the content reserved</p>
            <p>Artwork is generated from SHA-256 fingerprints, in your browser.</p>
        </div>
    </footer>
`;

const layout = (ctx, body) => html`${header(ctx)}<main id="main" tabindex="-1">${body}</main>${footer()}`;

function card(ctx, p, { headingLevel = 3 } = {}) {
    const total = ctx.content.projects.length;
    const href = ctx.href({ page: "project", project: p.id });
    const heading = headingLevel === 2
        ? html`<h2 class="m-card__title" id="m-tok-${p.id}"><a href="${href}">${p.name}</a></h2>`
        : html`<h3 class="m-card__title" id="m-tok-${p.id}"><a href="${href}">${p.name}</a></h3>`;
    return html`
        <article class="m-card" aria-labelledby="m-tok-${p.id}">
            <div class="m-card__art">${art(ctx, p.fingerprint)}</div>
            <div class="m-card__body">
                <p class="m-card__meta">${edition(p, total)}<span class="m-card__fp">${shortHash(p.fingerprint, 4, 4)}</span></p>
                ${heading}
                <ul class="m-traits list-reset" aria-label="Traits">
                    <li>${p.kind}</li>
                    <li>${p.size.value} ${p.size.unit}</li>
                </ul>
                <div class="m-card__foot">${externalLink(p.live, "Open live", { className: "m-link" })}</div>
            </div>
        </article>
    `;
}

const shuffleButton = (ctx) =>
    html`<button type="button" class="btn btn--sm" data-action="m-shuffle" data-key="m-shuffle">${icon("shuffle", { size: 16 })} Shuffle preview</button>`;

function home(ctx) {
    const { person, projects, principles } = ctx.content;
    const total = projects.reduce((sum, p) => sum + p.size.value, 0);
    return layout(
        ctx,
        html`
            <section class="container m-hero" aria-labelledby="m-title">
                <p class="t-label">Collection by ${person.name} · ${person.role}</p>
                <h1 class="t-display m-hero__title" id="m-title">${person.name} <span>collects small, honest things for the web.</span></h1>
                <dl class="m-stats">
                    <div><dt>Tokens</dt><dd class="num">${String(projects.length).padStart(2, "0")}</dd></div>
                    <div><dt>Things to open live</dt><dd class="num">${total}</dd></div>
                    <div><dt>Trackers</dt><dd class="num">0</dd></div>
                </dl>
            </section>

            <section class="m-rail-wrap" aria-labelledby="m-rail-title">
                <div class="container m-rail__head">
                    <div class="m-rail__intro">
                        <h2 class="t-h2" id="m-rail-title">The collection</h2>
                        <p class="t-small">Each artwork is drawn from the project's own fingerprint.</p>
                    </div>
                    <div class="cluster">
                        ${shuffleButton(ctx)}
                        <button type="button" class="m-arrow" data-action="m-scroll" data-dir="-1" aria-label="Previous token">${icon("arrowLeft", { size: 18 })}</button>
                        <button type="button" class="m-arrow" data-action="m-scroll" data-dir="1" aria-label="Next token">${icon("arrowRight", { size: 18 })}</button>
                    </div>
                </div>
                <div class="m-rail" role="region" aria-label="Collection, scrolls sideways" tabindex="0" data-rail>
                    <ul class="m-rail__list list-reset">${projects.map((p) => html`<li class="m-rail__item">${card(ctx, p)}</li>`)}</ul>
                </div>
            </section>

            <section class="container m-split" aria-labelledby="m-about-title">
                <div class="m-split__lead">
                    <p class="t-label">About the collector</p>
                    <h2 class="t-h2" id="m-about-title">Made by one person, documented like a product</h2>
                    <p class="t-body muted">${t(person.story)}</p>
                    <a class="m-link" href="${ctx.href({ page: "about" })}">Read the story ${icon("arrowRight", { size: 16 })}</a>
                </div>
                <ul class="m-principles list-reset">
                    ${principles.map(
                        (p) => html`<li>
                            <span class="m-principles__art" aria-hidden="true">${art(ctx, sha256(p.id))}</span>
                            <div><h3 class="m-principles__title">${p.title}</h3><p class="t-small">${p.text}</p></div>
                        </li>`,
                    )}
                </ul>
            </section>

            <section class="container m-contact" aria-labelledby="m-contact-title">
                <h2 class="t-label" id="m-contact-title">Contact</h2>
                <p class="m-mail">${person.email}</p>
                <div class="cluster">
                    ${copyButton(person.email, { label: "Copy email", className: "btn btn--primary", key: "m-copy-email-home" })}
                    ${externalLink(person.github, "GitHub", { className: "btn" })}
                </div>
            </section>
        `,
    );
}

function about(ctx) {
    const { person, principles, milestones, skills } = ctx.content;
    return layout(
        ctx,
        html`
            <section class="container m-pagehead" aria-labelledby="m-title">
                <p class="t-label">About the collector</p>
                <h1 class="t-display m-pagehead__title" id="m-title">About ${person.name}</h1>
                <p class="t-lead">${person.tagline}</p>
            </section>
            <section class="container m-split" aria-labelledby="m-story-title">
                <div class="m-split__lead">
                    <h2 class="t-h2" id="m-story-title">Story</h2>
                    <p class="t-body">${t(person.story)}</p>
                    <p class="t-body muted">Now: ${t(person.now)}</p>
                </div>
                <ul class="m-principles list-reset">
                    ${principles.map(
                        (p) => html`<li>
                            <span class="m-principles__art" aria-hidden="true">${art(ctx, sha256(p.id))}</span>
                            <div><h3 class="m-principles__title">${p.title}</h3><p class="t-small">${p.text}</p></div>
                        </li>`,
                    )}
                </ul>
            </section>
            <section class="container m-provenance" aria-labelledby="m-prov-title">
                <h2 class="t-h2" id="m-prov-title">Provenance</h2>
                <ol class="m-prov list-reset">
                    ${milestones.map(
                        (m) => html`<li>
                            <span class="m-prov__art" aria-hidden="true">${art(ctx, sha256(m.title + m.when))}</span>
                            <span class="m-prov__when num">${t(m.when)}</span>
                            <div><h3 class="m-prov__title">${t(m.title)}</h3><p class="t-small">${t(m.text)}</p></div>
                        </li>`,
                    )}
                </ol>
            </section>
            <section class="container m-provenance m-provenance--last" aria-labelledby="m-stack-title">
                <h2 class="t-h2" id="m-stack-title">Stack</h2>
                <ul class="m-traits m-traits--lg list-reset" aria-label="Skills">${skills.map((s) => html`<li>${t(s)}</li>`)}</ul>
            </section>
        `,
    );
}

function work(ctx) {
    const { projects } = ctx.content;
    const list = filtered(ctx, projects);
    return layout(
        ctx,
        html`
            <section class="container m-pagehead" aria-labelledby="m-title">
                <p class="t-label">Developer area · ${projects.length} tokens</p>
                <h1 class="t-display m-pagehead__title" id="m-title">The collection</h1>
                <p class="t-lead">Every project as a token: artwork, traits, documentation and a live version.</p>
            </section>
            <section class="container m-gallery" aria-labelledby="m-gallery-title">
                <h2 class="sr-only" id="m-gallery-title">Tokens</h2>
                <div class="m-gallery__bar">
                    ${filterChips(ctx, FILTERS)}
                    <div class="cluster"><p class="t-small" aria-live="polite">${list.length} of ${projects.length}</p>${shuffleButton(ctx)}</div>
                </div>
                <ul class="m-grid list-reset">${list.map((p) => html`<li>${card(ctx, p)}</li>`)}</ul>
                ${sampleNote("Artwork is generated from each project's SHA-256 fingerprint. Everything in [brackets] is a placeholder.")}
            </section>
        `,
    );
}

function project(ctx) {
    const p = projectById(ctx);
    const { projects } = ctx.content;
    const others = projects.filter((item) => item.id !== p.id);
    const trait = (label, value) => html`<div class="m-trait"><dt>${label}</dt><dd>${value}</dd></div>`;
    return layout(
        ctx,
        html`
            <div class="container">${breadcrumb(ctx, p, { className: "m-crumbs" })}</div>
            <div class="container m-tokenpage">
                <div class="m-tokenpage__art">
                    <div class="m-tokenpage__frame">${art(ctx, p.fingerprint, `Generative artwork for ${p.name}`)}</div>
                    <div class="cluster">${shuffleButton(ctx)}<span class="t-small">${shortHash(p.fingerprint)}</span></div>
                </div>
                <div class="m-tokenpage__info">
                    <section class="m-tokenpage__head" aria-labelledby="m-title">
                        <p class="t-label">Token ${edition(p, projects.length)}</p>
                        <h1 class="t-h1" id="m-title">${p.name}</h1>
                        <p class="t-lead">${p.summary}</p>
                        <div class="cluster">
                            ${externalLink(p.live, "Open live", { className: "btn btn--primary" })}
                            ${externalLink(p.source, "Source", { className: "btn" })}
                        </div>
                    </section>
                    <section aria-labelledby="m-traits-title">
                        <h2 class="t-h3" id="m-traits-title">Traits</h2>
                        <dl class="m-traitgrid">
                            ${trait("Type", p.kind)}
                            ${trait("Size", `${p.size.value} ${p.size.unit}`)}
                            ${trait("Stack", p.stack.slice(0, 2).join(", "))}
                            ${trait("Tracking", "None")}
                        </dl>
                    </section>
                    <section aria-labelledby="m-docs-title">
                        <h2 class="t-h3" id="m-docs-title">Documentation</h2>
                        ${projectTabs(p, { prefix: "m-doc", className: "m-tabs" })}
                    </section>
                    <section aria-labelledby="m-history-title">
                        <h2 class="t-h3" id="m-history-title">Provenance</h2>
                        <ol class="m-history list-reset">
                            <li><span>Published</span><span class="m-history__value">klefas.me${p.path}</span></li>
                            <li><span>Source</span><span class="m-history__value">${externalLink(p.source, p.source.replace("https://", ""), { className: "m-link" })}</span></li>
                            <li><span>Created</span><span class="m-history__value">${t("[Year]")}</span></li>
                        </ol>
                    </section>
                </div>
            </div>
            <section class="container m-more" aria-labelledby="m-more-title">
                <h2 class="t-h2" id="m-more-title">More from the collection</h2>
                <ul class="m-grid m-grid--two list-reset">${others.map((o) => html`<li>${card(ctx, o)}</li>`)}</ul>
            </section>
        `,
    );
}

function contact(ctx) {
    const { person } = ctx.content;
    return layout(
        ctx,
        html`
            <section class="container m-pagehead m-pagehead--contact" aria-labelledby="m-title">
                <p class="t-label">Contact</p>
                <h1 class="t-display m-pagehead__title" id="m-title">Say hello</h1>
                <p class="m-mail">${person.email}</p>
                <div class="cluster">
                    ${copyButton(person.email, { label: "Copy email", className: "btn btn--primary", key: "m-copy-email" })}
                    ${externalLink(person.github, "GitHub", { className: "btn" })}
                </div>
                <dl class="m-traitgrid m-traitgrid--three">
                    <div class="m-trait"><dt>Location</dt><dd>${t(person.location)}</dd></div>
                    <div class="m-trait"><dt>Languages</dt><dd>${person.languages.join(", ")}</dd></div>
                    <div class="m-trait"><dt>Tracking</dt><dd>None</dd></div>
                </dl>
            </section>
        `,
    );
}

const PAGES = { home, about, work, project, contact };

function mount(root, ctx) {
    ctx.on("click", '[data-action="m-shuffle"]', () => {
        ctx.set({ nonce: (ctx.state.nonce || 0) + 1 });
        ctx.announce("Artwork shuffled");
    });
    ctx.on("click", '[data-action="m-scroll"]', (event, button) => {
        const rail = root.querySelector("[data-rail]");
        const item = rail?.querySelector(".m-rail__item");
        if (!rail || !item) return;
        const gap = Number.parseFloat(getComputedStyle(rail.firstElementChild).columnGap) || 0;
        rail.scrollBy({ left: Number(button.dataset.dir) * (item.offsetWidth + gap), behavior: ctx.reducedMotion ? "auto" : "smooth" });
    });
}

export const mint = {
    id: "mint",
    render: (page, ctx) => PAGES[page](ctx),
    mount,
};
