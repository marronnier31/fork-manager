import { db } from "../db";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

type DashboardRepository = {
  isFork: boolean;
  updatedAt: Date;
  isLikelyAbandoned: boolean;
  personal: {
    status: "active" | "watching" | "archive" | "cleanup";
    note: string | null;
    isFavorite: boolean;
  } | null;
};

export type DashboardStats = {
  totalForks: number;
  recentForks: number;
  unclassifiedForks: number;
  cleanupCandidates: number;
  activeFavorites: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const repositories = (await db.repository.findMany({
    include: { personal: true }
  })) as DashboardRepository[];
  const forkRepositories = repositories.filter((repository) => repository.isFork);

  const recentThreshold = new Date(Date.now() - THIRTY_DAYS_IN_MS);

  return {
    totalForks: forkRepositories.length,
    recentForks: forkRepositories.filter(
      (repository) => repository.updatedAt > recentThreshold
    ).length,
    unclassifiedForks: forkRepositories.filter(
      (repository) =>
        repository.personal?.status === "watching" &&
        !repository.personal.note
    ).length,
    cleanupCandidates: forkRepositories.filter(
      (repository) => repository.isLikelyAbandoned
    ).length,
    activeFavorites: forkRepositories.filter(
      (repository) => repository.personal?.isFavorite
    ).length
  };
}
