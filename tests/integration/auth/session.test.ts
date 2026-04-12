import { describe, expect, it } from "vitest";

describe("auth config", () => {
  it("uses GitHub as the configured provider", async () => {
    const { authConfig } = await import("../../../src/auth");

    expect(authConfig.providers).toHaveLength(1);
    expect(authConfig.providers[0].id).toBe("github");
  });
});
