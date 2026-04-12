import type { ImportedRepository } from "../repos/types";
import type { GitHubRepositoryPayload } from "./client";

function toDate(value: string | undefined): Date {
  return new Date(value ?? 0);
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
      createdAt: toDate(repository.created_at),
      updatedAt: toDate(repository.updated_at),
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
