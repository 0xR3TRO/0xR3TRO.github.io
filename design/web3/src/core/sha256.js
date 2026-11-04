/**
 * Synchronous SHA-256 (FIPS 180-4) for short strings.
 *
 * Used for real, reproducible fingerprints of page and project names and for
 * the hash chain in the Ledger proposal. The round constants are derived from
 * the first 64 primes exactly as the standard defines them; the unit tests
 * compare the output with Node's crypto module.
 */

const K = new Uint32Array(64);
const H0 = new Uint32Array(8);

(function initConstants() {
    const primes = [];
    for (let candidate = 2; primes.length < 64; candidate += 1) {
        if (primes.every((p) => candidate % p !== 0)) primes.push(candidate);
    }
    const fraction32 = (x) => ((x - Math.floor(x)) * 2 ** 32) >>> 0;
    primes.forEach((prime, i) => {
        K[i] = fraction32(Math.cbrt(prime));
        if (i < 8) H0[i] = fraction32(Math.sqrt(prime));
    });
})();

const rotr = (x, n) => (x >>> n) | (x << (32 - n));

/** @param {string | Uint8Array} input @returns {string} 64 hex characters */
export function sha256(input) {
    const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
    const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
    const buffer = new Uint8Array(paddedLength);
    buffer.set(bytes);
    buffer[bytes.length] = 0x80;

    const view = new DataView(buffer.buffer);
    const bitLength = bytes.length * 8;
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 2 ** 32));
    view.setUint32(paddedLength - 4, bitLength >>> 0);

    const hash = H0.slice();
    const w = new Uint32Array(64);

    for (let offset = 0; offset < paddedLength; offset += 64) {
        for (let t = 0; t < 16; t += 1) w[t] = view.getUint32(offset + t * 4);
        for (let t = 16; t < 64; t += 1) {
            const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
            const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
            w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
        }

        let [a, b, c, d, e, f, g, h] = hash;
        for (let t = 0; t < 64; t += 1) {
            const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            const choice = (e & f) ^ (~e & g);
            const t1 = (h + s1 + choice + K[t] + w[t]) >>> 0;
            const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            const majority = (a & b) ^ (a & c) ^ (b & c);
            const t2 = (s0 + majority) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) >>> 0;
        }

        hash[0] += a;
        hash[1] += b;
        hash[2] += c;
        hash[3] += d;
        hash[4] += e;
        hash[5] += f;
        hash[6] += g;
        hash[7] += h;
    }

    return Array.from(hash, (word) => word.toString(16).padStart(8, "0")).join("");
}

/** 0x-prefixed short form: 0x1a2b3c…9f0e */
export const shortHash = (hex, head = 6, tail = 4) => `0x${hex.slice(0, head)}…${hex.slice(-tail)}`;
