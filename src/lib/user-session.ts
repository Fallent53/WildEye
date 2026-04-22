/* (c) 2026 - Loris Dc - WildEye Project */
import { createHmac, createHash, randomUUID, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const USER_SESSION_COOKIE = "wildeye_user_session";

const USER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getUserSessionSecret() {
  return (
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

function signUserId(userId: string) {
  const secret = getUserSessionSecret();
  if (!secret) throw new Error("USER_SESSION_SECRET is not configured.");
  return createHmac("sha256", secret).update(userId).digest("hex");
}

function safeCompareHex(a: string, b: string) {
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function createOwnerRef(userId: string) {
  return createHash("md5").update(userId).digest("hex");
}

export function isClientUserIdAcceptable(userId: unknown) {
  return (
    typeof userId === "string" &&
    /^[a-zA-Z0-9_-]{12,96}$/.test(userId) &&
    userId !== "local-user"
  );
}

export function createUserSessionValue(userId?: string) {
  const nextUserId = userId ?? randomUUID();
  return {
    userId: nextUserId,
    cookieValue: `${nextUserId}.${signUserId(nextUserId)}`,
  };
}

export function parseUserSessionValue(value?: string) {
  if (!value) return null;
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const userId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  if (!isClientUserIdAcceptable(userId)) return null;

  try {
    return safeCompareHex(signUserId(userId), signature) ? userId : null;
  } catch {
    return null;
  }
}

export async function getUserSessionId() {
  const cookieStore = await cookies();
  return parseUserSessionValue(cookieStore.get(USER_SESSION_COOKIE)?.value);
}

export const userSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: USER_SESSION_MAX_AGE_SECONDS,
};
