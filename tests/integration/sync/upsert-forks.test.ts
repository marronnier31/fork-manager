import type { ImportedRepository } from "../../../src/lib/repos/types";
import { describe, expect, it } from "vitest";

describe("upsert fork repositories", () => {
  it("keeps only forks when normalizing GitHub payloads", async () => {
    const { normalizeForkRepositories } = await import(
      "../../../src/lib/github/repositories"
    );

    const normalized = normalizeForkRepositories([
      {
        id: 1,
        fork: true,
        full_name: "me/example",
        owner: { login: "me" },
        name: "example",
        html_url: "https://github.com/me/example",
        description: "updated description",
        parent: { full_name: "upstream/example" },
        topics: ["typescript"],
        language: "TypeScript",
        stargazers_count: 12,
        forks_count: 3,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-02-01T00:00:00.000Z",
        pushed_at: "2024-02-02T00:00:00.000Z",
        default_branch: "main",
        has_readme: true
      },
      {
        id: 2,
        fork: false,
        full_name: "me/ignored",
        owner: { login: "me" },
        name: "ignored"
      }
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toMatchObject({
      repoId: 1,
      fullName: "me/example",
      isFork: true,
      parentFullName: "upstream/example"
    });
  });

  it("rejects incomplete repository payloads without timestamps", async () => {
    const { normalizeForkRepositories } = await import(
      "../../../src/lib/github/repositories"
    );

    expect(() =>
      normalizeForkRepositories([
        {
          id: 1,
          fork: true,
          full_name: "me/example",
          owner: { login: "me" },
          name: "example",
          created_at: "2024-01-01T00:00:00.000Z"
        }
      ] as never)
    ).toThrow("Incomplete GitHub repository payload");
  });

  it("preserves personal metadata when imported fields refresh", async () => {
    const { upsertForkRepositories } = await import(
      "../../../src/lib/repos/upsert"
    );

    const importedRepository: ImportedRepository = {
      repoId: 1,
      owner: "me",
      name: "example",
      fullName: "me/example",
      htmlUrl: "https://github.com/me/example",
      description: "updated description",
      isFork: true,
      parentFullName: "upstream/example",
      topics: ["typescript"],
      primaryLanguage: "TypeScript",
      stargazersCount: 12,
      forksCount: 3,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-02-01T00:00:00.000Z"),
      pushedAt: new Date("2024-02-02T00:00:00.000Z"),
      defaultBranch: "main",
      summary: null,
      techStack: ["Next.js", "Prisma"],
      category: null,
      hasReadme: true,
      readmeExcerpt: "Starter repo",
      analyzedAt: null,
      activityScore: null,
      cleanupReasons: [],
      isLikelyAbandoned: false,
      hasMyCommits: "unknown"
    };

    const existingPersonal = {
      status: "watching" as const,
      tags: ["keep"],
      note: "keep for later",
      savedReason: null,
      reviewLaterAt: null,
      isFavorite: true,
      lastReviewedAt: null
    };

    const fakeDb = {
      repository: {
        upsert: async () => ({ personal: existingPersonal })
      }
    };

    const result = await upsertForkRepositories([importedRepository], fakeDb);

    expect(result[0].github).toMatchObject({
      repoId: 1,
      fullName: "me/example",
      isFork: true,
      description: "updated description"
    });
    expect(result[0].personal).toEqual(existingPersonal);
  });
});
