/**
 * Minimal, dependency-free templating and DOM helpers.
 *
 * `html` is a tagged template literal that escapes every interpolated value
 * unless the value was produced by `html` itself or wrapped in `raw()`.
 * That makes markup composable without ever double-escaping or injecting
 * untrusted strings.
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape a value for use in HTML text or a quoted attribute. */
export function esc(value) {
    return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/** Marker for markup that is already safe. */
export class SafeHTML {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return this.value;
    }
}

/** Mark a trusted string (for example generated SVG) as safe markup. */
export const raw = (value) => new SafeHTML(String(value));

function serialize(value) {
    if (value === null || value === undefined || value === false) return "";
    if (value instanceof SafeHTML) return value.value;
    if (Array.isArray(value)) return value.map(serialize).join("");
    return esc(value);
}

/** Tagged template: html`<p>${userText}</p>` returns SafeHTML. */
export function html(strings, ...values) {
    let out = strings[0];
    for (let i = 0; i < values.length; i += 1) out += serialize(values[i]) + strings[i + 1];
    return new SafeHTML(out);
}

/** Join a list of SafeHTML/strings into one SafeHTML. */
export const join = (items) => raw(items.map(serialize).join(""));

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/**
 * Delegated event listener. Returns a function that removes it.
 * The handler receives (event, matchedElement).
 */
export function delegate(target, type, selector, handler, options) {
    const listener = (event) => {
        const match = selector ? event.target.closest?.(selector) : event.target;
        if (!match) return;
        if (selector && target.contains && !target.contains(match) && target !== document && target !== window) return;
        handler(event, match);
    };
    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
}

export const prefersReducedMotion = () =>
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
