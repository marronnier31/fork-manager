import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unmock("../../../src/auth");
  vi.unmock("../../../src/lib/github/client");
  vi.unmock("../../../src/lib/github/repositories");
  vi.unmock("../../../src/lib/repos/upsert");
});

describe("sync route", () => {
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
    vi.doMock("../../../src/lib/github/client", async () => {
      const actual = await vi.importActual<typeof import("../../../src/lib/github/client")>(
        "../../../src/lib/github/client"
      );

      return {
        ...actual,
        fetchForkRepositories
      };
    });
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

  it("returns a controlled error when GitHub sync fails", async () => {
    const auth = vi.fn(async () => ({
      accessToken: "token",
      user: {
        accessToken: "token"
      }
    }));
    const { GitHubSyncError } = await import("../../../src/lib/github/client");
    const fetchForkRepositories = vi.fn(async () => {
      throw new GitHubSyncError("GitHub API request failed (403)", 502);
    });
    const normalizeForkRepositories = vi.fn();
    const upsertForkRepositories = vi.fn();

    vi.doMock("../../../src/auth", () => ({ auth }));
    vi.doMock("../../../src/lib/github/client", async () => {
      const actual = await vi.importActual<typeof import("../../../src/lib/github/client")>(
        "../../../src/lib/github/client"
      );

      return {
        ...actual,
        fetchForkRepositories
      };
    });
    vi.doMock("../../../src/lib/github/repositories", () => ({
      normalizeForkRepositories
    }));
    vi.doMock("../../../src/lib/repos/upsert", () => ({
      upsertForkRepositories
    }));

    const { POST } = await import("../../../src/app/api/sync/route");
    const response = await POST();

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "GitHub sync failed" });
    expect(normalizeForkRepositories).not.toHaveBeenCalled();
    expect(upsertForkRepositories).not.toHaveBeenCalled();
  });
});
