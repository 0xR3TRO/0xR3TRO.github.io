import { html, raw } from "../core/dom.js";
import { icon } from "../core/icons.js";
import { COMPARE_ROWS, proposalMeta } from "../data/proposals.js";

const STORAGE_KEY = "klefas-web3-pick";

function readPick() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function writePick(pick) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pick));
    } catch {
        /* storage blocked: the choice still works for this visit */
    }
}

const cell = (value) =>
    Array.isArray(value) ? html`<ul class="xm__list">${value.map((item) => html`<li>${item}</li>`)}</ul>` : html`<p>${value}</p>`;

export function renderCompare(ctx) {
    const pick = ctx.state.pick ?? readPick();
    ctx.state.pick = pick;
    const chosen = proposalMeta.find((p) => p.id === pick.id);
    const theme = pick.theme || "dark";
    const summary = chosen ? `klefas.me direction: Proposal ${chosen.number} ${chosen.name} (${chosen.kind}), ${theme === "dark" ? "Black" : "White"} theme.` : "";

    return html`
        <main id="main" class="xv" tabindex="-1">
            <section class="container xv__intro">
                <p class="t-label">klefas.me · decision</p>
                <h1 class="t-h1">Compare the five proposals</h1>
                <p class="t-lead">Every proposal is described with the same criteria. Pick the one you want to build, then copy the decision.</p>
            </section>

            <section class="container" aria-labelledby="xm-title">
                <h2 class="sr-only" id="xm-title">Comparison matrix</h2>
                <div class="xm" role="region" aria-label="Comparison matrix, scrolls sideways" tabindex="0">
                    <table class="xm__table">
                        <thead>
                            <tr>
                                <th scope="col" class="xm__corner"><span class="sr-only">Criterion</span></th>
                                ${proposalMeta.map(
                                    (p) => html`
                                        <th scope="col" class="${pick.id === p.id ? "is-picked" : ""}">
                                            <span class="t-label">Proposal ${p.number}</span>
                                            <span class="xm__name">${p.name}</span>
                                            <span class="xm__open">
                                                <a href="${ctx.hrefFor({ view: "site", proposal: p.id, theme: "dark", page: "home" })}">Black</a>
                                                <a href="${ctx.hrefFor({ view: "site", proposal: p.id, theme: "light", page: "home" })}">White</a>
                                            </span>
                                        </th>
                                    `,
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            ${COMPARE_ROWS.map(
                                ([key, label]) => html`
                                    <tr>
                                        <th scope="row">${label}</th>
                                        ${proposalMeta.map((p) => html`<td class="${pick.id === p.id ? "is-picked" : ""}">${cell(p[key])}</td>`)}
                                    </tr>
                                `,
                            )}
                            <tr>
                                <th scope="row">Your pick</th>
                                ${proposalMeta.map(
                                    (p) => html`
                                        <td class="${pick.id === p.id ? "is-picked" : ""}">
                                            <button type="button" class="btn btn--sm ${pick.id === p.id ? "btn--primary" : ""}" data-action="pick" data-value="${p.id}" data-key="pick-${p.id}" aria-pressed="${String(pick.id === p.id)}">
                                                ${pick.id === p.id ? raw(`${icon("check", { size: 16 })} Picked`) : "Pick this"}
                                            </button>
                                        </td>
                                    `,
                                )}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="container xv__decision" aria-labelledby="xd-title">
                <h2 class="t-h2" id="xd-title">Your decision</h2>
                ${chosen
                    ? html`
                          <div class="xd">
                              <p class="xd__summary">${summary}</p>
                              <div class="cluster" role="group" aria-label="Theme for the chosen proposal">
                                  <span class="t-label">Theme</span>
                                  <button type="button" class="chip-toggle" data-action="pick-theme" data-value="dark" data-key="pick-dark" aria-pressed="${String(theme === "dark")}">Black</button>
                                  <button type="button" class="chip-toggle" data-action="pick-theme" data-value="light" data-key="pick-light" aria-pressed="${String(theme === "light")}">White</button>
                              </div>
                              <div class="cluster">
                                  <button type="button" class="btn btn--primary" data-action="copy" data-copy="${summary}" data-key="copy-decision">${icon("copy", { size: 16 })}<span data-copy-label>Copy decision</span></button>
                                  <a class="btn" href="${ctx.hrefFor({ view: "site", proposal: chosen.id, theme, page: "home" })}">Open ${chosen.name}</a>
                              </div>
                          </div>
                      `
                    : html`<p class="t-lead">Nothing picked yet. Use “Pick this” in the last row of the table.</p>`}
            </section>
        </main>
    `;
}

export function mountCompare(root, ctx) {
    ctx.on("click", '[data-action="pick"]', (event, button) => {
        const pick = { ...ctx.state.pick, id: button.dataset.value };
        writePick(pick);
        ctx.set({ pick });
        ctx.announce(`Picked ${button.dataset.value}`);
    });
    ctx.on("click", '[data-action="pick-theme"]', (event, button) => {
        const pick = { ...ctx.state.pick, theme: button.dataset.value };
        writePick(pick);
        ctx.set({ pick });
    });
}
