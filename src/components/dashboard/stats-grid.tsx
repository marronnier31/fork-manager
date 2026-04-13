import type { DashboardStats } from "../../lib/repos/queries";

type StatsGridProps = {
  stats: DashboardStats;
};

const STAT_ITEMS = [
  {
    key: "totalForks",
    label: "Total forks",
    description: "Imported repositories in the dashboard."
  },
  {
    key: "recentForks",
    label: "Recently updated",
    description: "Updated in the last 30 days."
  },
  {
    key: "unclassifiedForks",
    label: "Unclassified",
    description: "Still in watching state without a note."
  },
  {
    key: "cleanupCandidates",
    label: "Cleanup candidates",
    description: "Likely inactive or low-signal forks."
  },
  {
    key: "activeFavorites",
    label: "Favorites",
    description: "Marked as important or starred."
  }
] as const;

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="stats-grid" aria-label="Repository statistics">
      {STAT_ITEMS.map((item) => (
        <article className="stats-grid__card" key={item.key}>
          <p className="stats-grid__label">{item.label}</p>
          <p className="stats-grid__value">{stats[item.key]}</p>
          <p className="stats-grid__description">{item.description}</p>
        </article>
      ))}
    </section>
  );
}
