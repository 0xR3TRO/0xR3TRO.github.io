/**
 * Metadata for the overview and the comparison matrix. Every proposal is
 * described with the same fields so they can be compared row by row.
 */
export const proposalMeta = [
    {
        id: "vault",
        number: 1,
        name: "Vault",
        kind: "Identity credential",
        concept:
            "Your name is the domain, so the site opens with an identity credential: a card you can tilt and flip, followed by panels that stack like passes in a wallet.",
        inspiredBy: ["Identity tokens", "Wallet passes", "Name records"],
        layout: "Split hero with the credential, then full-width panels that stack as you scroll.",
        typography: "Heavy grotesque headlines with monospace record labels.",
        colour: "Mint on black. Deep green on white.",
        signature: "Credential card that tilts with the pointer and flips to show its records.",
        strengths: ["Person first: name and role are the hero.", "Memorable without being loud."],
        watchOuts: ["Needs a strong sigil or a real portrait.", "Stacked panels work best with short sections."],
        effort: "Medium",
        bestFor: "A personal site that works like a calling card.",
    },
    {
        id: "ledger",
        number: 2,
        name: "Ledger",
        kind: "Block explorer",
        concept:
            "The site reads like a public ledger. Every section is a block with a height, a fingerprint and a link to the block before it.",
        inspiredBy: ["Block explorers", "Audit logs", "Hash chains"],
        layout: "Narrow reading column, a vertical chain of blocks and search in the header.",
        typography: "Grotesque headlines, data set in tabular monospace.",
        colour: "Lime on black. Olive on white.",
        signature: "Verify the chain with real SHA-256 hashes, including a tamper test.",
        strengths: ["Clear structure, quick to scan.", "Search and sortable tables are genuinely useful."],
        watchOuts: ["Dense, so the copy must stay disciplined.", "Data styling can feel technical to non-developers."],
        effort: "Medium",
        bestFor: "Showing precision and a methodical way of working.",
    },
    {
        id: "cipher",
        number: 3,
        name: "Cipher",
        kind: "Security console",
        concept:
            "A console for a security-minded developer: a page tree, an inspector and a command palette instead of a classic menu.",
        inspiredBy: ["Security consoles", "Terminals", "Command palettes"],
        layout: "App shell with a page tree, a content pane, an inspector and a status bar.",
        typography: "Monospace throughout, with one heavy grotesque headline per page.",
        colour: "Amber on black. Dark amber on white.",
        signature: "Command palette on Ctrl+K or ⌘K, and text that decodes as it appears.",
        strengths: ["Fast keyboard navigation.", "Clear cybersecurity character."],
        watchOuts: ["An app-like layout is less familiar to casual visitors.", "Phones need the tree and inspector collapsed."],
        effort: "High",
        bestFor: "A developer who wants the site to feel like a tool.",
    },
    {
        id: "mint",
        number: 4,
        name: "Mint",
        kind: "Token collection",
        concept:
            "Projects become a collection of tokens. Each one gets generative artwork seeded by its own fingerprint and a token page with traits.",
        inspiredBy: ["Token collections", "Generative art", "Trait sheets"],
        layout: "Gallery first: a horizontal rail of tokens, then large token pages.",
        typography: "Very large display type with compact trait labels.",
        colour: "Coral for actions. The artwork brings its own colours.",
        signature: "Deterministic artwork for every project, with a shuffle preview.",
        strengths: ["The most visual of the five.", "Projects look finished and valuable."],
        watchOuts: ["Art can overshadow the person.", "Relies on strong project names and summaries."],
        effort: "Medium",
        bestFor: "Putting the projects on show.",
    },
    {
        id: "protocol",
        number: 5,
        name: "Protocol",
        kind: "Specification",
        concept:
            "The site is written like a protocol specification: numbered sections, MUST and SHOULD statements and a registry of modules.",
        inspiredBy: ["Whitepapers", "RFCs", "Developer docs"],
        layout: "Documentation layout with a section tree, a reading column and an on-this-page index.",
        typography: "Grotesque at reading sizes, numbered headings, monospace for interfaces.",
        colour: "Electric blue in both themes.",
        signature: "An index that follows your scroll, with numbered, linkable sections.",
        strengths: ["Calm and the most readable; ages well.", "Scales to long documentation."],
        watchOuts: ["The least visual of the five.", "Depends on well-written text."],
        effort: "Low",
        bestFor: "A thoughtful, documentation-first presence.",
    },
];

export const COMPARE_ROWS = [
    ["kind", "Direction"],
    ["concept", "Concept"],
    ["layout", "Layout"],
    ["typography", "Typography"],
    ["colour", "Colour"],
    ["signature", "Signature interaction"],
    ["strengths", "Strengths"],
    ["watchOuts", "Watch out for"],
    ["effort", "Effort to build"],
    ["bestFor", "Best for"],
];

export const SHARED_RULES = [
    "Same pages and the same content in all five, so you compare design, not copy.",
    "One spacing scale, one type scale and one set of radii. A lint check rejects raw values.",
    "Two themes, Black and White. Every text colour passes WCAG AA, checked by tests.",
    "No charts, no trackers, no wallet connection and no blockchain calls. Web3 is the look, not a dependency.",
    "An original klefas mark. Nothing is copied from the reference sites.",
];
