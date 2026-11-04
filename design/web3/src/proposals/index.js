/**
 * Proposal registry. Each proposal exports { id, render(page, ctx), mount?(root, ctx) }.
 * render returns SafeHTML for one of: home, about, work, project, contact.
 */
import { cipher } from "./cipher.js";
import { ledger } from "./ledger.js";
import { mint } from "./mint.js";
import { protocol } from "./protocol.js";
import { vault } from "./vault.js";

export const proposals = { vault, ledger, cipher, mint, protocol };
