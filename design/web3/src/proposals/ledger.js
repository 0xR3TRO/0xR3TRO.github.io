/**
 * Proposal 2 · Ledger (block explorer).
 *
 * Every page is a chain of blocks. Each block carries its height, its size in
 * bytes, a real SHA-256 hash of (parent hash + content) and a pointer to its
 * parent. "Verify chain" recomputes the hashes in the browser; "Simulate
 * tampering" edits one block so the visitor can watch the chain break.
 * The header search works like an explorer search box (press / to focus).
 */
import { html, raw, sleep } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { sha256, shortHash } from "../core/sha256.js";
import { brand, breadcrumb, copyButton, externalLink, FILTERS, filterChips, filtered, navLinks, projectById, projectTabs, sampleNote, skipLink, t, themeToggle } from "../core/ui.js";

const GENESIS = "0".repeat(64);
const bytes = (text) => new TextEncoder().encode(text).length;
const height = (n) => `#${String(n).padStart(4, "0")}`;

/** Link blocks into a chain: hash = SHA-256(parent + "\n" + payload). */
function linkChain(blocks) {
    let parent = GENESIS;
    return blocks.map((block, index) => {
        const hash = sha256(`${parent}\n${block.payload}`);
        const linked = { ...block, height: index, parent, hash, size: bytes(block.payload) };
        parent = hash;
        return linked;
    });
}

const header = (ctx) => html`
    ${skipLink(ctx)}
    <header class="l-header">
        <div class="container l-header__inner">
            ${brand(ctx)}
            <nav class="l-nav" aria-label="Primary"><ul class="l-nav__list list-reset">${navLinks(ctx, { className: "l-nav__link" })}</ul></nav>
            <form class="l-search" role="search" data-search>
                <label class="sr-only" for="l-q">Search pages, projects or fingerprints</label>
                <span class="l-search__icon" aria-hidden="true">${icon("search", { size: 16 })}</span>
                <input id="l-q" class="l-search__input" type="search" placeholder="Search pages, projects or 0x…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="l-suggest" aria-autocomplete="list" />
                <kbd class="l-search__kbd" aria-hidden="true">/</kbd>
                <ul class="l-suggest list-reset" id="l-suggest" role="listbox" aria-label="Suggestions" hidden></ul>
            </form>
            ${themeToggle(ctx)}
        </div>
        <div class="l-strip">
            <div class="container l-strip__inner">
                <span><span class="l-led" aria-hidden="true"></span>klefas.me</span>
                <span>Address ${shortHash(ctx.content.identity.fingerprint)}</span>
                <span>${ctx.content.projects.length} projects</span>
                <span>0 trackers · 0 cookies</span>
                <span>Static site</span>
            </div>
        </div>
    </header>
`;

const footer = (ctx) => html`
    <footer class="l-footer">
        <div class="container l-footer__inner">
            <p>© 2026 klefas.me · All rights to the content reserved</p>
            <p class="l-mono">Genesis ${shortHash(GENESIS)} · hashes are SHA-256</p>
        </div>
    </footer>
`;

const layout = (ctx, body) => html`${header(ctx)}<main id="main" tabindex="-1">${body}</main>${footer(ctx)}`;

const txRow = ({ hash, title, text, href, meta }) => html`
    <li class="l-tx">
        <span class="l-tx__hash">${shortHash(hash, 6, 4)}</span>
        <span class="l-tx__main">${href ? html`<a class="l-tx__title" href="${href}">${title}</a>` : html`<span class="l-tx__title">${title}</span>`}<span class="l-tx__text">${t(text)}</span></span>
        <span class="l-tx__meta">${meta || ""}</span>
    </li>
`;

