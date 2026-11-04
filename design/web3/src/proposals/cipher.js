/**
 * Proposal 3 · Cipher (security console).
 *
 * An app shell instead of a brochure: a page tree on the left, the document in
 * the middle, an inspector with the page's metadata on the right and a status
 * bar. A command palette (Ctrl+K or ⌘K) reaches every page and action.
 * Headlines decode from noise on first view, and the contact address is
 * revealed on request.
 */
import { html, raw } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { copyText, scrambleText } from "../core/behaviors.js";
import { sha256, shortHash } from "../core/sha256.js";
import { brandMark, copyButton, externalLink, FILTERS, filterChips, filtered, projectById, projectTabs, sampleNote, skipLink, t, themeToggle } from "../core/ui.js";

const PERM = "-r--r--r--";
const FILES = { home: "index.md", about: "about.md", work: "work/", contact: "contact.md" };

const pathOf = (ctx) => {
    const { page } = ctx.route;
    if (page === "project") return `~/klefas.me/work/${ctx.route.project}.md`;
    return `~/klefas.me/${FILES[page] === "index.md" ? "" : FILES[page]}`;
};

function tree(ctx) {
    const { projects } = ctx.content;
    const current = (page, project) =>
        ctx.route.page === page && (!project || ctx.route.project === project) ? raw('aria-current="page"') : "";
    const item = (page, label, glyph, project) =>
        html`<a class="c-tree__link" href="${ctx.href({ page, project })}" ${current(page, project)}>${icon(glyph, { size: 16 })}<span>${label}</span></a>`;
    return html`
        <nav class="c-tree" aria-label="Pages">
            <p class="c-tree__label">Explorer</p>
            <ul class="c-tree__list list-reset">
                <li>${item("home", "index.md", "file")}</li>
                <li>${item("about", "about.md", "file")}</li>
                <li>
                    ${item("work", "work/", "folder")}
                    <ul class="c-tree__list c-tree__list--nested list-reset">
                        ${projects.map((p) => html`<li>${item("project", `${p.id}.md`, "file", p.id)}</li>`)}
                    </ul>
                </li>
                <li>${item("contact", "contact.md", "file")}</li>
            </ul>
            <p class="c-tree__label">Access</p>
            <p class="c-tree__perm"><span class="c-mono">${PERM}</span> public, read-only</p>
        </nav>
    `;
}

const kv = (rows) => html`<dl class="c-kv">${rows.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>`;

function inspector(ctx) {
    const { person, identity, projects } = ctx.content;
    const { page } = ctx.route;
    let title = "Identity";
    let rows;
    if (page === "project") {
        const p = projectById(ctx);
        title = "File";
        rows = [
            ["Path", html`<span class="c-mono">work/${p.id}.md</span>`],
            ["Type", p.kind],
            ["Size", `${p.size.value} ${p.size.unit}`],
            ["Fingerprint", html`<span class="c-mono">${shortHash(p.fingerprint)}</span>`],
            ["Live", externalLink(p.live, p.path, { className: "c-link" })],
            ["Source", externalLink(p.source, "GitHub", { className: "c-link" })],
        ];
    } else if (page === "work") {
        title = "Directory";
        rows = [
            ["Path", html`<span class="c-mono">work/</span>`],
            ["Entries", String(projects.length)],
            ["Types", "Games, Tools, Apps"],
            ["Open live", String(projects.reduce((sum, p) => sum + p.size.value, 0))],
        ];
    } else if (page === "contact") {
        title = "Channels";
        rows = [
            ["Email", ctx.state.revealed ? person.email : "Encoded"],
            ["GitHub", person.github.replace("https://github.com/", "")],
            ["Location", t(person.location)],
        ];
    } else {
        rows = [
            ["Name", person.name],
            ["Role", person.role],
            ["Domain", person.domain],
            ["Fingerprint", html`<span class="c-mono">${shortHash(identity.fingerprint)}</span>`],
            ["Languages", person.languages.join(", ")],
            ["Privacy", "0 trackers, 0 cookies"],
        ];
    }
    return html`
        <aside class="c-inspector" aria-labelledby="c-inspector-title">
            <h2 class="c-panel-title" id="c-inspector-title">${icon("sliders", { size: 16 })}Inspector · ${title}</h2>
            ${kv(rows)}
            <div class="c-inspector__foot">
                <p class="c-tree__label">Shortcuts</p>
                <p class="c-small"><kbd>Ctrl</kbd> <kbd>K</kbd> commands · <kbd>Esc</kbd> close</p>
            </div>
        </aside>
    `;
}

