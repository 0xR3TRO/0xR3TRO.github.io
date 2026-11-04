/**
 * Single source of content for all five proposals, so the comparison is fair:
 * every proposal shows exactly the same information in its own way.
 * Text in [brackets] is a placeholder for the owner to fill in.
 */
import { sha256 } from "../core/sha256.js";

export const person = {
    name: "Klefas",
    domain: "klefas.me",
    role: "Web developer",
    tagline: "I build small, fast and honest things for the web.",
    intro: "This is my personal site. The developer area collects my projects, each with documentation and a live version you can open.",
    story: "[Two or three sentences about you, written in the first person.]",
    location: "[City, country]",
    since: "[Year]",
    email: "kontakt@klefas.me",
    github: "https://github.com/0xR3TRO",
    languages: ["Polish", "English"],
    now: "[What you are working on right now.]",
};

export const skills = ["HTML", "CSS", "JavaScript", "Git", "[More skills]"];

export const principles = [
    { id: "fast", title: "Small and fast", text: "Pages load quickly and every project runs in the browser, with nothing to install." },
    { id: "private", title: "Private by default", text: "No trackers, no cookies and no requests to third parties." },
    { id: "documented", title: "Documented", text: "Every project explains what it is, how it works and how to run it." },
];

export const milestones = [
    { when: "2026", title: "klefas.me rebuilt", text: "A personal site with a separate developer area." },
    { when: "[Year]", title: "R3TRO Arcade and R3TRO Lab", text: "[What you built and what you learned.]" },
    { when: "[Year]", title: "[Milestone]", text: "[A role, a course or a project that mattered.]" },
];

const PROJECTS = [
    {
        id: "arcade",
        name: "R3TRO Arcade",
        kind: "Games",
        size: { value: 14, unit: "games" },
        summary: "Puzzles, arcade games and classics that run in the browser. No ads and no trackers.",
        stack: ["JavaScript", "Canvas", "No dependencies"],
        path: "/arcade/",
        source: "https://github.com/0xR3TRO/arcade",
        docs: {
            what: "A collection of fourteen small browser games with keyboard and touch controls.",
            how: "[How the games are structured: shared engine, one folder per game, and so on.]",
            decisions: "[One or two decisions worth explaining, and why.]",
        },
    },
    {
        id: "lab",
        name: "R3TRO Lab",
        kind: "Tools",
        size: { value: 24, unit: "apps" },
        summary: "Small tools, widgets and interface experiments in plain HTML, CSS and JavaScript.",
        stack: ["HTML", "CSS", "JavaScript"],
        path: "/lab/",
        source: "https://github.com/0xR3TRO/lab",
        docs: {
            what: "Twenty-four small apps and UI experiments, each self-contained.",
            how: "[How an experiment is added and kept independent of the others.]",
            decisions: "[What you would do differently next time.]",
        },
    },
    {
        id: "budgetly",
        name: "Budgetly",
        kind: "Apps",
        size: { value: 1, unit: "app" },
        summary: "Expenses, categories and a monthly budget. Your data stays on your device.",
        stack: ["JavaScript", "Local storage", "No account"],
        path: "/budgetly/",
        source: "https://github.com/0xR3TRO/budgetly",
        docs: {
            what: "A household budget that runs entirely in the browser.",
            how: "[Where data is stored and how categories and budgets are calculated.]",
            decisions: "[Why there is no account and no server.]",
        },
    },
];

/** Projects with derived, reproducible fields. */
export const projects = PROJECTS.map((project, index) => {
    const fingerprint = sha256(`klefas.me${project.path}`);
    return {
        ...project,
        index: index + 1,
        live: `https://klefas.me${project.path}`,
        fingerprint,
        run: [`git clone ${project.source}.git`, `cd ${project.id}`, "[Open index.html or start a local server]"],
    };
});

export const identity = {
    fingerprint: sha256("klefas.me"),
};

export const content = { person, skills, principles, milestones, projects, identity };
