#!/usr/bin/env node
/**
 * End-to-end checks over every view of the built explorer (dist/web3-explorer.html).
 * Requires Playwright with a Chromium build available on the machine.
 *
 *   node tests/e2e/run.mjs                  all views, desktop and phone
 *   node tests/e2e/run.mjs --only ledger    one proposal (plus overview/compare)
 *   node tests/e2e/run.mjs --shots <dir>    also save screenshots of each home page
 *
 * For every view: no console errors, one <main>, exactly one <h1>, no skipped
 * heading levels, no unique-ID clashes, named buttons and links, no horizontal
 * overflow, and an axe-core scan (WCAG 2 A/AA) with no serious or critical issues.
 */
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const URL_BASE = pathToFileURL(join(ROOT, "dist/web3-explorer.html")).href;
const AXE = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const shots = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
const skipAxe = args.includes("--no-axe");

const PROPOSALS = ["vault", "ledger", "cipher", "mint", "protocol"].filter((p) => !only || p === only);
const PAGES = ["home", "about", "work", "project-arcade", "project-budgetly", "contact", "map"];
const VIEWPORTS = [
    { name: "desktop", width: 1280, height: 900 },
    { name: "phone", width: 390, height: 844 },
];

const hashes = ["overview", "compare"];
for (const p of PROPOSALS) for (const theme of ["dark", "light"]) for (const page of PAGES) hashes.push(`${p}-${theme}-${page}`);

const browser = await chromium.launch();
const failures = [];
let checked = 0;