function palette() {
    return html`
        <dialog class="c-palette" id="c-palette" aria-labelledby="c-palette-title">
            <div class="c-palette__box">
                <h2 class="sr-only" id="c-palette-title">Command palette</h2>
                <div class="c-palette__field">
                    ${icon("search", { size: 16 })}
                    <input id="c-cmd" type="text" role="combobox" aria-controls="c-cmd-list" aria-expanded="true" aria-autocomplete="list" placeholder="Type a command or a page…" autocomplete="off" spellcheck="false" />
                    <kbd>Esc</kbd>
                </div>
                <ul class="c-palette__list list-reset" id="c-cmd-list" role="listbox" aria-label="Commands"></ul>
                <p class="c-palette__hint">↑ ↓ to move · Enter to run · Esc to close</p>
            </div>
        </dialog>
    `;
}

function shell(ctx, body) {
    return html`
        ${skipLink(ctx)}
        <div class="c-app">
            <header class="c-top">
                <a class="c-brand" href="${ctx.href({ page: "home" })}" aria-label="klefas.me, home">${brandMark({ size: 20 })}<span aria-hidden="true">klefas</span></a>
                <p class="c-path c-mono"><span class="sr-only">Current path: </span>${pathOf(ctx)}</p>
                <button type="button" class="c-cmdk" data-action="c-palette" data-key="c-palette" aria-label="Search or run a command (Ctrl K)">
                    ${icon("search", { size: 16 })}<span>Search or run a command</span><kbd>Ctrl K</kbd>
                </button>
                ${themeToggle(ctx)}
            </header>
            ${tree(ctx)}
            <main class="c-main" id="main" tabindex="-1">${body}</main>
            ${inspector(ctx)}
            <footer class="c-status">
                <span><span class="c-led" aria-hidden="true"></span>klefas.me · static</span>
                <span>0 trackers · 0 cookies</span>
                <span class="c-status__end">© 2026 klefas.me · ${PERM}</span>
            </footer>
        </div>
        ${palette()}
    `;
}

const fileHead = (file, meta) => html`<p class="c-file"><span class="c-file__name">${icon("file", { size: 16 })}${file}</span><span class="c-mono c-muted">${meta}</span></p>`;

function home(ctx) {
    const { person, principles } = ctx.content;
    const animate = !ctx.state.booted;
    const lines = ["$ connect klefas.me", "✓ static site · 0 trackers · 0 cookies", "✓ language: auto (pl, en)", "$ whoami"];
    return shell(
        ctx,
        html`
            ${fileHead("index.md", `${PERM} · public`)}
            <section class="c-section c-hero" aria-labelledby="c-title">
                <div role="group" aria-label="Session log"><pre class="c-boot ${animate ? "c-boot--animate" : ""}">${lines.map((line, i) => html`<span class="c-boot__line ${line.startsWith("✓") ? "is-ok" : "is-cmd"}" style="--n: ${i}">${line}</span>`)}</pre></div>
                <h1 class="t-display c-title" id="c-title" aria-label="${person.name}"><span data-scramble="${person.name}" aria-hidden="true">${person.name}</span></h1>
                <p class="c-role">${person.role} <span class="c-cursor" aria-hidden="true"></span></p>
                <p class="c-lead">${person.tagline} ${person.intro}</p>
                <div class="cluster">
                    <a class="btn btn--primary" href="${ctx.href({ page: "work" })}">${icon("folder", { size: 16 })} Open work/</a>
                    <button type="button" class="btn" data-action="c-palette" data-key="c-palette-hero">${icon("terminal", { size: 16 })} Run a command</button>
                </div>
            </section>
            <section class="c-section" aria-labelledby="c-quick">
                <h2 class="c-h2" id="c-quick">Quick access</h2>
                <ul class="c-keys list-reset">
                    <li><a class="c-key" href="${ctx.href({ page: "about" })}"><span class="c-key__cmd">cat about.md</span><span class="c-key__text">Story and principles</span></a></li>
                    <li><a class="c-key" href="${ctx.href({ page: "work" })}"><span class="c-key__cmd">ls work/</span><span class="c-key__text">All projects</span></a></li>
                    <li><a class="c-key" href="${ctx.href({ page: "contact" })}"><span class="c-key__cmd">decode contact</span><span class="c-key__text">Reveal the email address</span></a></li>
                    <li><button type="button" class="c-key" data-action="theme" data-key="c-key-theme"><span class="c-key__cmd">theme --toggle</span><span class="c-key__text">Switch Black and White</span></button></li>
                </ul>
            </section>
            <section class="c-section" aria-labelledby="c-principles">
                <h2 class="c-h2" id="c-principles">Principles</h2>
                <ul class="c-checks list-reset">
                    ${principles.map((p) => html`<li><span class="c-check" aria-hidden="true">[x]</span><span><strong>${p.title}.</strong> ${p.text}</span></li>`)}
                </ul>
            </section>
        `,
    );
}

