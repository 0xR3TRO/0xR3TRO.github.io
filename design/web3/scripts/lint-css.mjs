#!/usr/bin/env node
/**
 * Design-token lint. Outside tokens.css and the generated palette file:
 *   - spacing (margin, padding, gap, scroll-*) must use var(--space-*) or layout tokens
 *   - font-size must use var(--text-*)
 *   - border-radius must use var(--radius-*) (or 50% for circles)
 *   - colours must come from palette variables: no hex, rgb(), hsl(), oklch() or named colours
 * This keeps distances, sizes and colours identical across all five proposals.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const STYLES = fileURLToPath(new URL("../src/styles", import.meta.url));
const EXEMPT = new Set(["tokens.css", "palettes.generated.css", "index.css"]);

const SPACING = /^(margin|padding|gap|row-gap|column-gap|scroll-padding|scroll-margin)(-[a-z-]+)?$/;
const UNIT = /(?<![\w-])-?\d*\.?\d+(px|rem|em|vw|vh|vmin|vmax|ch|ex|%)/;
const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(|\b(white|black|red|green|blue|gray|grey)\b/i;

const stripFunctions = (value) => value.replace(/var\([^()]*(\([^()]*\)[^()]*)*\)/g, "").replace(/env\([^()]*\)/g, "");

export function lintCss(css, file) {
    const problems = [];
    const text = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
    const declaration = /([a-z-]+)\s*:\s*([^;{}]+);/g;
    for (let match = declaration.exec(text); match; match = declaration.exec(text)) {
        const [, property, value] = match;
        const line = text.slice(0, match.index).split("\n").length;
        const where = `${file}:${line}`;
        const bare = stripFunctions(value);
        if (!property.startsWith("--") && SPACING.test(property) && UNIT.test(bare) && !/^\s*0\s*$/.test(bare)) {
            problems.push(`${where}  ${property}: ${value.trim()}  -> use a --space-* or layout token`);
        }
        if (property === "font-size" && UNIT.test(bare)) problems.push(`${where}  font-size: ${value.trim()}  -> use a --text-* token`);
        if (/radius$/.test(property) && UNIT.test(bare.replace(/(^|\s)50%/, ""))) {
            problems.push(`${where}  ${property}: ${value.trim()}  -> use a --radius-* token`);
        }
        if (COLOR_LITERAL.test(value.replace(/var\([^)]*\)/g, ""))) problems.push(`${where}  ${property}: ${value.trim()}  -> use a palette variable`);
    }
    return problems;
}

async function main() {
    const files = (await readdir(STYLES)).filter((name) => name.endsWith(".css") && !EXEMPT.has(name));
    const problems = [];
    for (const name of files) problems.push(...lintCss(await readFile(join(STYLES, name), "utf8"), `src/styles/${name}`));
    if (problems.length) {
        console.error(`Design-token lint: ${problems.length} problem(s)\n${problems.join("\n")}`);
        process.exit(1);
    }
    console.log(`Design-token lint: ${files.length} files clean.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
