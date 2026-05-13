import { NextResponse } from "next/server";
import { checkSupabaseBundle } from "@/services/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await checkSupabaseBundle();
  return NextResponse.json(body);
}
