/**
 * Reusable, accessible widget behaviours. Each one works on freshly rendered
 * markup and can remember its state in a plain object (the page state), so a
 * re-render (for example a theme switch) does not reset what the user chose.
 */
import { $$, prefersReducedMotion } from "./dom.js";

/** Copy text to the clipboard, with a selection-based fallback. */
export async function copyText(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        /* fall through to the legacy path */
    }
    try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.append(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
    } catch {
        return false;
    }
}

/**
 * Tabs: <div data-tabs="key"><div role="tablist"><button role="tab" aria-controls="id">…
 * Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern).
 */
export function mountTabs(root, memory = {}) {
    memory.tabs ??= {};
    for (const group of $$("[data-tabs]", root)) {
        const key = group.dataset.tabs;
        const tabs = $$('[role="tab"]', group);
        const select = (tab, focus) => {
            for (const item of tabs) {
                const active = item === tab;
                item.setAttribute("aria-selected", String(active));
                item.tabIndex = active ? 0 : -1;
                const panel = group.querySelector(`#${item.getAttribute("aria-controls")}`);
                if (panel) panel.hidden = !active;
            }
            memory.tabs[key] = tab.id;
            if (focus) tab.focus();
        };
        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => select(tab, false));
            tab.addEventListener("keydown", (event) => {
                const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
                if (!(event.key in moves)) return;
                event.preventDefault();
                select(tabs[(moves[event.key] + tabs.length) % tabs.length], true);
            });
        });
        const remembered = tabs.find((tab) => tab.id === memory.tabs[key]);
        select(remembered || tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0], false);
    }
}

/** Disclosure buttons: <button data-disclosure aria-controls="id" aria-expanded="false">. */
export function mountDisclosures(root, memory = {}) {
    memory.open ??= {};
    for (const button of $$("[data-disclosure]", root)) {
        const id = button.getAttribute("aria-controls");
        const panel = root.querySelector(`#${id}`);
        if (!panel) continue;
        const apply = (open) => {
            button.setAttribute("aria-expanded", String(open));
            panel.hidden = !open;
            memory.open[id] = open;
        };
        apply(memory.open[id] ?? button.getAttribute("aria-expanded") === "true");
        button.addEventListener("click", () => apply(button.getAttribute("aria-expanded") !== "true"));
    }
}

/**
 * Reveal text through a short scramble. Returns a cancel function.
 * With reduced motion the final text appears at once.
 */
export function scrambleText(element, finalText, { duration = 900, glyphs = "▓▒░<>/\\[]{}=+*#%&01" } = {}) {
    if (prefersReducedMotion()) {
        element.textContent = finalText;
        return () => {};
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const revealed = Math.floor(progress * finalText.length);
        let text = finalText.slice(0, revealed);
        for (let i = revealed; i < finalText.length; i += 1) {
            text += finalText[i] === " " ? " " : glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        element.textContent = text;
        if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
}

/**
 * Highlight the table-of-contents entry for the section in view.
 * Returns a disconnect function.
 */
export function scrollSpy(sections, onActive, { offset = 120 } = {}) {
    if (!("IntersectionObserver" in window) || sections.length === 0) return () => {};
    const visible = new Map();
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
            const first = sections.find((section) => visible.get(section.id));
            if (first) onActive(first.id);
        },
        { rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
}
