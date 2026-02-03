/**
 * Run from project root: npm run hash-password -- yourPassword
 * Or with Node only (no deps): node --experimental-strip-types scripts/hash-password.ts yourPassword
 * Use the printed hash in .env.local as ADMIN_PASSWORD_HASH and GAME_PASSWORD_HASH
 */
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

const SALT_LEN = 16;
const KEY_LEN = 64;

function hashPassword(password: string): string {
  const saltHex = randomBytes(SALT_LEN).toString("hex");
  const salt = Buffer.from(saltHex, "hex");
  const key = scryptSync(password, salt, KEY_LEN);
  return `${saltHex}:${key.toString("hex")}`;
}

function main() {
  const args = process.argv.slice(2);
  const password = args[0] || "admin123";
  const hashed = hashPassword(password);
  console.log("Password:", password);
  console.log("Hash (use in .env.local):", hashed);
}

main();