function about(ctx) {
    const { person, principles, milestones, skills } = ctx.content;
    return shell(
        ctx,
        html`
            ${fileHead("about.md", `${PERM} · ${milestones.length} log entries`)}
            <section class="c-section" aria-labelledby="c-title">
                <h1 class="t-h1 c-title" id="c-title">About ${person.name}</h1>
                <p class="c-lead">${person.tagline}</p>
            </section>
            <section class="c-section" aria-labelledby="c-whoami" id="whoami">
                <h2 class="c-h2" id="c-whoami">whoami</h2>
                <p class="c-text">${t(person.story)}</p>
                <p class="c-text c-muted">Now: ${t(person.now)}</p>
            </section>
            <section class="c-section" aria-labelledby="c-rules" id="rules">
                <h2 class="c-h2" id="c-rules">principles</h2>
                <ul class="c-checks list-reset">${principles.map((p) => html`<li><span class="c-check" aria-hidden="true">[x]</span><span><strong>${p.title}.</strong> ${p.text}</span></li>`)}</ul>
            </section>
            <section class="c-section" aria-labelledby="c-log" id="log">
                <h2 class="c-h2" id="c-log">log</h2>
                <ol class="c-log list-reset">
                    ${milestones.map(
                        (m) => html`<li>
                            <span class="c-log__hash">${sha256(`${m.when} ${m.title}`).slice(0, 7)}</span>
                            <span class="c-log__when">${t(m.when)}</span>
                            <span><strong>${t(m.title)}</strong> <span class="c-muted">${t(m.text)}</span></span>
                        </li>`,
                    )}
                </ol>
            </section>
            <section class="c-section" aria-labelledby="c-stack" id="stack">
                <h2 class="c-h2" id="c-stack">stack</h2>
                <ul class="cluster list-reset" aria-label="Skills">${skills.map((s) => html`<li class="chip">${t(s)}</li>`)}</ul>
            </section>
        `,
    );
}

function work(ctx) {
    const { projects } = ctx.content;
    const list = filtered(ctx, projects);
    return shell(
        ctx,
        html`
            ${fileHead("work/", `drwxr-xr-x · ${projects.length} entries`)}
            <section class="c-section" aria-labelledby="c-title">
                <h1 class="t-h1 c-title" id="c-title">Developer area</h1>
                <p class="c-lead">Every project as a read-only entry: documentation inside, a live version one click away.</p>
            </section>
            <section class="c-section" aria-labelledby="c-registry">
                <h2 class="c-h2" id="c-registry">Registry</h2>
                <div class="c-toolbar">
                    <label class="c-filter">
                        <span class="sr-only">Filter entries by name</span>
                        ${icon("search", { size: 16 })}
                        <input type="search" id="c-filter" placeholder="grep entries…" autocomplete="off" value="${ctx.state.q || ""}" />
                    </label>
                    ${filterChips(ctx, FILTERS)}
                </div>
                <div class="c-table-wrap" role="region" aria-label="Registry, scrolls sideways" tabindex="0">
                    <table class="c-table">
                        <thead><tr><th scope="col">Mode</th><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Size</th><th scope="col">Fingerprint</th><th scope="col"><span class="sr-only">Live version</span></th></tr></thead>
                        <tbody>
                            ${list.map(
                                (p) => html`<tr data-row="${`${p.name} ${p.kind} ${p.id}`.toLowerCase()}">
                                    <td class="c-muted">${PERM}</td>
                                    <td><a class="c-link c-strong" href="${ctx.href({ page: "project", project: p.id })}">${p.id}.md</a> <span class="c-muted">${p.name}</span></td>
                                    <td>${p.kind}</td>
                                    <td class="num">${p.size.value} ${p.size.unit}</td>
                                    <td class="c-muted">${shortHash(p.fingerprint)}</td>
                                    <td>${externalLink(p.live, "Open", { className: "btn btn--sm" })}</td>
                                </tr>`,
                            )}
                        </tbody>
                    </table>
                </div>
                <p class="c-small" aria-live="polite" id="c-count">${list.length} of ${projects.length} entries</p>
                ${sampleNote()}
            </section>
        `,
    );
}

