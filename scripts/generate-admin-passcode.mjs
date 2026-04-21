/* (c) 2026 - Loris Dc - WildEye Project */
import { pbkdf2Sync, randomBytes } from "crypto";

const passcode = process.argv[2];
const label = process.argv[3] ?? "primary";
const iterations = 210000;

if (!passcode) {
  console.error("Usage: node scripts/generate-admin-passcode.mjs <passcode> [label]");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const passcodeHash = pbkdf2Sync(passcode, salt, iterations, 32, "sha256").toString("hex");
const escapedLabel = label.replaceAll("'", "''");

console.log(`
insert into public.admin_passcodes (label, passcode_hash, salt, iterations, active)
values ('${escapedLabel}', '${passcodeHash}', '${salt}', ${iterations}, true);
`);
