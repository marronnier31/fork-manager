import React from "react";
import { AppShell } from "../../../components/layout/app-shell";
import { RepoDetailCard } from "../../../components/repos/repo-detail-card";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

function parseStringArray(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseNullableDate(value: Date | null | undefined) {
  return value ? value : null;
}

export default async function RepoDetailPage({ params }: PageParams) {
  const { id } = await Promise.resolve(params);
  const repository = await db.repository.findUnique({
    where: { id },
    include: { personal: true }
  });

  if (!repository) {
    return (
      <AppShell title="Repository not found" subtitle="The requested repository no longer exists.">
        <p>Nothing to show here.</p>
      </AppShell>
    );
  }

  const personal = repository.personal
    ? {
        ...repository.personal,
        tags: parseStringArray(repository.personal.tags)
      }
    : null;

  return (
    <AppShell
      title={repository.fullName}
      subtitle="Inspect the imported fork details and edit your personal metadata."
    >
      <RepoDetailCard
        repository={{
          id: repository.id,
          repoId: repository.repoId,
          owner: repository.owner,
          name: repository.name,
          fullName: repository.fullName,
          htmlUrl: repository.htmlUrl,
          description: repository.description,
          isFork: repository.isFork,
          parentFullName: repository.parentFullName,
          topics: parseStringArray(repository.topics),
          primaryLanguage: repository.primaryLanguage,
          stargazersCount: repository.stargazersCount,
          forksCount: repository.forksCount,
          createdAt: repository.createdAt,
          updatedAt: repository.updatedAt,
          pushedAt: parseNullableDate(repository.pushedAt),
          defaultBranch: repository.defaultBranch,
          summary: repository.summary,
          techStack: parseStringArray(repository.techStack),
          category: repository.category,
          hasReadme: repository.hasReadme,
          readmeExcerpt: repository.readmeExcerpt,
          analyzedAt: repository.analyzedAt,
          activityScore: repository.activityScore,
          cleanupReasons: parseStringArray(repository.cleanupReasons),
          isLikelyAbandoned: repository.isLikelyAbandoned,
          hasMyCommits: repository.hasMyCommits,
          personal
        }}
      />
    </AppShell>
  );
}
