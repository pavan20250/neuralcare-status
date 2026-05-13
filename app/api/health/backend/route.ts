import { NextResponse } from "next/server";
import { checkBackendHealth } from "@/services/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await checkBackendHealth();
  return NextResponse.json(body);
}
