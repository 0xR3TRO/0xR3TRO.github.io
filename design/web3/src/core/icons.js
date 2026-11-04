import { raw } from "./dom.js";

/** 20x20 stroke icons. All decorative: callers add text or aria-label. */
const PATHS = {
    arrowRight: "M4 10h12M11 5l5 5-5 5",
    arrowUpRight: "M6 14 14 6M7 6h7v7",
    arrowLeft: "M16 10H4M9 5l-5 5 5 5",
    copy: "M7 7h9v9H7zM4 13V4h9",
    check: "m4 10.5 4 4 8-9",
    cross: "m5 5 10 10M15 5 5 15",
    sun: "M10 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4",
    moon: "M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5Z",
    search: "M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12ZM17 17l-3.6-3.6",
    chevronDown: "m5 8 5 5 5-5",
    chevronRight: "m8 5 5 5-5 5",
    shield: "M10 2 4 4.5v5c0 4 2.6 6.8 6 8.5 3.4-1.7 6-4.5 6-8.5v-5L10 2Z",
    key: "M12.5 11a4 4 0 1 0-3.9-3.1L3 13.5V17h3.5v-2h2v-2h2l.6-.6",
    file: "M5 2h7l4 4v12H5zM12 2v4h4",
    folder: "M2 5h6l2 2h8v10H2z",
    terminal: "M3 4h14v12H3zM6 8l3 2-3 2M10.5 13H14",
    layers: "M10 3 2 7.5l8 4.5 8-4.5L10 3ZM2 12l8 4.5 8-4.5",
    link: "M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.8-.8",
    mail: "M3 5h14v10H3zM3.5 5.5 10 11l6.5-5.5",
    github: "M10 2.5a7.5 7.5 0 0 0-2.4 14.6c.4.1.5-.2.5-.4v-1.4c-2.1.5-2.5-1-2.5-1-.4-.9-.9-1.1-.9-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.8 2.2.6.1-.5.3-.8.5-1-1.7-.2-3.4-.8-3.4-3.7 0-.8.3-1.5.8-2-.1-.2-.3-1 .1-2 0 0 .6-.2 2.1.8a7.2 7.2 0 0 1 3.8 0c1.5-1 2.1-.8 2.1-.8.4 1 .2 1.8.1 2 .5.5.8 1.2.8 2 0 2.9-1.7 3.5-3.4 3.7.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A7.5 7.5 0 0 0 10 2.5Z",
    sliders: "M4 6h7M15 6h1M4 14h1M9 14h7M13 4v4M7 12v4",
    shuffle: "M3 6h3l7 8h4M14 4l3 2-3 2M3 14h3l2-2.3M12 8.3 13 6h4M14 12l3 2-3 2",
    command: "M7 4a3 3 0 1 0 0 6h6a3 3 0 1 0 0-6v12a3 3 0 1 0 0-6H7a3 3 0 1 0 0 6V4",
};

export function icon(name, { size = 18, label } = {}) {
    const path = PATHS[name];
    if (!path) throw new Error(`Unknown icon: ${name}`);
    const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
    return raw(
        `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${a11y}><path d="${path}"/></svg>`,
    );
}
