import { NextResponse } from "next/server";
import { checkGeminiHealth } from "@/services/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await checkGeminiHealth();
  return NextResponse.json(body);
}
