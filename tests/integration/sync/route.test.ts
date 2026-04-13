import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unmock("../../../src/auth");
  vi.unmock("../../../src/lib/github/client");
  vi.unmock("../../../src/lib/github/repositories");
  vi.unmock("../../../src/lib/repos/upsert");
});

describe("sync route", () => {
  it("returns the imported count after syncing fork repositories", async () => {
    const auth = vi.fn(async () => ({
      accessToken: "token",
      user: {
        accessToken: "token"
      }
    }));
    const fetchForkRepositories = vi.fn(async () => [
      {
        id: 1,
        fork: true,
        full_name: "owner/private-fork",
        owner: {
          login: "owner"
        },
        name: "private-fork",
        html_url: "https://github.com/owner/private-fork",
        description: "Private fork",
        parent: {
          full_name: "upstream/original"
        },
        topics: ["nextjs"],
        language: "TypeScript",
        stargazers_count: 3,
        forks_count: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        pushed_at: "2024-01-03T00:00:00Z",
        default_branch: "main",
        has_readme: true
      },
      {
        id: 2,
        fork: false,
        full_name: "owner/non-fork",
        owner: {
          login: "owner"
        },
        name: "non-fork",
        html_url: "https://github.com/owner/non-fork",
        description: null,
        topics: [],
        language: null,
        stargazers_count: 0,
        forks_count: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        pushed_at: null,
        default_branch: "main",
        has_readme: false
      }
    ]);
    const upsertForkRepositories = vi.fn(async (repositories: unknown[]) =>
      repositories.map((repository: unknown) => ({
        github: repository,
        personal: null
      }))
    );

    vi.doMock("../../../src/auth", () => ({ auth }));
    vi.doMock("../../../src/lib/github/client", () => ({ fetchForkRepositories }));
    vi.doMock("../../../src/lib/repos/upsert", () => ({
      upsertForkRepositories
    }));

    const { POST } = await import("../../../src/app/api/sync/route");
    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 1 });
    expect(fetchForkRepositories).toHaveBeenCalledTimes(1);
    expect(upsertForkRepositories).toHaveBeenCalledTimes(1);
  });

  it("returns unauthorized when the session has no GitHub access token", async () => {
    const auth = vi.fn(async () => ({
      user: {
        name: "Example User"
      }
    }));
    const fetchForkRepositories = vi.fn();
    const normalizeForkRepositories = vi.fn();
    const upsertForkRepositories = vi.fn();

    vi.doMock("../../../src/auth", () => ({ auth }));
    vi.doMock("../../../src/lib/github/client", () => ({ fetchForkRepositories }));
    vi.doMock("../../../src/lib/github/repositories", () => ({
      normalizeForkRepositories
    }));
    vi.doMock("../../../src/lib/repos/upsert", () => ({
      upsertForkRepositories
    }));

    const { POST } = await import("../../../src/app/api/sync/route");
    const response = await POST();

    expect(response.status).toBe(401);
    expect(fetchForkRepositories).not.toHaveBeenCalled();
    expect(normalizeForkRepositories).not.toHaveBeenCalled();
    expect(upsertForkRepositories).not.toHaveBeenCalled();
  });

  it("propagates controlled GitHub auth failures", async () => {
    const auth = vi.fn(async () => ({
      accessToken: "token",
      user: {
        accessToken: "token"
      }
    }));
    const fetchForkRepositories = vi.fn(async () => {
      throw {
        name: "GitHubSyncError",
        message: "GitHub API request failed (403)",
        status: 403
      };
    });
    const normalizeForkRepositories = vi.fn();
    const upsertForkRepositories = vi.fn();

    vi.doMock("../../../src/auth", () => ({ auth }));
    vi.doMock("../../../src/lib/github/client", () => ({ fetchForkRepositories }));
    vi.doMock("../../../src/lib/github/repositories", () => ({
      normalizeForkRepositories
    }));
    vi.doMock("../../../src/lib/repos/upsert", () => ({
      upsertForkRepositories
    }));

    const { POST } = await import("../../../src/app/api/sync/route");
    const response = await POST();

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "GitHub API request failed (403)" });
    expect(normalizeForkRepositories).not.toHaveBeenCalled();
    expect(upsertForkRepositories).not.toHaveBeenCalled();
  });

  it("returns a local sync failure for normalization errors", async () => {
    const auth = vi.fn(async () => ({
      accessToken: "token",
      user: {
        accessToken: "token"
      }
    }));
    const fetchForkRepositories = vi.fn(async () => [
      {
        id: 1,
        fork: true,
        full_name: "owner/private-fork",
        owner: {
          login: "owner"
        },
        name: "private-fork",
        html_url: "https://github.com/owner/private-fork",
        description: "Private fork",
        topics: ["nextjs"],
        language: "TypeScript",
        stargazers_count: 3,
        forks_count: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        pushed_at: "2024-01-03T00:00:00Z",
        default_branch: "main",
        has_readme: true
      }
    ]);
    const upsertForkRepositories = vi.fn();

    vi.doMock("../../../src/auth", () => ({ auth }));
    vi.doMock("../../../src/lib/github/client", () => ({ fetchForkRepositories }));
    vi.doMock("../../../src/lib/github/repositories", () => ({
      normalizeForkRepositories: vi.fn(() => {
        throw new Error("Invalid repository payload");
      })
    }));
    vi.doMock("../../../src/lib/repos/upsert", () => ({
      upsertForkRepositories
    }));

    const { POST } = await import("../../../src/app/api/sync/route");
    const response = await POST();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Repository normalization failed" });
    expect(upsertForkRepositories).not.toHaveBeenCalled();
  });
});
