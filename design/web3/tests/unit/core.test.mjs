import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { sha256, shortHash } from "../../src/core/sha256.js";
import { esc, html, raw } from "../../src/core/dom.js";
import { formatRoute, parseRoute } from "../../src/core/router.js";
import { mulberry32 } from "../../src/core/random.js";
import { oklchToHex } from "../../src/core/color.js";

const node = (s) => createHash("sha256").update(s, "utf8").digest("hex");

test("sha256 matches Node's crypto for edge-case lengths and Unicode", () => {
    const inputs = ["", "abc", "klefas.me", "a".repeat(55), "a".repeat(56), "a".repeat(64), "a".repeat(1000), "zażółć gęślą jaźń ✓"];
    for (const input of inputs) assert.equal(sha256(input), node(input), `input length ${input.length}`);
});

test("shortHash keeps head and tail", () => {
    assert.equal(shortHash("0123456789abcdef"), "0x012345…cdef");
});

test("html escapes interpolations but not nested html or raw", () => {
    const user = '<img src=x onerror="alert(1)">';
    assert.equal(String(html`<p>${user}</p>`), `<p>${esc(user)}</p>`);
    assert.equal(String(html`<div>${html`<b>${"&"}</b>`}</div>`), "<div><b>&amp;</b></div>");
    assert.equal(String(html`${raw("<svg></svg>")}`), "<svg></svg>");
    assert.equal(String(html`${[html`<i>1</i>`, "2", null, false]}`), "<i>1</i>2");
});

test("router round-trips every route shape", () => {
    const ids = ["arcade", "lab", "budgetly"];
    for (const hash of ["overview", "compare", "vault-dark-home", "ledger-light-work", "mint-dark-project-lab", "protocol-light-map"]) {
        assert.equal(formatRoute(parseRoute(`#${hash}`, ids)), hash);
    }
});

test("router falls back safely on unknown input", () => {
    const ids = ["arcade", "lab"];
    assert.equal(parseRoute("#nonsense", ids).view, "overview");
    assert.equal(parseRoute("#cipher-purple-nope", ids).theme, "dark");
    assert.equal(parseRoute("#cipher-dark-nope", ids).page, "home");
    assert.equal(parseRoute("#cipher-dark-project-unknown", ids).project, "arcade");
});

test("PRNG is deterministic", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 5; i += 1) assert.equal(a(), b());
});

test("oklchToHex converts known anchors", () => {
    assert.equal(oklchToHex(1, 0, 0), "#ffffff");
    assert.equal(oklchToHex(0, 0, 0), "#000000");
});
