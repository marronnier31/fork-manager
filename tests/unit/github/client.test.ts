import { afterEach, describe, expect, it, vi } from "vitest";

const originalFetch = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("fetchForkRepositories", () => {
  it("enriches fork repositories with README content and viewer commit state", async () => {
    const { fetchForkRepositories } = await import(
      "../../../src/lib/github/client"
    );

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ login: "marro" }))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            fork: true,
            full_name: "marro/example",
            owner: { login: "workspace-owner" },
            name: "example",
            html_url: "https://github.com/marro/example",
            description: "Example repository",
            topics: ["nextjs"],
            language: "TypeScript",
            stargazers_count: 2,
            forks_count: 1,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
            pushed_at: "2024-01-03T00:00:00Z",
            default_branch: "main"
          }
        ])
      )
      .mockResolvedValueOnce(new Response("# Example README", { status: 200 }))
      .mockResolvedValueOnce(
        jsonResponse([{ author: { login: "marro" } }])
      );

    global.fetch = fetchMock as typeof fetch;

    const repositories = await fetchForkRepositories({ accessToken: "token" });

    expect(repositories).toHaveLength(1);
    expect(repositories[0]).toMatchObject({
      full_name: "marro/example",
      readme: "# Example README",
      hasMyCommits: "yes"
    });
  });

  it("degrades repository enrichment when README or commit lookups fail", async () => {
    const { fetchForkRepositories } = await import(
      "../../../src/lib/github/client"
    );

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ login: "marro" }))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            fork: true,
            full_name: "marro/example",
            owner: { login: "workspace-owner" },
            name: "example",
            html_url: "https://github.com/marro/example",
            description: "Example repository",
            topics: [],
            language: "TypeScript",
            stargazers_count: 0,
            forks_count: 0,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
            pushed_at: "2024-01-03T00:00:00Z",
            default_branch: "main"
          }
        ])
      )
      .mockResolvedValueOnce(new Response("boom", { status: 500 }))
      .mockResolvedValueOnce(new Response("boom", { status: 500 }));

    global.fetch = fetchMock as typeof fetch;

    const repositories = await fetchForkRepositories({ accessToken: "token" });

    expect(repositories[0]).toMatchObject({
      full_name: "marro/example",
      readme: null,
      hasMyCommits: "unknown"
    });
  });

  it("degrades commit enrichment when viewer login lookup fails", async () => {
    const { fetchForkRepositories } = await import(
      "../../../src/lib/github/client"
    );

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("boom", { status: 500 }))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            fork: true,
            full_name: "marro/example",
            owner: { login: "workspace-owner" },
            name: "example",
            html_url: "https://github.com/marro/example",
            description: "Example repository",
            topics: [],
            language: "TypeScript",
            stargazers_count: 0,
            forks_count: 0,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
            pushed_at: "2024-01-03T00:00:00Z",
            default_branch: "main"
          }
        ])
      )
      .mockResolvedValueOnce(new Response("# Example README", { status: 200 }));

    global.fetch = fetchMock as typeof fetch;

    const repositories = await fetchForkRepositories({ accessToken: "token" });

    expect(repositories[0]).toMatchObject({
      full_name: "marro/example",
      readme: "# Example README",
      hasMyCommits: "unknown"
    });
  });

  it("returns unknown when commit authors are not linked to GitHub logins", async () => {
    const { fetchForkRepositories } = await import(
      "../../../src/lib/github/client"
    );

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ login: "marro" }))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            fork: true,
            full_name: "marro/example",
            owner: { login: "workspace-owner" },
            name: "example",
            html_url: "https://github.com/marro/example",
            description: "Example repository",
            topics: [],
            language: "TypeScript",
            stargazers_count: 0,
            forks_count: 0,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
            pushed_at: "2024-01-03T00:00:00Z",
            default_branch: "main"
          }
        ])
      )
      .mockResolvedValueOnce(new Response("# Example README", { status: 200 }))
      .mockResolvedValueOnce(
        jsonResponse([{ author: null, commit: { author: { name: "marro" } } }])
      );

    global.fetch = fetchMock as typeof fetch;

    const repositories = await fetchForkRepositories({ accessToken: "token" });

    expect(repositories[0]).toMatchObject({
      full_name: "marro/example",
      hasMyCommits: "unknown"
    });
  });
});
