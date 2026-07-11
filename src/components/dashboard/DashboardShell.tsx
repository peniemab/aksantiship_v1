import { RequireAuth } from "@/components/RequireAuth";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth requireVerified>
      <div className="flex min-h-screen bg-surface">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