for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => message.type() === "error" && errors.push(`console: ${message.text()}`));

    for (const hash of hashes) {
        errors.length = 0;
        await page.goto(`${URL_BASE}#${hash}`);
        await page.reload();
        await page.waitForTimeout(150);
        const where = `${viewport.name} #${hash}`;

        const report = await page.evaluate(() => {
            const stage = document.querySelector("#stage");
            const headings = [...stage.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => Number(h.tagName[1]));
            const skips = [];
            headings.reduce((prev, level) => {
                if (level > prev + 1) skips.push(`h${prev}→h${level}`);
                return level;
            }, 1);
            const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
            const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
            const unnamed = [...document.querySelectorAll("button, a[href]")]
                .filter((el) => el.offsetParent !== null || el.getClientRects().length)
                .filter((el) => !(el.getAttribute("aria-label") || el.textContent.trim() || el.getAttribute("title")))
                .map((el) => el.outerHTML.slice(0, 80));
            return {
                mains: stage.querySelectorAll("main").length,
                h1: headings.filter((l) => l === 1).length,
                skips,
                dupes,
                unnamed,
                overflow: document.documentElement.scrollWidth - window.innerWidth,
            };
        });

        if (errors.length) failures.push(`${where}: ${errors.join(" | ")}`);
        if (report.mains !== 1) failures.push(`${where}: ${report.mains} <main> elements`);
        if (report.h1 !== 1) failures.push(`${where}: ${report.h1} <h1> elements`);
        if (report.skips.length) failures.push(`${where}: skipped heading levels ${report.skips.join(", ")}`);
        if (report.dupes.length) failures.push(`${where}: duplicate ids ${report.dupes.join(", ")}`);
        if (report.unnamed.length) failures.push(`${where}: unnamed controls ${report.unnamed.join(" ; ")}`);
        if (report.overflow > 1) failures.push(`${where}: horizontal overflow of ${report.overflow}px`);

        if (!skipAxe && viewport.name === "desktop") {
            await page.addScriptTag({ content: AXE });
            const violations = await page.evaluate(async () => {
                const result = await window.axe.run(document, {
                    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
                    resultTypes: ["violations"],
                });
                return result.violations
                    .filter((v) => v.impact === "serious" || v.impact === "critical")
                    .map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" / ")}`);
            });
            if (violations.length) failures.push(`${where}: axe ${violations.join(" | ")}`);
        }

        if (shots && (hash.endsWith("-home") || hash === "overview" || hash === "compare")) {
            await page.screenshot({ path: join(shots, `${viewport.name}-${hash}.png`), fullPage: viewport.name === "phone" });
        }
        checked += 1;
    }
    await page.close();
}

/** Behaviour checks: each signature interaction must actually work. */
async function interactions() {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const open = async (hash) => {
        await page.goto(`${URL_BASE}#${hash}`);
        await page.reload();
        await page.waitForTimeout(150);
    };
    const expect = (ok, message) => ok || failures.push(`interaction: ${message}`);

    if (!only || only === "vault") {
        await open("vault-dark-home");
        await page.click('[data-action="v-flip"]');
        expect((await page.getAttribute('[data-cred="identity"]', "data-flipped")) === "true", "Vault card does not flip");
    }
    if (!only || only === "ledger") {
        await open("ledger-dark-home");
        await page.click('[data-action="l-verify"]');
        await page.waitForFunction(() => /Chain valid/.test(document.querySelector(".l-verify__status")?.textContent || ""), null, { timeout: 5000 }).catch(() => {});
        expect(/Chain valid/.test(await page.textContent(".l-verify__status")), "Ledger verify does not report a valid chain");
        await page.click('[data-action="l-tamper"]');
        await page.click('[data-action="l-verify"]');
        await page.waitForFunction(() => /broken/.test(document.querySelector(".l-verify__status")?.textContent || ""), null, { timeout: 5000 }).catch(() => {});
        expect(/broken at block #0001/.test(await page.textContent(".l-verify__status")), "Ledger tamper test does not break the chain at #0001");
        await page.fill("#l-q", "lab");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(150);
        expect(page.url().endsWith("#ledger-dark-project-lab"), `Ledger search did not open the Lab project (${page.url()})`);
        await open("ledger-dark-work");
        await page.click('[data-action="l-sort"][data-value="size"]');
        expect((await page.getAttribute('th:has([data-value="size"])', "aria-sort")) === "ascending", "Ledger sort does not set aria-sort");
    }
    if (!only || only === "cipher") {
        await open("cipher-dark-work");
        await page.fill("#c-filter", "bud");
        expect((await page.locator("tr[data-row]:visible").count()) === 1, "Cipher filter does not narrow the registry");
        await page.keyboard.press("Control+k");
        expect(await page.evaluate(() => document.querySelector("#c-palette")?.open), "Cipher palette does not open on Ctrl+K");
        await page.keyboard.type("about");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(150);
        expect(page.url().endsWith("#cipher-dark-about"), `Cipher palette did not run the command (${page.url()})`);
        await open("cipher-dark-contact");
        await page.click('[data-action="c-reveal"]');
        await page.waitForTimeout(1300);
        expect((await page.textContent("#c-email")).includes("kontakt@klefas.me"), "Cipher does not reveal the email");
    }
    if (!only || only === "mint") {
        await open("mint-dark-work");
        const before = await page.innerHTML(".m-grid");
        await page.click('[data-action="m-shuffle"]');
        expect(before !== (await page.innerHTML(".m-grid")), "Mint shuffle does not change the artwork");
    }
    if (!only || only === "protocol") {
        await open("protocol-light-about");
        await page.evaluate(() => document.querySelector("#s-1-3").scrollIntoView());
        await page.waitForTimeout(300);
        expect((await page.getAttribute('[data-toc="s-1-3"]', "aria-current")) === "location", "Protocol index does not follow the scroll");
        await open("protocol-light-project-lab");
        await page.focus('[role="tab"][aria-selected="true"]');
        await page.keyboard.press("ArrowRight");
        expect((await page.getAttribute("#p-doc-tab-docs", "aria-selected")) === "true", "Tabs do not respond to the arrow keys");
    }
    await open("compare");
    await page.click('[data-action="pick"][data-value="ledger"]');
    expect(/Proposal 2 Ledger/.test(await page.textContent(".xd__summary")), "Compare pick does not produce a decision");
    await open(`${only || "vault"}-dark-map`);
    await page.waitForTimeout(200);
    expect((await page.locator(".smap__lines path").count()) === 7, "Site map does not draw its 7 connections");

    if (errors.length) failures.push(`interaction errors: ${errors.join(" | ")}`);
    await page.close();
}

await interactions();
await browser.close();
if (failures.length) {
    console.error(`E2E: ${failures.length} problem(s) in ${checked} views\n${failures.join("\n")}`);
    process.exit(1);
}
console.log(`E2E: ${checked} views clean (${VIEWPORTS.map((v) => v.name).join(", ")}).`);
