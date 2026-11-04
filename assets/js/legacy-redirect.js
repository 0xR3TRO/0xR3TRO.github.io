// Old addresses of renamed project sites: send /old/rest to /new/rest.
const MOVED = { "/r3tro-arcade/": "/arcade/", "/web-lab/": "/lab/" };
for (const [from, to] of Object.entries(MOVED)) {
    if (location.pathname.startsWith(from)) {
        location.replace(to + location.pathname.slice(from.length) + location.search + location.hash);
    }
}
