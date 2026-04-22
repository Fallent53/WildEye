/* (c) 2026 - Loris Dc - WildEye Project */
import { pbkdf2Sync, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionValue,
} from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type AdminPasscodeRow = {
  passcode_hash: string;
  salt: string;
  iterations: number;
};

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;

function hashPasscode(passcode: string, salt: string, iterations: number) {
  return pbkdf2Sync(passcode, salt, iterations, 32, "sha256").toString("hex");
}

function safeCompareHex(a: string, b: string) {
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_LOGIN_ATTEMPTS;
}

function clearRateLimit(key: string) {
  loginAttempts.delete(key);
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let passcode = "";

  try {
    const body = (await request.json()) as { passcode?: unknown };
    passcode = typeof body.passcode === "string" ? body.passcode : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!passcode || passcode.length > 256) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_passcodes")
    .select("passcode_hash, salt, iterations")
    .eq("active", true);

  if (error) {
    console.error("Admin login configuration error:", error);
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  const rows = (data ?? []) as AdminPasscodeRow[];
  const isValid = rows.some((row) =>
    safeCompareHex(
      hashPasscode(passcode, row.salt, row.iterations),
      row.passcode_hash
    )
  );

  if (!isValid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  clearRateLimit(clientKey);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    createAdminSessionValue(),
    adminSessionCookieOptions
  );
  return response;
}