/** One block. `level` keeps the heading outline correct on every page. */
function block(b, { level = 3, state = "idle" } = {}) {
    const H = `h${level}`;
    const stateLabel = { ok: "Verified", bad: "Invalid", skipped: "Not checked", checking: "Checking", pending: "Waiting", idle: "" }[state];
    return html`
        <li class="l-block" data-state="${state}" id="block-${b.key}">
            <div class="l-block__head">
                <span class="l-height">${height(b.height)}</span>
                ${raw(`<${H} class="l-block__title">`)}${b.title}${raw(`</${H}>`)}
                <span class="l-block__meta">${b.size} bytes${stateLabel ? html` · <span class="l-block__state">${stateLabel}</span>` : ""}</span>
            </div>
            <div class="l-block__body">${b.body}</div>
            <dl class="l-block__foot">
                <div><dt>Hash</dt><dd>${shortHash(b.hash, 10, 8)}</dd></div>
                <div><dt>Parent</dt><dd>${b.height === 0 ? "Genesis" : shortHash(b.parent, 10, 8)}</dd></div>
            </dl>
        </li>
    `;
}

function homeBlocks(ctx) {
    const { person, principles, projects } = ctx.content;
    const tampered = Boolean(ctx.state.tamper);
    return linkChain([
        {
            key: "identity",
            title: "Identity",
            payload: `${person.name}|${person.role}|${person.domain}`,
            body: html`<dl class="l-mini">
                <div><dt>Name</dt><dd>${person.name}</dd></div>
                <div><dt>Role</dt><dd>${person.role}</dd></div>
                <div><dt>Domain</dt><dd>${person.domain}</dd></div>
            </dl>`,
        },
        {
            key: "about",
            title: "About",
            payload: [person.story, ...principles.map((p) => p.title)].join("|"),
            body: html`<p class="t-body">${t(person.story)}${tampered ? html` <mark class="l-edit">(edited)</mark>` : ""}</p>
                <ul class="l-txs list-reset">${principles.map((p) => txRow({ hash: sha256(p.title), title: p.title, text: p.text }))}</ul>
                <a class="l-more" href="${ctx.href({ page: "about" })}">Open the About chain ${icon("arrowRight", { size: 16 })}</a>`,
        },
        {
            key: "work",
            title: "Developer area",
            payload: projects.map((p) => `${p.id}:${p.fingerprint}`).join("|"),
            body: html`<ul class="l-txs list-reset">${projects.map((p) =>
                txRow({ hash: p.fingerprint, title: p.name, text: p.summary, href: ctx.href({ page: "project", project: p.id }), meta: html`<span class="l-method">${p.kind}</span>` }),
            )}</ul>
                <a class="l-more" href="${ctx.href({ page: "work" })}">All transactions ${icon("arrowRight", { size: 16 })}</a>`,
        },
        {
            key: "contact",
            title: "Contact",
            payload: `${person.email}|${person.github}`,
            body: html`<div class="l-contact-row">
                <span class="l-mono">${person.email}</span>
                ${copyButton(person.email, { label: "Copy", key: "l-copy-email-home" })}
                ${externalLink(person.github, "GitHub", { className: "btn btn--ghost btn--sm" })}
            </div>`,
        },
    ]);
}

function verifyStatus(ctx, blocks) {
    const v = ctx.state.verify;
    if (!v) return html`${icon("shield", { size: 16 })} Not verified yet`;
    if (v.phase === "running") return html`<span class="l-spin" aria-hidden="true"></span> Verifying block ${height(v.step ?? 0)}…`;
    if (v.invalidAt >= 0) {
        const why = v.reason === "link" ? "its parent hash does not match" : "its content hash does not match";
        return html`<span class="l-bad">${icon("cross", { size: 16 })} Chain broken at block ${height(v.invalidAt)}: ${why}</span>`;
    }
    return html`<span class="l-ok">${icon("check", { size: 16 })} Chain valid: ${blocks.length} of ${blocks.length} blocks verified</span>`;
}

