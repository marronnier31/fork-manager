import { afterEach, describe, expect, it, vi } from "vitest";

const originalGitHubClientId = process.env.GITHUB_CLIENT_ID;
const originalGitHubClientSecret = process.env.GITHUB_CLIENT_SECRET;

vi.mock("next-auth", () => ({
  default: (config: unknown) => ({
    handlers: {},
    auth: vi.fn(),
    config
  })
}));

vi.mock("next-auth/providers/github", () => ({
  default: (options: Record<string, unknown>) => ({
    id: "github",
    type: "oauth",
    name: "GitHub",
    options
  })
}));

afterEach(() => {
  if (originalGitHubClientId === undefined) {
    delete process.env.GITHUB_CLIENT_ID;
  } else {
    process.env.GITHUB_CLIENT_ID = originalGitHubClientId;
  }

  if (originalGitHubClientSecret === undefined) {
    delete process.env.GITHUB_CLIENT_SECRET;
  } else {
    process.env.GITHUB_CLIENT_SECRET = originalGitHubClientSecret;
  }

  vi.resetModules();
});

describe("auth config", () => {
  it("wires GitHub provider credentials from env", async () => {
    process.env.GITHUB_CLIENT_ID = "client-id";
    process.env.GITHUB_CLIENT_SECRET = "client-secret";

    vi.resetModules();

    const { authConfig } = await import("../../../src/auth");
    const provider = authConfig.providers[0] as {
      id?: string;
      type?: string;
      name?: string;
      options?: {
        clientId?: string;
        clientSecret?: string;
      };
    };

    expect(authConfig.providers).toHaveLength(1);
    expect(provider.id).toBe("github");
    expect(provider.type).toBe("oauth");
    expect(provider.name).toBe("GitHub");
    expect(provider.options).toMatchObject({
      clientId: "client-id",
      clientSecret: "client-secret"
    });
  });

  it("fails fast when GitHub env credentials are missing", async () => {
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;

    vi.resetModules();

    const { authConfig } = await import("../../../src/auth");

    expect(authConfig.providers).toEqual([]);
  });
});
