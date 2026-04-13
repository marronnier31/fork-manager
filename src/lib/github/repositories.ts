import type { ImportedRepository } from "../repos/types";
import type { GitHubRepositoryPayload } from "./client";

function requireDate(value: string | undefined, field: string): Date {
  if (!value) {
    throw new Error(`Incomplete GitHub repository payload: missing ${field}`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Incomplete GitHub repository payload: invalid ${field}`);
  }

  return date;
}

export function normalizeForkRepositories(
  payload: GitHubRepositoryPayload[]
): ImportedRepository[] {
  return payload
    .filter((repository) => repository.fork)
    .map((repository) => ({
      repoId: repository.id,
      owner: repository.owner.login,
      name: repository.name,
      fullName: repository.full_name,
      htmlUrl: repository.html_url ?? "",
      description: repository.description ?? null,
      isFork: true,
      parentFullName: repository.parent?.full_name ?? null,
      topics: repository.topics ?? [],
      primaryLanguage: repository.language ?? null,
      stargazersCount: repository.stargazers_count ?? 0,
      forksCount: repository.forks_count ?? 0,
      createdAt: requireDate(repository.created_at, "created_at"),
      updatedAt: requireDate(repository.updated_at, "updated_at"),
      pushedAt: repository.pushed_at ? new Date(repository.pushed_at) : null,
      defaultBranch: repository.default_branch ?? null,
      summary: null,
      techStack: [],
      category: null,
      hasReadme: repository.has_readme ?? false,
      readmeExcerpt: null,
      analyzedAt: null,
      activityScore: null,
      cleanupReasons: [],
      isLikelyAbandoned: false,
      hasMyCommits: "unknown"
    }));
}