function home(ctx) {
    const { person, projects, identity } = ctx.content;
    const blocks = homeBlocks(ctx);
    const results = ctx.state.verify?.results || [];
    const running = ctx.state.verify?.phase === "running";
    return layout(
        ctx,
        html`
            <section class="container l-hero" aria-labelledby="l-title">
                <div class="l-hero__copy">
                    <p class="t-label">Address · ${person.domain}</p>
                    <h1 class="t-display l-hero__title" id="l-title">${person.name}</h1>
                    <p class="l-hero__role">${person.role}</p>
                    <p class="t-lead">${person.tagline} ${person.intro}</p>
                    <div class="cluster">
                        <a class="btn btn--primary" href="${ctx.href({ page: "work" })}">Browse transactions ${icon("arrowRight", { size: 16 })}</a>
                        <a class="btn" href="${ctx.href({ page: "contact" })}">Contact</a>
                    </div>
                </div>
                <dl class="l-overview" aria-label="Overview">
                    <div><dt>Address</dt><dd class="l-overview__addr">${shortHash(identity.fingerprint, 8, 6)} ${copyButton(`0x${identity.fingerprint}`, { label: "Copy", key: "l-copy-address" })}</dd></div>
                    <div><dt>Status</dt><dd><span class="l-status">${icon("check", { size: 14 })} Online</span></dd></div>
                    <div><dt>Projects</dt><dd class="num">${projects.length}</dd></div>
                    <div><dt>Things to open live</dt><dd class="num">${projects.reduce((sum, p) => sum + p.size.value, 0)}</dd></div>
                    <div><dt>Trackers</dt><dd class="num">0</dd></div>
                    <div><dt>Languages</dt><dd>${person.languages.join(", ")}</dd></div>
                </dl>
            </section>

            <section class="container l-chain-wrap" aria-labelledby="l-chain-title">
                <div class="l-chain__head">
                    <div class="l-chain__intro">
                        <p class="t-label">Chain · ${blocks.length} blocks</p>
                        <h2 class="t-h2" id="l-chain-title">This page as a chain of blocks</h2>
                        <p class="t-small">Each block's hash covers its content and its parent's hash. Change one block and every check after it fails.</p>
                    </div>
                    <div class="l-verify">
                        <p class="l-verify__status" aria-live="polite">${verifyStatus(ctx, blocks)}</p>
                        <div class="cluster">
                            <label class="l-switch">
                                <input type="checkbox" role="switch" data-action="l-tamper" data-key="l-tamper" ${ctx.state.tamper ? raw("checked") : ""} ${running ? raw("disabled") : ""} />
                                <span>Simulate tampering</span>
                            </label>
                            <button type="button" class="btn btn--primary" data-action="l-verify" data-key="l-verify" ${running ? raw("disabled") : ""}>${icon("shield", { size: 16 })} Verify chain</button>
                        </div>
                    </div>
                </div>
                <ol class="l-chain list-reset">${blocks.map((b, i) => block(b, { level: 3, state: results[i] || "idle" }))}</ol>
                ${sampleNote("Hashes are computed in your browser with SHA-256. Tampering only changes this page view.")}
            </section>
        `,
    );
}

function about(ctx) {
    const { person, principles, milestones, skills } = ctx.content;
    const blocks = linkChain([
        { key: "story", title: "Story", payload: `${person.story}|${person.now}`, body: html`<p class="t-body">${t(person.story)}</p><p class="t-small">Now: ${t(person.now)}</p>` },
        { key: "principles", title: "Principles", payload: principles.map((p) => p.title).join("|"), body: html`<ul class="l-txs list-reset">${principles.map((p) => txRow({ hash: sha256(p.title), title: p.title, text: p.text }))}</ul>` },
        { key: "milestones", title: "Milestones", payload: milestones.map((m) => m.title).join("|"), body: html`<ul class="l-txs list-reset">${milestones.map((m) => txRow({ hash: sha256(m.title + m.when), title: m.title, text: m.text, meta: html`<span class="l-method num">${t(m.when)}</span>` }))}</ul>` },
        { key: "stack", title: "Stack", payload: skills.join("|"), body: html`<ul class="cluster list-reset" aria-label="Skills">${skills.map((s) => html`<li class="chip">${t(s)}</li>`)}</ul>` },
    ]);
    return layout(
        ctx,
        html`
            <section class="container l-pagehead" aria-labelledby="l-title">
                <p class="t-label">About · ${blocks.length} blocks</p>
                <h1 class="t-h1" id="l-title">About ${person.name}</h1>
                <p class="t-lead">${person.tagline}</p>
            </section>
            <div class="container l-chain-wrap">
                <ol class="l-chain list-reset">${blocks.map((b) => block(b, { level: 2 }))}</ol>
            </div>
        `,
    );
}

