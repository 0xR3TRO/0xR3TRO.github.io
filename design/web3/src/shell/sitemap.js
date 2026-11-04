import { $, $$, html } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { proposalMeta } from "../data/proposals.js";

const node = (ctx, { page, project, title, path, text, root = false }) => html`
    <a class="smap__node ${root ? "smap__node--root" : ""}" href="${ctx.href({ page, project })}" data-node="${project ? `project-${project}` : root ? "root" : page}">
        <span class="smap__path">${path}</span>
        <span class="smap__title">${title}</span>
        <span class="smap__text">${text}</span>
    </a>
`;

export function renderSitemap(ctx) {
    const meta = proposalMeta.find((p) => p.id === ctx.route.proposal);
    const { projects } = ctx.content;
    return html`
        <main id="main" class="smap" tabindex="-1">
            <div class="container">
                <header class="smap__head">
                    <p class="t-label">Site map · Proposal ${meta.number} ${meta.name} · ${ctx.route.theme === "dark" ? "Black" : "White"}</p>
                    <h1 class="t-h1">Every page, one click away</h1>
                    <p class="t-lead">
                        The root sends visitors to Polish or English based on their browser language, so there is no language switch.
                        The personal pages sit at the root; the developer area is its own branch with a page per project.
                    </p>
                </header>
                <div class="smap__tree" data-sitemap>
                    <svg class="smap__lines" aria-hidden="true" focusable="false"></svg>
                    <div class="smap__col">
                        ${node(ctx, { page: "home", title: "klefas.me", path: "/", text: "Language picked from the browser: /pl/ or /en/.", root: true })}
                    </div>
                    <div class="smap__col">
                        ${node(ctx, { page: "home", title: "Home", path: "/en/", text: "Name, role and the way into everything else." })}
                        ${node(ctx, { page: "about", title: "About", path: "/en/about", text: "Story, principles and milestones." })}
                        ${node(ctx, { page: "work", title: "Developer area", path: "/en/work", text: "All projects, filterable by type." })}
                        ${node(ctx, { page: "contact", title: "Contact", path: "/en/contact", text: "Email and GitHub." })}
                    </div>
                    <div class="smap__col" data-children>
                        ${projects.map((p) => node(ctx, { page: "project", project: p.id, title: p.name, path: `/en/work/${p.id}`, text: `${p.size.value} ${p.size.unit}. Docs, stack, live version.` }))}
                    </div>
                </div>
                <p class="smap__legend">${icon("arrowRight", { size: 16 })} Paths show the planned English URLs. Polish mirrors them under /pl/.</p>
            </div>
        </main>
    `;
}

function drawLines(root) {
    const tree = $("[data-sitemap]", root);
    const svg = tree && $(".smap__lines", tree);
    if (!svg || getComputedStyle(svg).display === "none") return;
    const box = tree.getBoundingClientRect();
    const point = (el, side) => {
        const b = el.getBoundingClientRect();
        return [(side === "right" ? b.right : b.left) - box.left, b.top + b.height / 2 - box.top];
    };
    const find = (id) => $(`[data-node="${id}"]`, tree);
    const links = ["home", "about", "work", "contact"].map((id) => [find("root"), find(id)]);
    for (const child of $$("[data-children] .smap__node", tree)) links.push([find("work"), child]);
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = links
        .filter(([a, b]) => a && b)
        .map(([a, b]) => {
            const [x1, y1] = point(a, "right");
            const [x2, y2] = point(b, "left");
            const mid = (x1 + x2) / 2;
            return `<path d="M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}"/>`;
        })
        .join("");
}

export function mountSitemap(root, ctx) {
    const redraw = () => drawLines(root);
    requestAnimationFrame(redraw);
    window.addEventListener("resize", redraw);
    ctx.cleanup(() => window.removeEventListener("resize", redraw));
}
