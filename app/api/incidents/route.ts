import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import type { Incident } from "@/types/status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const file = path.join(process.cwd(), "data", "incidents.json");
    const raw = await readFile(file, "utf8");
    const incidents = JSON.parse(raw) as Incident[];
    return NextResponse.json({ incidents });
  } catch {
    return NextResponse.json({ incidents: [] as Incident[] });
  }
}
