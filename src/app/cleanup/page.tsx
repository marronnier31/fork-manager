import React from "react";
import { CleanupList } from "../../components/cleanup/cleanup-list";
import { AppShell } from "../../components/layout/app-shell";
import { listCleanupCandidates } from "../../lib/repos/queries";

export const dynamic = "force-dynamic";

export default async function CleanupPage() {
  const repositories = await listCleanupCandidates();

  return (
    <AppShell
      title="Cleanup Queue"
      subtitle="Review forks that look abandoned, unowned, or no longer worth keeping."
    >
      <CleanupList repositories={repositories} />
    </AppShell>
  );
}
