/* (c) 2026 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  getBlurredCoordinates,
  validateObservationInput,
} from "@/lib/observation-validation";
import {
  createOwnerRef,
  createUserSessionValue,
  getUserSessionId,
  USER_SESSION_COOKIE,
  userSessionCookieOptions,
} from "@/lib/user-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getWritableUserSession() {
  const existingUserId = await getUserSessionId();
  if (existingUserId) return { userId: existingUserId, cookieValue: null };
  return createUserSessionValue();
}

export async function GET() {
  const userId = await getUserSessionId();
  if (!userId) return NextResponse.json({ observations: [] });

  const { data, error } = await getSupabaseAdmin()
    .from("observations")
    .select("*")
    .eq("user_id", userId)
    .order("observed_at", { ascending: false });

  if (error) {
    console.error("Own observations fetch error:", error);
    return NextResponse.json({ observations: [] }, { status: 500 });
  }

  return NextResponse.json({
    observations: (data ?? []).map((observation) => ({
      ...observation,
      owner_ref: createOwnerRef(userId),
    })),
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let normalized;
  try {
    normalized = validateObservationInput(body as Parameters<typeof validateObservationInput>[0]);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Observation invalide." },
      { status: 400 }
    );
  }

  const session = await getWritableUserSession();
  const blurred = getBlurredCoordinates(
    normalized.longitude,
    normalized.latitude,
    normalized.privacy_level
  );

  const row = {
    id: `obs-${randomUUID()}`,
    ...normalized,
    ...blurred,
    user_id: session.userId,
    observer_name: normalized.is_anonymous ? "Anonyme" : normalized.observer_name,
  };

  const { data, error } = await getSupabaseAdmin()
    .from("observations")
    .insert([row])
    .select("*")
    .single();

  if (error) {
    console.error("Observation insert error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const response = NextResponse.json({
    observation: {
      ...data,
      owner_ref: createOwnerRef(session.userId),
    },
  });

  if (session.cookieValue) {
    response.cookies.set(USER_SESSION_COOKIE, session.cookieValue, userSessionCookieOptions);
  }

  return response;
}
