import { html } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { proposalMeta, SHARED_RULES } from "../data/proposals.js";
import { schematic } from "./schematics.js";

const open = (ctx, id, theme, page = "home") => ctx.hrefFor({ view: "site", proposal: id, theme, page });

export function renderOverview(ctx) {
    return html`
        <main id="main" class="xv" tabindex="-1">
            <section class="container xv__intro">
                <p class="t-label">klefas.me · design direction</p>
                <h1 class="t-h1">Five directions for klefas.me</h1>
                <p class="t-lead">
                    Each proposal takes the language of Web3, tokenization and security in a different direction. Same content,
                    same pages, same spacing; only the design changes. Open any of them in Black or White, then compare them side by side.
                </p>
                <div class="cluster">
                    <a class="btn btn--primary" href="#compare">${icon("sliders")}Compare all five</a>
                    <a class="btn" href="${open(ctx, "vault", "dark")}">Start with proposal 1</a>
                </div>
            </section>

            <section class="container xv__grid" aria-labelledby="xv-proposals">
                <h2 class="sr-only" id="xv-proposals">Proposals</h2>
                ${proposalMeta.map(
                    (p) => html`
                        <article class="xv-card" aria-labelledby="xv-${p.id}">
                            <div class="xv-card__thumb">${schematic(p.id)}</div>
                            <div class="xv-card__body">
                                <p class="t-label">Proposal ${p.number} · ${p.kind}</p>
                                <h3 class="t-h3" id="xv-${p.id}">${p.name}</h3>
                                <p class="xv-card__concept">${p.concept}</p>
                                <ul class="xv-card__tags list-reset" aria-label="Inspired by">
                                    ${p.inspiredBy.map((tag) => html`<li class="chip">${tag}</li>`)}
                                </ul>
                                <p class="xv-card__signature"><span class="t-label">Signature</span> ${p.signature}</p>
                            </div>
                            <div class="xv-card__actions">
                                <a class="btn btn--primary btn--sm" href="${open(ctx, p.id, "dark")}" aria-label="Open ${p.name} in the Black theme">Black</a>
                                <a class="btn btn--sm" href="${open(ctx, p.id, "light")}" aria-label="Open ${p.name} in the White theme">White</a>
                                <a class="btn btn--ghost btn--sm" href="${open(ctx, p.id, ctx.route.theme, "map")}" aria-label="Site map of ${p.name}">Site map</a>
                            </div>
                        </article>
                    `,
                )}
            </section>

            <section class="container xv__rules" aria-labelledby="xv-rules">
                <h2 class="t-h2" id="xv-rules">What stays the same in all five</h2>
                <ol class="xv-rules list-reset">
                    ${SHARED_RULES.map((rule, i) => html`<li><span class="xv-rules__n num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><p>${rule}</p></li>`)}
                </ol>
            </section>
        </main>
    `;
}
