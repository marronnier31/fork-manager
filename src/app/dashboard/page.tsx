import { AppShell } from "../../components/layout/app-shell";
import { StatsGrid } from "../../components/dashboard/stats-grid";
import { getDashboardStats } from "../../lib/repos/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AppShell
      title="Dashboard"
      subtitle="A quick view of the imported fork collection."
    >
      <StatsGrid stats={stats} />
    </AppShell>
  );
}
