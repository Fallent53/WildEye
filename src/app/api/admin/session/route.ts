/* (c) 2026 - Loris Dc - WildEye Project */
import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ isAdmin: await isAdminSessionValid() });
}
