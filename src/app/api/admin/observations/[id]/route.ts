/* (c) 2024 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("observations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Admin observation delete error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
