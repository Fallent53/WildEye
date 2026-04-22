/* (c) 2026 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import {
  createOwnerRef,
  createUserSessionValue,
  getUserSessionId,
  isClientUserIdAcceptable,
  USER_SESSION_COOKIE,
  userSessionCookieOptions,
} from "@/lib/user-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUserSession(request?: Request) {
  const existingUserId = await getUserSessionId();
  if (existingUserId) {
    return { userId: existingUserId, cookieValue: null };
  }

  let requestedUserId: unknown;
  if (request) {
    try {
      requestedUserId = ((await request.json()) as { userId?: unknown }).userId;
    } catch {
      requestedUserId = undefined;
    }
  }

  return createUserSessionValue(
    isClientUserIdAcceptable(requestedUserId) ? String(requestedUserId) : undefined
  );
}

function sessionResponse(userId: string, cookieValue: string | null) {
  const response = NextResponse.json({
    userId,
    owner_ref: createOwnerRef(userId),
  });

  if (cookieValue) {
    response.cookies.set(USER_SESSION_COOKIE, cookieValue, userSessionCookieOptions);
  }

  return response;
}

export async function GET() {
  const session = await resolveUserSession();
  return sessionResponse(session.userId, session.cookieValue);
}

export async function POST(request: Request) {
  const session = await resolveUserSession(request);
  return sessionResponse(session.userId, session.cookieValue);
}