function project(ctx) {
    const p = projectById(ctx);
    return shell(
        ctx,
        html`
            ${fileHead(`work/${p.id}.md`, `${PERM} · ${p.kind.toLowerCase()}`)}
            <nav class="c-crumbs" aria-label="Breadcrumb"><ol class="list-reset"><li><a href="${ctx.href({ page: "work" })}">work</a></li><li aria-current="page">${p.id}.md</li></ol></nav>
            <section class="c-section" aria-labelledby="c-title">
                <h1 class="t-h1 c-title" id="c-title">${p.name}</h1>
                <p class="c-lead">${p.summary}</p>
                <div class="cluster">
                    ${externalLink(p.live, "Open live", { className: "btn btn--primary" })}
                    ${externalLink(p.source, "Source", { className: "btn" })}
                    ${copyButton(`0x${p.fingerprint}`, { label: "Copy fingerprint", key: "c-copy-fp" })}
                </div>
            </section>
            <section class="c-section" aria-labelledby="c-docs">
                <h2 class="c-h2" id="c-docs">docs</h2>
                ${projectTabs(p, { prefix: "c-doc", className: "c-tabs" })}
            </section>
        `,
    );
}

function contact(ctx) {
    const { person } = ctx.content;
    const revealed = Boolean(ctx.state.revealed);
    const masked = person.email.replace(/[^@.]/g, "•");
    return shell(
        ctx,
        html`
            ${fileHead("contact.md", `${PERM} · encoded`)}
            <section class="c-section" aria-labelledby="c-title">
                <h1 class="t-h1 c-title" id="c-title">Contact</h1>
                <p class="c-lead">The address is not written into the page until you decode it, so simple scrapers do not pick it up.</p>
            </section>
            <section class="c-section" aria-labelledby="c-channel">
                <h2 class="c-h2" id="c-channel">channel</h2>
                <div class="c-reveal" data-revealed="${String(revealed)}">
                    <p class="c-reveal__label c-tree__label">Email</p>
                    <p class="c-reveal__value" id="c-email" data-email="${revealed ? person.email : ""}">${revealed ? person.email : masked}</p>
                    <div class="cluster">
                        ${revealed
                            ? copyButton(person.email, { label: "Copy address", className: "btn btn--primary", key: "c-copy-email" })
                            : html`<button type="button" class="btn btn--primary" data-action="c-reveal" data-key="c-reveal">${icon("key", { size: 16 })} Decode address</button>`}
                        ${externalLink(person.github, "GitHub", { className: "btn" })}
                    </div>
                    <pre class="c-reveal__log" aria-live="polite">${revealed ? "→ decoding address … done\n✓ ready to copy" : "→ waiting"}</pre>
                </div>
            </section>
        `,
    );
}

const PAGES = { home, about, work, project, contact };