function work(ctx) {
    const { projects } = ctx.content;
    const sort = ctx.state.sort || { key: "index", dir: "asc" };
    const list = filtered(ctx, projects).slice().sort((a, b) => {
        const value = (p) => (sort.key === "size" ? p.size.value : sort.key === "index" ? p.index : String(p[sort.key]).toLowerCase());
        const order = value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0;
        return sort.dir === "asc" ? order : -order;
    });
    const th = (key, label) => {
        const active = sort.key === key;
        const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
        return html`<th scope="col" aria-sort="${ariaSort}"><button type="button" class="l-sort" data-action="l-sort" data-value="${key}" data-key="l-sort-${key}">${label}${icon("chevronDown", { size: 14 })}</button></th>`;
    };
    return layout(
        ctx,
        html`
            <section class="container l-pagehead" aria-labelledby="l-title">
                <p class="t-label">Developer area · ${projects.length} transactions</p>
                <h1 class="t-h1" id="l-title">Transactions</h1>
                <p class="t-lead">Every project is a transaction from klefas.me to its own address, with documentation and a live version.</p>
            </section>
            <section class="container l-work" aria-labelledby="l-table-title">
                <h2 class="sr-only" id="l-table-title">All projects</h2>
                <div class="l-toolbar">
                    ${filterChips(ctx, FILTERS)}
                    <p class="t-small" aria-live="polite">Showing ${list.length} of ${projects.length}</p>
                </div>
                <div class="l-table-wrap" role="region" aria-label="Projects table, scrolls sideways" tabindex="0">
                    <table class="l-table">
                        <thead>
                            <tr>
                                <th scope="col">Tx hash</th>
                                ${th("name", "Name")}
                                ${th("kind", "Type")}
                                ${th("size", "Size")}
                                <th scope="col">Status</th>
                                <th scope="col"><span class="sr-only">Live version</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map(
                                (p) => html`
                                    <tr>
                                        <td><a class="l-mono l-link" href="${ctx.href({ page: "project", project: p.id })}" aria-label="Transaction ${shortHash(p.fingerprint)} for ${p.name}">${shortHash(p.fingerprint)}</a></td>
                                        <td><a class="l-link l-table__name" href="${ctx.href({ page: "project", project: p.id })}">${p.name}</a></td>
                                        <td><span class="l-method">${p.kind}</span></td>
                                        <td class="num">${p.size.value} <span class="muted">${p.size.unit}</span></td>
                                        <td><span class="l-status">${icon("check", { size: 14 })} Live</span></td>
                                        <td>${externalLink(p.live, "Open", { className: "btn btn--sm" })}</td>
                                    </tr>
                                `,
                            )}
                        </tbody>
                    </table>
                </div>
                ${sampleNote()}
            </section>
        `,
    );
}

