/* Sends visitors from "/" to /pl/ or /en/ based on the browser's language list.
   The first supported language in the list wins (pl or en); anything else gets English. No server, no IP lookup. */
(() => {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    const first = langs.find((l) => /^(pl|en)\b/i.test(l));
    const polish = Boolean(first) && /^pl/i.test(first);
    location.replace((polish ? "/pl/" : "/en/") + location.search + location.hash);
})();
