import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("repositories page", () => {
  it("shows repository filters, sync controls, and repository rows", async () => {
    const { ReposPageView } = await import("../../src/components/repos/repos-page");
    const markup = renderToStaticMarkup(
      ReposPageView({
        repositories: [
          {
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
              tags: "priority",
              note: "keep",
              savedReason: "Used in production",
              reviewLaterAt: null,
              isFavorite: true,
              lastReviewedAt: new Date("2026-04-12T00:00:00.000Z")
            }
          }
        ]
      })
    );

    expect(markup).toContain("Repositories");
    expect(markup).toContain("Search repositories");
    expect(markup).toContain("Status");
    expect(markup).toContain("Sync repositories");
    expect(markup).toContain("acme/fork-manager");
    expect(markup).toContain("active");
  });
});