function project(ctx) {
    const p = projectById(ctx);
    const others = ctx.content.projects.filter((item) => item.id !== p.id);
    const row = (label, value) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`;
    return layout(
        ctx,
        html`
            <div class="container">${breadcrumb(ctx, p, { className: "l-crumbs" })}</div>
            <section class="container l-pagehead l-pagehead--project" aria-labelledby="l-title">
                <p class="t-label">Transaction · ${shortHash(p.fingerprint)}</p>
                <h1 class="t-h1" id="l-title">${p.name}</h1>
                <div class="cluster">
                    <span class="l-status">${icon("check", { size: 14 })} Live</span>
                    <span class="l-method">${p.kind}</span>
                    ${externalLink(p.live, "Open live", { className: "btn btn--primary btn--sm" })}
                    ${externalLink(p.source, "Source", { className: "btn btn--sm" })}
                </div>
            </section>
            <section class="container l-detail" aria-labelledby="l-overview-title">
                <h2 class="t-h3" id="l-overview-title">Overview</h2>
                <dl class="l-kv">
                    ${row("Transaction hash", html`<span class="l-mono l-break">0x${p.fingerprint}</span> ${copyButton(`0x${p.fingerprint}`, { label: "Copy", key: "l-copy-tx" })}`)}
                    ${row("Status", html`<span class="l-status">${icon("check", { size: 14 })} Live</span>`)}
                    ${row("Block", html`<span class="l-mono">${height(2)}</span> <span class="muted">Developer area</span>`)}
                    ${row("From", html`<span class="l-mono">klefas.me</span>`)}
                    ${row("To", externalLink(p.live, p.live.replace("https://", ""), { className: "l-link l-mono" }))}
                    ${row("Value", html`<span class="num">${p.size.value}</span> ${p.size.unit}`)}
                    ${row("Stack", html`<ul class="cluster list-reset" aria-label="Technologies">${p.stack.map((s) => html`<li class="chip">${s}</li>`)}</ul>`)}
                    ${row("Input data", html`<span class="l-mono l-input">${p.summary}</span>`)}
                </dl>
            </section>
            <section class="container l-detail" aria-labelledby="l-docs-title">
                <h2 class="t-h3" id="l-docs-title">Documentation</h2>
                ${projectTabs(p, { prefix: "l-doc", className: "l-tabs" })}
            </section>
            <section class="container l-detail l-detail--last" aria-labelledby="l-others-title">
                <h2 class="t-h3" id="l-others-title">Other transactions</h2>
                <ul class="l-txs l-txs--boxed list-reset">${others.map((o) =>
                    txRow({ hash: o.fingerprint, title: o.name, text: o.summary, href: ctx.href({ page: "project", project: o.id }), meta: html`<span class="l-method">${o.kind}</span>` }),
                )}</ul>
            </section>
        `,
    );
}

function contact(ctx) {
    const { person } = ctx.content;
    const row = (label, value) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`;
    return layout(
        ctx,
        html`
            <section class="container l-pagehead" aria-labelledby="l-title">
                <p class="t-label">Contact</p>
                <h1 class="t-h1" id="l-title">Send a message</h1>
                <p class="t-lead">Questions, ideas or a project in mind. Email is the fastest way to reach me.</p>
            </section>
            <section class="container l-detail l-detail--last" aria-labelledby="l-channels-title">
                <h2 class="t-h3" id="l-channels-title">Channels</h2>
                <dl class="l-kv">
                    ${row("Email", html`<span class="l-mono">${person.email}</span> ${copyButton(person.email, { label: "Copy", key: "l-copy-email" })}`)}
                    ${row("GitHub", externalLink(person.github, person.github.replace("https://", ""), { className: "l-link l-mono" }))}
                    ${row("Location", t(person.location))}
                    ${row("Languages", person.languages.join(", "))}
                    ${row("Fee", "Free. Replies come by email.")}
                </dl>
                <p class="sample-note">No forms and no tracking. Nothing is sent until you write to me yourself.</p>
            </section>
        `,
    );
}

const PAGES = { home, about, work, project, contact };

