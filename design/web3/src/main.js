/**
 * Entry point. Wires the content and the five proposals into the shell.
 * The bundle is built by scripts/build.mjs into dist/web3-explorer.html.
 */
import { content } from "./data/content.js";
import { proposals } from "./proposals/index.js";
import { createShell } from "./shell/shell.js";

function start() {
    const app = document.getElementById("app");
    if (app) createShell(app, { proposals, content });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
