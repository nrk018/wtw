import { scryptSync, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wtw-default-secret-change-in-production"
);

export type AuthMode = "admin" | "game";

const COOKIE_NAME = "wtw_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

const KEY_LEN = 64;

export function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): boolean {
  const [saltHex, keyHex] = hashedPassword.split(":");
  if (!saltHex || !keyHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const key = scryptSync(plainPassword, salt, KEY_LEN);
    const storedKey = Buffer.from(keyHex, "hex");
    return key.length === storedKey.length && timingSafeEqual(key, storedKey);
  } catch {
    return false;
  }
}

export async function createSession(mode: AuthMode): Promise<string> {
  const token = await new SignJWT({ mode })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(JWT_SECRET);
  return token;
}

export async function getSession(
  token: string | undefined
): Promise<{ mode: AuthMode } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const mode = payload.mode as AuthMode;
    if (mode !== "admin" && mode !== "game") return null;
    return { mode };
  } catch {
    return null;
  }
}

export function getAuthCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  return match ? match[2] : undefined;
}

export function setAuthCookie(token: string) {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