/** Explorer-style search: combobox with a listbox of pages and projects. */
function mountSearch(root, ctx) {
    const input = root.querySelector("#l-q");
    const list = root.querySelector("#l-suggest");
    if (!input || !list) return;
    const { projects, identity } = ctx.content;
    const items = [
        { label: "Home", hint: "Page", href: ctx.href({ page: "home" }), keys: "home start identity" },
        { label: "About", hint: "Page", href: ctx.href({ page: "about" }), keys: "about story principles milestones" },
        { label: "Developer area", hint: "Page", href: ctx.href({ page: "work" }), keys: "work developer projects transactions" },
        { label: "Contact", hint: "Page", href: ctx.href({ page: "contact" }), keys: "contact email github message" },
        { label: "klefas.me", hint: shortHash(identity.fingerprint), href: ctx.href({ page: "home" }), keys: identity.fingerprint },
        ...projects.map((p) => ({ label: p.name, hint: `${p.kind} · ${shortHash(p.fingerprint)}`, href: ctx.href({ page: "project", project: p.id }), keys: `${p.kind} ${p.fingerprint} ${p.summary}` })),
    ];
    let active = -1;
    let matches = [];

    const close = () => {
        list.hidden = true;
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-activedescendant");
        active = -1;
    };
    const paint = () => {
        list.innerHTML = matches.length
            ? matches.map((m, i) => `<li role="option" id="l-opt-${i}" class="l-suggest__item" aria-selected="${i === active}" data-href="${m.href}"><span>${m.label}</span><span class="l-suggest__hint">${m.hint}</span></li>`).join("")
            : '<li class="l-suggest__empty" role="option" aria-disabled="true" aria-selected="false">No matches</li>';
        list.hidden = false;
        input.setAttribute("aria-expanded", "true");
        if (active >= 0) input.setAttribute("aria-activedescendant", `l-opt-${active}`);
        else input.removeAttribute("aria-activedescendant");
    };
    const update = () => {
        const q = input.value.trim().toLowerCase().replace(/^0x/, "");
        if (!q) return close();
        matches = items.filter((item) => `${item.label} ${item.keys}`.toLowerCase().includes(q)).slice(0, 6);
        active = matches.length ? 0 : -1;
        paint();
    };
    const go = (index) => {
        const target = matches[index];
        if (!target) return;
        close();
        location.hash = target.href.slice(1);
    };

    input.addEventListener("input", update);
    input.addEventListener("focus", update);
    input.addEventListener("blur", () => setTimeout(close, 120));
    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (!matches.length) return;
            event.preventDefault();
            active = (active + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
            paint();
        } else if (event.key === "Enter") {
            event.preventDefault();
            go(active < 0 ? 0 : active);
        } else if (event.key === "Escape") {
            input.value = "";
            close();
        }
    });
    list.addEventListener("mousedown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => {
        const option = event.target.closest("[data-href]");
        if (option) go(Number(option.id.replace("l-opt-", "")));
    });
    root.querySelector("[data-search]").addEventListener("submit", (event) => {
        event.preventDefault();
        go(active < 0 ? 0 : active);
    });

    const slash = (event) => {
        const typing = /input|textarea|select/i.test(document.activeElement?.tagName || "");
        if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            input.focus();
        }
    };
    document.addEventListener("keydown", slash);
    ctx.cleanup(() => document.removeEventListener("keydown", slash));
}

async function verifyChain(ctx) {
    const session = ctx.session;
    const blocks = homeBlocks({ ...ctx, state: { ...ctx.state, tamper: false } });
    const tampered = Boolean(ctx.state.tamper);
    const results = blocks.map(() => "pending");
    let previous = GENESIS;
    for (let i = 0; i < blocks.length; i += 1) {
        if (!ctx.isCurrent(session)) return;
        results[i] = "checking";
        ctx.set({ verify: { phase: "running", step: i, results: [...results], invalidAt: -1 } });
        await sleep(ctx.reducedMotion ? 0 : 340);
        if (!ctx.isCurrent(session)) return;
        const payload = blocks[i].payload + (tampered && i === 1 ? " (edited)" : "");
        const recomputed = sha256(`${blocks[i].parent}\n${payload}`);
        const linkOk = blocks[i].parent === previous;
        const contentOk = recomputed === blocks[i].hash;
        previous = recomputed;
        if (!linkOk || !contentOk) {
            results[i] = "bad";
            for (let j = i + 1; j < blocks.length; j += 1) results[j] = "skipped";
            ctx.set({ verify: { phase: "done", results, invalidAt: i, reason: contentOk ? "link" : "content" } });
            ctx.announce(`Chain broken at block ${height(i)}`);
            return;
        }
        results[i] = "ok";
    }
    ctx.set({ verify: { phase: "done", results, invalidAt: -1 } });
    ctx.announce("Chain valid. Every block verified.");
}

function mount(root, ctx) {
    mountSearch(root, ctx);
    ctx.on("click", '[data-action="l-verify"]', () => verifyChain(ctx));
    ctx.on("change", '[data-action="l-tamper"]', (event, input) => ctx.set({ tamper: input.checked, verify: null }));
    ctx.on("click", '[data-action="l-sort"]', (event, button) => {
        const key = button.dataset.value;
        const current = ctx.state.sort || { key: "index", dir: "asc" };
        ctx.set({ sort: { key, dir: current.key === key && current.dir === "asc" ? "desc" : "asc" } });
    });
}

export const ledger = {
    id: "ledger",
    render: (page, ctx) => PAGES[page](ctx),
    mount,
};
