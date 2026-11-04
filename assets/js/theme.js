/* Runs in <head>, before first paint, so there is no flash of the wrong theme. */
(() => {
    const root = document.documentElement;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const read = () => {
        try {
            return localStorage.getItem("theme");
        } catch {
            return null;
        }
    };
    const apply = (theme, save) => {
        root.setAttribute("data-theme", theme);
        if (!save) return;
        try {
            localStorage.setItem("theme", theme);
        } catch {
            /* storage blocked: theme still applies for this visit */
        }
    };

    apply(read() || (media.matches ? "dark" : "light"), false);

    addEventListener("DOMContentLoaded", () => {
        const toggle = document.getElementById("themeToggle");
        const sync = () =>
            toggle.setAttribute(
                "aria-pressed",
                String(root.getAttribute("data-theme") === "dark"),
            );
        sync();
        toggle.addEventListener("click", () => {
            apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
            sync();
        });
    });

    media.addEventListener("change", (e) => {
        if (!read()) apply(e.matches ? "dark" : "light", false);
    });
})();
