import type { ImportedRepository } from "../repos/types";
import type { GitHubRepositoryPayload } from "./client";
import { scoreCleanupCandidate } from "../analysis/cleanup";
import { detectStackHints } from "../analysis/stack";
import { summarizeRepository } from "../analysis/summary";
import { extractReadmeExcerpt } from "./readme";

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
    .map((repository) => {
      const description = repository.description ?? null;
      const readme = repository.readme ?? null;
      const topics = repository.topics ?? [];
      const primaryLanguage = repository.language ?? null;
      const hasMyCommits = repository.hasMyCommits ?? "unknown";
      const analysisText = [description, readme, topics.join(" "), primaryLanguage]
        .filter((value): value is string => Boolean(value && value.trim()))
        .join(" ");
      const summary = summarizeRepository({ description, readme });
      const cleanup = scoreCleanupCandidate({
        updatedAt: requireDate(repository.updated_at, "updated_at"),
        hasMyCommits,
        note: "imported",
        tags: ["imported"],
        isFavorite: true,
        lastReviewedAt: new Date()
      });

      return {
        repoId: repository.id,
        owner: repository.owner.login,
        name: repository.name,
        fullName: repository.full_name,
        htmlUrl: repository.html_url ?? "",
        description,
        isFork: true,
        parentFullName: repository.parent?.full_name ?? null,
        topics,
        primaryLanguage,
        stargazersCount: repository.stargazers_count ?? 0,
        forksCount: repository.forks_count ?? 0,
        createdAt: requireDate(repository.created_at, "created_at"),
        updatedAt: requireDate(repository.updated_at, "updated_at"),
        pushedAt: repository.pushed_at ? new Date(repository.pushed_at) : null,
        defaultBranch: repository.default_branch ?? null,
        summary,
        techStack: detectStackHints(analysisText),
        category: topics[0] ?? primaryLanguage,
        hasReadme: Boolean(readme?.trim()) || (repository.has_readme ?? false),
        readmeExcerpt: readme ? extractReadmeExcerpt(readme, 120) : null,
        analyzedAt: new Date(),
        activityScore:
          (repository.stargazers_count ?? 0) + (repository.forks_count ?? 0),
        cleanupReasons: cleanup.reasons,
        isLikelyAbandoned: cleanup.isCandidate,
        hasMyCommits
      };
    });
}
