import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("repositories page", () => {
  it("shows repository filters, sync controls, and repository rows", async () => {
    const { ReposPageView } = await import("../../src/components/repos/repos-page");
    const markup = renderToStaticMarkup(
      ReposPageView({
        repositories: [
          {
            id: "repo-1",
            repoId: 1,
            owner: "acme",
            name: "fork-manager",
            fullName: "acme/fork-manager",
            htmlUrl: "https://github.com/acme/fork-manager",
            description: "Keep track of useful forks",
            isFork: true,
            parentFullName: "upstream/fork-manager",
            topics: ["nextjs", "forks"],
            primaryLanguage: "TypeScript",
            stargazersCount: 24,
            forksCount: 8,
            createdAt: new Date("2025-12-10T00:00:00.000Z"),
            updatedAt: new Date("2026-04-12T00:00:00.000Z"),
            pushedAt: new Date("2026-04-11T00:00:00.000Z"),
            defaultBranch: "main",
            summary: "Repository dashboard",
            techStack: ["Next.js", "TypeScript"],
            category: "nextjs",
            hasReadme: true,
            readmeExcerpt: "Useful repository overview",
            analyzedAt: new Date("2026-04-12T00:00:00.000Z"),
            activityScore: 32,
            cleanupReasons: ["No recent updates"],
            isLikelyAbandoned: false,
            hasMyCommits: "yes",
            personal: {
              status: "active",
              tags: ["priority"],
              note: "keep",
              savedReason: "Used in production",
              reviewLaterAt: null,
              isFavorite: true,
              lastReviewedAt: new Date("2026-04-12T00:00:00.000Z")
            }
          },
          {
            id: "repo-2",
            repoId: 2,
            owner: "acme",
            name: "starter-kit",
            fullName: "acme/starter-kit",
            htmlUrl: "https://github.com/acme/starter-kit",
            description: "Starter template",
            isFork: true,
            parentFullName: "upstream/starter-kit",
            topics: ["starter", "react"],
            primaryLanguage: "TypeScript",
            stargazersCount: 10,
            forksCount: 5,
            createdAt: new Date("2025-12-10T00:00:00.000Z"),
            updatedAt: new Date("2026-04-10T00:00:00.000Z"),
            pushedAt: new Date("2026-04-10T00:00:00.000Z"),
            defaultBranch: "main",
            summary: "Starter kit for web apps",
            techStack: ["React", "TypeScript"],
            category: "starter",
            hasReadme: true,
            readmeExcerpt: "Starter repo",
            analyzedAt: new Date("2026-04-12T00:00:00.000Z"),
            activityScore: 20,
            cleanupReasons: ["No user commits"],
            isLikelyAbandoned: true,
            hasMyCommits: "no",
            personal: {
              status: "watching",
              tags: ["starter"],
              note: null,
              savedReason: null,
              reviewLaterAt: null,
              isFavorite: false,
              lastReviewedAt: null
            }
          }
        ]
      })
    );

    expect(markup).toContain("Repositories");
    expect(markup).toContain("Search repositories");
    expect(markup).toContain("Status");
    expect(markup).toContain("My commits");
    expect(markup).toContain("Tag");
    expect(markup).toContain("Sync GitHub");
    expect(markup).toContain("Cleanup Queue");
    expect(markup).toContain("acme/fork-manager");
    expect(markup).toContain("Active");
    expect(markup).toContain("Has my commits");
    expect(markup).toContain("Tags: priority");
    expect(markup).toContain('href="/repos/repo-1"');
    expect(markup).toContain("Open on GitHub");
  });

  it("filters repositories by search, status, commit state, and tag", async () => {
    const { ReposPageView } = await import("../../src/components/repos/repos-page");
    const markup = renderToStaticMarkup(
      ReposPageView({
        repositories: [
          {
            id: "repo-1",
            repoId: 1,
            owner: "acme",
            name: "fork-manager",
            fullName: "acme/fork-manager",
            htmlUrl: "https://github.com/acme/fork-manager",
            description: "Keep track of useful forks",
            isFork: true,
            parentFullName: "upstream/fork-manager",
            topics: ["nextjs", "forks"],
            primaryLanguage: "TypeScript",
            stargazersCount: 24,
            forksCount: 8,
            createdAt: new Date("2025-12-10T00:00:00.000Z"),
            updatedAt: new Date("2026-04-12T00:00:00.000Z"),
            pushedAt: new Date("2026-04-11T00:00:00.000Z"),
            defaultBranch: "main",
            summary: "Repository dashboard",
            techStack: ["Next.js", "TypeScript"],
            category: "nextjs",
            hasReadme: true,
            readmeExcerpt: "Useful repository overview",
            analyzedAt: new Date("2026-04-12T00:00:00.000Z"),
            activityScore: 32,
            cleanupReasons: ["No recent updates"],
            isLikelyAbandoned: false,
            hasMyCommits: "yes",
            personal: {
              status: "active",
              tags: ["priority"],
              note: "keep",
              savedReason: "Used in production",
              reviewLaterAt: null,
              isFavorite: true,
              lastReviewedAt: new Date("2026-04-12T00:00:00.000Z")
            }
          },
          {
            id: "repo-2",
            repoId: 2,
            owner: "acme",
            name: "starter-kit",
            fullName: "acme/starter-kit",
            htmlUrl: "https://github.com/acme/starter-kit",
            description: "Starter template",
            isFork: true,
            parentFullName: "upstream/starter-kit",
            topics: ["starter", "react"],
            primaryLanguage: "TypeScript",
            stargazersCount: 10,
            forksCount: 5,
            createdAt: new Date("2025-12-10T00:00:00.000Z"),
            updatedAt: new Date("2026-04-10T00:00:00.000Z"),
            pushedAt: new Date("2026-04-10T00:00:00.000Z"),
            defaultBranch: "main",
            summary: "Starter kit for web apps",
            techStack: ["React", "TypeScript"],
            category: "starter",
            hasReadme: true,
            readmeExcerpt: "Starter repo",
            analyzedAt: new Date("2026-04-12T00:00:00.000Z"),
            activityScore: 20,
            cleanupReasons: ["No user commits"],
            isLikelyAbandoned: true,
            hasMyCommits: "no",
            personal: {
              status: "watching",
              tags: ["starter"],
              note: null,
              savedReason: null,
              reviewLaterAt: null,
              isFavorite: false,
              lastReviewedAt: null
            }
          }
        ],
        searchParams: {
          search: "starter",
          status: "watching",
          commits: "no",
          tag: "starter"
        }
      })
    );

    expect(markup).toContain("acme/starter-kit");
    expect(markup).not.toContain("acme/fork-manager");
    expect(markup).toContain("No personal commits");
  });
});
