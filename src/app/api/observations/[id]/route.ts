/* (c) 2026 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import { getBlurredCoordinates, validateObservationPatch } from "@/lib/observation-validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUserSessionId } from "@/lib/user-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await getUserSessionId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  let patch;
  try {
    patch = validateObservationPatch(await request.json());
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Patch invalide." },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = { ...patch };

  if (patch.privacy_level) {
    const { data: current, error: currentError } = await getSupabaseAdmin()
      .from("observations")
      .select("longitude, latitude")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (currentError || !current) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    Object.assign(
      update,
      getBlurredCoordinates(current.longitude, current.latitude, patch.privacy_level)
    );
  }

  Object.keys(update).forEach((key) => {
    if (update[key] === undefined) delete update[key];
  });

  const { data, error } = await getSupabaseAdmin()
    .from("observations")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    if (error) console.error("Observation patch error:", error);
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ observation: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await getUserSessionId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("observations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Observation delete error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
