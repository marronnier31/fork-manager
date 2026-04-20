import { db } from "../db";
import type {
  CommitState,
  ImportedRepository,
  RepositoryPersonalMetadata,
  RepoStatus
} from "./types";

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

type RepositoryRow = {
  id?: string;
  repoId: number;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  isFork: boolean;
  parentFullName: string | null;
  topics: string;
  primaryLanguage: string | null;
  stargazersCount: number;
  forksCount: number;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date | null;
  defaultBranch: string | null;
  summary: string | null;
  techStack: string;
  category: string | null;
  hasReadme: boolean;
  readmeExcerpt: string | null;
  analyzedAt: Date | null;
  activityScore: number | null;
  cleanupReasons: string;
  isLikelyAbandoned: boolean;
  hasMyCommits: CommitState;
  personal:
    | {
        status: RepoStatus;
        tags: string;
        note: string | null;
        savedReason: string | null;
        reviewLaterAt: Date | null;
        isFavorite: boolean;
        lastReviewedAt: Date | null;
      }
    | null;
};

export type ListedRepository = ImportedRepository & {
  id?: string;
  personal: RepositoryPersonalMetadata | null;
};

export type ListRepositoriesFilters = {
  search?: string;
  status?: RepoStatus | "all";
  commits?: CommitState | "all";
  tag?: string;
};

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function hydrateRepository(record: RepositoryRow): ListedRepository {
  return {
    id: record.id,
    repoId: record.repoId,
    owner: record.owner,
    name: record.name,
    fullName: record.fullName,
    htmlUrl: record.htmlUrl,
    description: record.description,
    isFork: record.isFork,
    parentFullName: record.parentFullName,
    topics: parseStringArray(record.topics),
    primaryLanguage: record.primaryLanguage,
    stargazersCount: record.stargazersCount,
    forksCount: record.forksCount,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    pushedAt: record.pushedAt,
    defaultBranch: record.defaultBranch,
    summary: record.summary,
    techStack: parseStringArray(record.techStack),
    category: record.category,
    hasReadme: record.hasReadme,
    readmeExcerpt: record.readmeExcerpt,
    analyzedAt: record.analyzedAt,
    activityScore: record.activityScore,
    cleanupReasons: parseStringArray(record.cleanupReasons),
    isLikelyAbandoned: record.isLikelyAbandoned,
    hasMyCommits: record.hasMyCommits,
    personal: record.personal
      ? {
          ...record.personal,
          tags: parseStringArray(record.personal.tags)
        }
      : null
  };
}

function matchesSearch(repository: ListedRepository, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [
    repository.fullName,
    repository.description,
    repository.summary,
    repository.readmeExcerpt,
    repository.personal?.note,
    repository.primaryLanguage,
    repository.category,
    repository.techStack.join(" "),
    repository.topics.join(" "),
    repository.personal?.tags.join(" ")
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
}

function matchesStatus(repository: ListedRepository, status: ListRepositoriesFilters["status"]) {
  if (!status || status === "all") {
    return true;
  }

  return repository.personal?.status === status;
}

function matchesCommitState(
  repository: ListedRepository,
  commits: ListRepositoriesFilters["commits"]
) {
  if (!commits || commits === "all") {
    return true;
  }

  return repository.hasMyCommits === commits;
}

function matchesTag(repository: ListedRepository, tag: string) {
  if (!tag) {
    return true;
  }

  return repository.personal?.tags.some((value) => value.toLowerCase().includes(tag)) ?? false;
}

export async function listRepositories(
  filters: ListRepositoriesFilters = {}
): Promise<ListedRepository[]> {
  const records = (await db.repository.findMany({
    where: { isFork: true },
    include: { personal: true },
    orderBy: [{ updatedAt: "desc" }, { fullName: "asc" }]
  })) as RepositoryRow[];
  const normalizedSearch = filters.search?.trim().toLowerCase() ?? "";
  const normalizedTag = filters.tag?.trim().toLowerCase() ?? "";

  return records
    .map(hydrateRepository)
    .filter((repository) => matchesStatus(repository, filters.status))
    .filter((repository) => matchesCommitState(repository, filters.commits))
    .filter((repository) => matchesTag(repository, normalizedTag))
    .filter((repository) => matchesSearch(repository, normalizedSearch));
}

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
