#!/usr/bin/env node
/**
 * Build the explorer into one self-contained HTML file (fonts, CSS and JS inlined),
 * so it opens straight from disk with no server.
 *
 *   node scripts/build.mjs                    write dist/web3-explorer.html
 *   node scripts/build.mjs --check            fail if generated files are out of date
 *   node scripts/build.mjs --artifact <file>  body-only variant for a Claude artifact
 */
import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPalettes, paletteCss } from "./palettes.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const REPO = resolve(ROOT, "../..");
const TARGETS = ["chrome105", "edge105", "firefox110", "safari16"];
const PALETTE_CSS = join(ROOT, "src/styles/palettes.generated.css");
const DIST = join(ROOT, "dist/web3-explorer.html");
const FONTS = [
    ["Inter", "100 900", "inter-100-900-latin.woff2"],
    ["JetBrains Mono", "100 800", "jetbrains-mono-100-800-latin.woff2"],
];

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const artifactIndex = args.indexOf("--artifact");
const artifactPath = artifactIndex >= 0 ? args[artifactIndex + 1] : null;

async function fontFaces() {
    const faces = await Promise.all(
        FONTS.map(async ([family, weight, file]) => {
            const data = (await readFile(join(REPO, "fonts", file))).toString("base64");
            return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${data}) format("woff2")}`;
        }),
    );
    return faces.join("\n");
}

async function bundle() {
    const common = { bundle: true, write: false, target: TARGETS, charset: "utf8", legalComments: "none" };
    const [js, css] = await Promise.all([
        build({ ...common, entryPoints: [join(ROOT, "src/main.js")], format: "iife" }),
        build({ ...common, entryPoints: [join(ROOT, "src/styles/index.css")] }),
    ]);
    return { js: js.outputFiles[0].text, css: css.outputFiles[0].text };
}

/** Inline-safe script text: never let the bundle close its own <script> element. */
const safeScript = (js) => js.replace(/<\/(script)/gi, "<\\/$1");

async function render() {
    const template = await readFile(join(ROOT, "src/index.html"), "utf8");
    const [{ js, css }, fonts] = await Promise.all([bundle(), fontFaces()]);
    const full = template
        .replace("/*@fonts*/", () => fonts)
        .replace("/*@styles*/", () => css)
        .replace("/*@script*/", () => safeScript(js));
    const title = template.match(/<title>(.*?)<\/title>/)[1];
    const artifact = [
        `<title>${title}</title>`,
        '<meta name="claude:viewport-fit-sides" content="cover">',
        `<style>${fonts}\n${css}</style>`,
        '<div id="app"></div>',
        `<script>${safeScript(js)}</script>`,
        "",
    ].join("\n");
    return { full, artifact };
}

async function main() {
    const css = paletteCss(await loadPalettes());
    const currentCss = await readFile(PALETTE_CSS, "utf8").catch(() => "");
    if (checkOnly && currentCss !== css) {
        console.error("palettes.generated.css is out of date. Run: npm run build");
        process.exit(1);
    }
    if (!checkOnly && currentCss !== css) await writeFile(PALETTE_CSS, css);

    const { full, artifact } = await render();
    if (checkOnly) {
        const current = await readFile(DIST, "utf8").catch(() => "");
        if (current !== full) {
            console.error("dist/web3-explorer.html is out of date. Run: npm run build");
            process.exit(1);
        }
        console.log("Generated files are up to date.");
        return;
    }
    await mkdir(dirname(DIST), { recursive: true });
    await writeFile(DIST, full);
    console.log(`Wrote ${DIST} (${Math.round(full.length / 1024)} KB)`);
    if (artifactPath) {
        await mkdir(dirname(resolve(artifactPath)), { recursive: true });
        await writeFile(artifactPath, artifact);
        console.log(`Wrote ${artifactPath} (${Math.round(artifact.length / 1024)} KB)`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
