/**
 * Deterministic generative art.
 *
 * Every project and the owner's identity get a SHA-256 fingerprint; the
 * fingerprint seeds the PRNG, so the same name always produces the same
 * artwork. Three families: Truchet arcs, offset rings and a mirrored mosaic.
 * The sigil is a symmetric 5x5 mark drawn in currentColor.
 */
import { raw } from "./dom.js";
import { oklchToHex } from "./color.js";
import { mulberry32, pick, seedFrom } from "./random.js";

const SIZE = 240;
export const ART_VARIANTS = ["truchet", "rings", "mosaic"];

/** Background plus three inks that read well in the given theme. */
export function artPalette(hex, theme) {
    const hue = (Number.parseInt(hex.slice(18, 20), 16) / 255) * 360;
    const spread = 40 + (Number.parseInt(hex.slice(2, 4), 16) / 255) * 120;
    if (theme === "light") {
        return {
            bg: oklchToHex(0.955, 0.018, hue),
            inks: [oklchToHex(0.56, 0.15, hue), oklchToHex(0.42, 0.12, hue + spread), oklchToHex(0.22, 0.03, hue + 180)],
        };
    }
    return {
        bg: oklchToHex(0.19, 0.022, hue),
        inks: [oklchToHex(0.82, 0.14, hue), oklchToHex(0.68, 0.15, hue + spread), oklchToHex(0.95, 0.03, hue + 180)],
    };
}

function truchet(rand, { inks }) {
    const n = pick(rand, [5, 6, 8]);
    const t = SIZE / n;
    const r = t / 2;
    const width = (t * 0.22).toFixed(2);
    let out = "";
    for (let row = 0; row < n; row += 1) {
        for (let col = 0; col < n; col += 1) {
            const x = col * t;
            const y = row * t;
            const ink = inks[Math.floor(rand() * inks.length)];
            const d =
                rand() < 0.5
                    ? `M${x + r} ${y}A${r} ${r} 0 0 1 ${x} ${y + r}M${x + t} ${y + r}A${r} ${r} 0 0 0 ${x + r} ${y + t}`
                    : `M${x + r} ${y}A${r} ${r} 0 0 0 ${x + t} ${y + r}M${x} ${y + r}A${r} ${r} 0 0 1 ${x + r} ${y + t}`;
            out += `<path d="${d}" stroke="${ink}" stroke-width="${width}" fill="none" stroke-linecap="butt"/>`;
        }
    }
    return out;
}

function rings(rand, { bg, inks }) {
    const cx = SIZE * (0.25 + rand() * 0.5);
    const cy = SIZE * (0.25 + rand() * 0.5);
    const count = 7 + Math.floor(rand() * 5);
    const step = (SIZE * 1.15) / count;
    let out = "";
    for (let i = count; i > 0; i -= 1) {
        const fill = i % 2 === 0 ? bg : inks[i % inks.length];
        out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(i * step).toFixed(1)}" fill="${fill}"/>`;
    }
    const dot = inks[Math.floor(rand() * inks.length)];
    out += `<circle cx="${(SIZE - cx).toFixed(1)}" cy="${(SIZE - cy).toFixed(1)}" r="${(step * 0.9).toFixed(1)}" fill="${dot}"/>`;
    return out;
}

function mosaic(rand, { inks }) {
    const n = 6;
    const t = SIZE / n;
    let out = "";
    for (let row = 0; row < n; row += 1) {
        for (let col = 0; col < n / 2; col += 1) {
            const shape = Math.floor(rand() * 5);
            const ink = inks[Math.floor(rand() * inks.length)];
            for (const c of [col, n - 1 - col]) {
                const x = c * t;
                const y = row * t;
                const mirrored = c !== col;
                if (shape === 0) out += `<rect x="${x - 0.3}" y="${y - 0.3}" width="${t + 0.6}" height="${t + 0.6}" fill="${ink}"/>`;
                if (shape === 1) out += `<circle cx="${x + t / 2}" cy="${y + t / 2}" r="${t * 0.42}" fill="${ink}"/>`;
                if (shape === 2) {
                    const cornerX = mirrored ? x + t : x;
                    out += `<path d="M${cornerX} ${y}h${mirrored ? -t : t}A${t} ${t} 0 0 ${mirrored ? 0 : 1} ${cornerX} ${y + t}Z" fill="${ink}"/>`;
                }
                if (shape === 3) out += `<path d="M${x + t / 2} ${y}L${x + t} ${y + t / 2}L${x + t / 2} ${y + t}L${x} ${y + t / 2}Z" fill="${ink}"/>`;
            }
        }
    }
    return out;
}

const GENERATORS = { truchet, rings, mosaic };

/**
 * @param {string} hex SHA-256 fingerprint
 * @param {{theme?: string, variant?: string, nonce?: number, label?: string, className?: string}} options
 */
export function tokenArt(hex, { theme = "dark", variant, nonce = 0, label, className = "art" } = {}) {
    const palette = artPalette(hex, theme);
    const chosen = variant || ART_VARIANTS[Number.parseInt(hex.slice(6, 8), 16) % ART_VARIANTS.length];
    const rand = mulberry32((seedFrom(hex, 8) ^ Math.imul(nonce + 1, 2654435761)) >>> 0);
    const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
    return raw(
        `<svg class="${className}" viewBox="0 0 ${SIZE} ${SIZE}" preserveAspectRatio="xMidYMid slice" ${a11y}><rect width="${SIZE}" height="${SIZE}" fill="${palette.bg}"/>${GENERATORS[chosen](rand, palette)}</svg>`,
    );
}

/** Symmetric 5x5 identity mark in currentColor. */
export function sigil(hex, { size = 64, label, className = "sigil" } = {}) {
    const cells = 5;
    const unit = 10;
    let out = "";
    for (let row = 0; row < cells; row += 1) {
        for (let col = 0; col < 3; col += 1) {
            const bit = Number.parseInt(hex[(row * 3 + col) % hex.length], 16) % 2 === 0;
            if (!bit) continue;
            for (const c of col === 2 ? [2] : [col, cells - 1 - col]) {
                out += `<rect x="${c * unit + 1}" y="${row * unit + 1}" width="${unit - 2}" height="${unit - 2}" rx="1.5"/>`;
            }
        }
    }
    const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
    return raw(`<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 50 50" fill="currentColor" ${a11y}>${out}</svg>`);
}