function commandList(ctx) {
    const { projects, person } = ctx.content;
    const next = ctx.route.theme === "dark" ? "White" : "Black";
    return [
        { group: "Go to", label: "Home · index.md", run: () => (location.hash = ctx.href({ page: "home" }).slice(1)) },
        { group: "Go to", label: "About · about.md", run: () => (location.hash = ctx.href({ page: "about" }).slice(1)) },
        { group: "Go to", label: "Developer area · work/", run: () => (location.hash = ctx.href({ page: "work" }).slice(1)) },
        { group: "Go to", label: "Contact · contact.md", run: () => (location.hash = ctx.href({ page: "contact" }).slice(1)) },
        ...projects.map((p) => ({ group: "Projects", label: `Open ${p.name}`, run: () => (location.hash = ctx.href({ page: "project", project: p.id }).slice(1)) })),
        { group: "Actions", label: `Switch to ${next} theme`, run: () => ctx.setTheme(ctx.route.theme === "dark" ? "light" : "dark") },
        { group: "Actions", label: "Copy email address", run: async () => ctx.announce((await copyText(person.email)) ? "Email copied" : "Copy failed") },
    ];
}

function mountPalette(root, ctx) {
    const dialog = root.querySelector("#c-palette");
    const input = root.querySelector("#c-cmd");
    const list = root.querySelector("#c-cmd-list");
    if (!dialog || !input || !list || typeof dialog.showModal !== "function") return;
    const commands = commandList(ctx);
    let matches = commands;
    let active = 0;

    const paint = () => {
        let lastGroup = "";
        list.innerHTML = matches.length
            ? matches
                  .map((c, i) => {
                      const group = c.group !== lastGroup ? `<li class="c-palette__group" role="presentation">${c.group}</li>` : "";
                      lastGroup = c.group;
                      return `${group}<li role="option" class="c-palette__item" id="c-cmd-${i}" aria-selected="${i === active}" data-index="${i}">${c.label}</li>`;
                  })
                  .join("")
            : '<li class="c-palette__empty" role="option" aria-disabled="true" aria-selected="false">No matching command</li>';
        if (matches.length) input.setAttribute("aria-activedescendant", `c-cmd-${active}`);
        else input.removeAttribute("aria-activedescendant");
        list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    };
    const filter = () => {
        const q = input.value.trim().toLowerCase();
        matches = q ? commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q)) : commands;
        active = 0;
        paint();
    };
    const open = () => {
        if (dialog.open) return;
        input.value = "";
        filter();
        dialog.showModal();
        input.focus();
    };
    const run = (index) => {
        const command = matches[index];
        if (!command) return;
        dialog.close();
        command.run();
    };

    input.addEventListener("input", filter);
    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!matches.length) return;
            active = (active + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
            paint();
        } else if (event.key === "Enter") {
            event.preventDefault();
            run(active);
        }
    });
    list.addEventListener("click", (event) => {
        const item = event.target.closest("[data-index]");
        if (item) run(Number(item.dataset.index));
    });
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });

    ctx.on("click", '[data-action="c-palette"]', open);
    const shortcut = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            if (dialog.open) dialog.close();
            else open();
        }
    };
    document.addEventListener("keydown", shortcut);
    ctx.cleanup(() => document.removeEventListener("keydown", shortcut));
}

function mount(root, ctx) {
    mountPalette(root, ctx);

    if (!ctx.state.booted) {
        ctx.state.booted = true;
        const target = root.querySelector("[data-scramble]");
        if (target) ctx.cleanup(scrambleText(target, target.dataset.scramble, { duration: 1100 }));
    }

    const filterInput = root.querySelector("#c-filter");
    if (filterInput) {
        const apply = () => {
            const q = filterInput.value.trim().toLowerCase();
            ctx.state.q = filterInput.value;
            const rows = root.querySelectorAll("[data-row]");
            let shown = 0;
            rows.forEach((row) => {
                row.hidden = Boolean(q) && !row.dataset.row.includes(q);
                if (!row.hidden) shown += 1;
            });
            const count = root.querySelector("#c-count");
            if (count) count.textContent = `${shown} of ${ctx.content.projects.length} entries`;
        };
        filterInput.addEventListener("input", apply);
        apply();
    }

    ctx.on("click", '[data-action="c-reveal"]', () => {
        const { email } = ctx.content.person;
        const value = root.querySelector("#c-email");
        const log = root.querySelector(".c-reveal__log");
        if (log) log.textContent = "→ decoding address …";
        const finish = () => ctx.set({ revealed: true });
        if (ctx.reducedMotion || !value) return finish();
        scrambleText(value, email, { duration: 900 });
        setTimeout(finish, 950);
    });
}

export const cipher = {
    id: "cipher",
    render: (page, ctx) => PAGES[page](ctx),
    mount,
};
