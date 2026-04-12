import { db } from "../db";
import type {
  ImportedRepository,
  RepositoryPersonalMetadata,
  RepositoryRecord
} from "./types";

type RepositoryUpsertResult = {
  personal: RepositoryPersonalMetadata | null;
  [key: string]: unknown;
};

export interface RepositoryDatabase {
  repository: {
    findUnique(args: {
      where: {
        repoId: number;
      };
      include?: {
        personal: true;
      };
    }): Promise<RepositoryUpsertResult | null>;
    upsert(args: {
      where: {
        repoId: number;
      };
      create: Record<string, unknown>;
      update: Record<string, unknown>;
      include?: {
        personal: true;
      };
    }): Promise<RepositoryUpsertResult>;
  };
}

function serializeRepository(repository: ImportedRepository) {
  return {
    repoId: repository.repoId,
    owner: repository.owner,
    name: repository.name,
    fullName: repository.fullName,
    htmlUrl: repository.htmlUrl,
    description: repository.description,
    isFork: repository.isFork,
    parentFullName: repository.parentFullName,
    topics: JSON.stringify(repository.topics),
    primaryLanguage: repository.primaryLanguage,
    stargazersCount: repository.stargazersCount,
    forksCount: repository.forksCount,
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
    pushedAt: repository.pushedAt,
    defaultBranch: repository.defaultBranch,
    summary: repository.summary,
    techStack: JSON.stringify(repository.techStack),
    category: repository.category,
    hasReadme: repository.hasReadme,
    readmeExcerpt: repository.readmeExcerpt,
    analyzedAt: repository.analyzedAt,
    activityScore: repository.activityScore,
    cleanupReasons: JSON.stringify(repository.cleanupReasons),
    isLikelyAbandoned: repository.isLikelyAbandoned,
    hasMyCommits: repository.hasMyCommits
  };
}

export async function upsertForkRepositories(
  repositories: ImportedRepository[],
  client: RepositoryDatabase = db as unknown as RepositoryDatabase
): Promise<RepositoryRecord[]> {
  const results: RepositoryRecord[] = [];

  for (const repository of repositories) {
    const existing = await client.repository.findUnique({
      where: { repoId: repository.repoId },
      include: { personal: true }
    });

    const record = await client.repository.upsert({
      where: { repoId: repository.repoId },
      create: {
        ...serializeRepository(repository),
        personal: {
          create: {}
        }
      },
      update: serializeRepository(repository),
      include: { personal: true }
    });

    results.push({
      github: repository,
      personal: record.personal ?? existing?.personal ?? null
    });
  }

  return results;
}
