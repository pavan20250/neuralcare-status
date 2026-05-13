import { NextResponse } from "next/server";
import { checkVercelHealth } from "@/services/vercel";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await checkVercelHealth();
  return NextResponse.json(body);
}
