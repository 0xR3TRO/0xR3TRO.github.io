/** Small deterministic PRNG so generated art is identical on every visit. */

export function mulberry32(seed) {
    let state = seed >>> 0;
    return function next() {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** 32-bit seed from 8 hex characters of a hash, starting at `offset`. */
export const seedFrom = (hex, offset = 0) => Number.parseInt(hex.slice(offset, offset + 8), 16) >>> 0;

export const pick = (rand, list) => list[Math.floor(rand() * list.length)];
