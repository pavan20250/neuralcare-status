import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";
import type { Incident } from "@/types/status";
import { IncidentTimeline } from "@/components/status/incident-timeline";
import { Button } from "@/components/ui/button";

async function loadIncidents(): Promise<Incident[]> {
  try {
    const file = path.join(process.cwd(), "data", "incidents.json");
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as Incident[];
  } catch {
    return [];
  }
}

export default async function IncidentsPage() {
  const incidents = await loadIncidents();

  return (
    <div className="mesh-gradient min-h-screen">
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold tracking-tight">Incidents</h1>
          <Button variant="outline" size="sm" asChild className="h-8 rounded-lg text-xs">
            <Link href="/">← Status</Link>
          </Button>
        </div>
        <IncidentTimeline
          incidents={incidents}
          showArchiveLink={false}
        />
      </main>
    </div>
  );
}
