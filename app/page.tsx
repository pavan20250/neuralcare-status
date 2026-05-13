import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { publicEnv } from "@/lib/env";

export default function Home() {
  return (
    <div className="mesh-gradient min-h-screen">
      <main className="flex min-h-screen flex-col">
        <DashboardPage
          refreshMs={publicEnv.refreshInterval()}
          appName={publicEnv.appName()}
        />
        <footer className="mt-auto border-t border-border/50 px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {publicEnv.appName()} · status.neuralcare-ai.com
        </footer>
      </main>
    </div>
  );
}
