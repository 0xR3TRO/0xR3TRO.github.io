import { test } from "node:test";
import assert from "node:assert/strict";
import { contrastFailures, loadPalettes, paletteCss } from "../../scripts/palettes.mjs";
import { contrast } from "../../src/core/color.js";

test("contrast() matches known WCAG values", () => {
    assert.equal(contrast("#000000", "#ffffff").toFixed(2), "21.00");
    assert.equal(contrast("#777777", "#ffffff").toFixed(2), "4.48");
});

test("every palette meets its contrast rules in both themes", async () => {
    const failures = contrastFailures(await loadPalettes());
    assert.deepEqual(failures, [], `\n${failures.join("\n")}`);
});

test("generated CSS covers all five proposals in both themes", async () => {
    const css = paletteCss(await loadPalettes());
    for (const id of ["vault", "ledger", "cipher", "mint", "protocol"]) {
        for (const theme of ["dark", "light"]) assert.match(css, new RegExp(`data-proposal="${id}"\\]\\[data-theme="${theme}"`));
    }
    assert.match(css, /prefers-color-scheme: dark/);
});
