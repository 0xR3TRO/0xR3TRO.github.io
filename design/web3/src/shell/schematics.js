/**
 * Wireframe thumbnails of each proposal's layout for the overview cards.
 * Drawn in currentColor at different opacities so they follow the host theme.
 */
import { raw } from "../core/dom.js";

const r = (x, y, w, h, o = 0.18, rx = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="currentColor" opacity="${o}"/>`;
const line = (x1, y1, x2, y2, o = 0.35) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="currentColor" stroke-width="1.5" opacity="${o}"/>`;
const dot = (cx, cy, rad, o = 0.6) => `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="currentColor" opacity="${o}"/>`;

const SCHEMATICS = {
    vault: () =>
        r(16, 14, 288, 10, 0.12) +
        r(16, 44, 132, 18, 0.55) +
        r(16, 68, 110, 18, 0.55) +
        r(16, 96, 150, 6) +
        r(16, 108, 120, 6) +
        r(16, 124, 56, 14, 0.5, 7) +
        r(78, 124, 50, 14, 0.2, 7) +
        `<g transform="rotate(-4 236 86)">${r(178, 46, 116, 76, 0.16, 10)}${r(190, 58, 18, 18, 0.5)}${r(190, 98, 70, 6, 0.4)}${r(190, 108, 46, 5, 0.25)}</g>` +
        r(16, 156, 288, 30, 0.1, 8) +
        r(28, 164, 264, 30, 0.14, 8) +
        r(40, 172, 240, 30, 0.2, 8),
    ledger: () =>
        r(16, 14, 288, 10, 0.12) +
        r(196, 15, 100, 8, 0.3, 4) +
        r(60, 38, 150, 16, 0.55) +
        line(52, 66, 52, 196, 0.3) +
        [70, 112, 154]
            .map((y) => dot(52, y + 6, 4) + r(68, y, 196, 32, 0.12, 4) + r(76, y + 6, 60, 5, 0.45) + r(76, y + 17, 140, 4, 0.22) + r(232, y + 6, 24, 5, 0.3))
            .join(""),
    cipher: () =>
        r(16, 14, 288, 12, 0.14) +
        r(120, 16, 80, 8, 0.32, 4) +
        r(16, 32, 64, 148, 0.1, 4) +
        [44, 56, 68, 80, 92, 104].map((y, i) => r(24, y, i % 3 === 0 ? 40 : 32, 5, i === 2 ? 0.55 : 0.25)).join("") +
        r(86, 32, 146, 148, 0.06, 4) +
        r(96, 44, 92, 14, 0.55) +
        [70, 80, 90, 100, 120, 130, 140].map((y) => r(96, y, 124, 4, 0.22)).join("") +
        r(238, 32, 66, 148, 0.1, 4) +
        [44, 58, 72, 86].map((y) => r(246, y, 48, 5, 0.25)).join("") +
        r(16, 186, 288, 8, 0.2, 2),
    mint: () =>
        r(16, 14, 288, 10, 0.12) +
        r(16, 38, 210, 22, 0.55) +
        r(16, 66, 150, 22, 0.55) +
        [16, 96, 176, 256]
            .map((x, i) => {
                const art = i % 2 === 0 ? dot(x + 34, 136, 20, 0.35) + dot(x + 34, 136, 10, 0.6) : `<path d="M${x} ${116}a24 24 0 0 1 24 24M${x + 44} ${116}a24 24 0 0 0 24 24" stroke="currentColor" stroke-width="5" fill="none" opacity="0.45"/>`;
                return r(x, 100, 68, 72, 0.14, 8) + art + r(x + 6, 178, 40, 5, 0.4);
            })
            .join(""),
    protocol: () =>
        r(16, 14, 288, 10, 0.12) +
        [40, 52, 64, 76, 88, 100, 112].map((y, i) => r(16, y, i === 3 ? 56 : 48, 5, i === 3 ? 0.55 : 0.22)).join("") +
        r(88, 38, 140, 14, 0.55) +
        r(88, 60, 64, 6, 0.3) +
        [78, 88, 98, 108].map((y) => r(88, y, 140, 4, 0.22)).join("") +
        r(88, 122, 90, 10, 0.45) +
        [140, 150, 160, 170].map((y) => r(88, y, 140, 4, 0.22)).join("") +
        line(248, 40, 248, 112, 0.25) +
        [42, 56, 70, 84].map((y, i) => r(254, y, 46, 5, i === 1 ? 0.55 : 0.22)).join(""),
};

export const schematic = (id) =>
    raw(`<svg class="schematic" viewBox="0 0 320 200" aria-hidden="true" focusable="false">${SCHEMATICS[id]()}</svg>`);
