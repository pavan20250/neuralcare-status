import { NextResponse } from "next/server";
import { getAggregatedStatus } from "@/services/status-aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await getAggregatedStatus();
  return NextResponse.json(body);
}
