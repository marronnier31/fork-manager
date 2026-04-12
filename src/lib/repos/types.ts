export type RepoStatus = "active" | "watching" | "archive" | "cleanup";

export type CommitState = "yes" | "no" | "unknown";

export interface ImportedRepository {
  repoId: number;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  isFork: boolean;
  parentFullName: string | null;
  topics: string[];
  primaryLanguage: string | null;
  stargazersCount: number;
  forksCount: number;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date | null;
  defaultBranch: string | null;
  summary: string | null;
  techStack: string[];
  category: string | null;
  hasReadme: boolean;
  readmeExcerpt: string | null;
  analyzedAt: Date | null;
  activityScore: number | null;
  cleanupReasons: string[];
  isLikelyAbandoned: boolean;
  hasMyCommits: CommitState;
}

export interface RepositoryPersonalMetadata {
  status: RepoStatus;
  tags: string[];
  note: string | null;
  savedReason: string | null;
  reviewLaterAt: Date | null;
  isFavorite: boolean;
  lastReviewedAt: Date | null;
}

export interface RepositoryRecord {
  github: ImportedRepository;
  personal: RepositoryPersonalMetadata;
}
