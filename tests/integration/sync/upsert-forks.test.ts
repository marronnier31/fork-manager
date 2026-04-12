import { describe, expect, it } from "vitest";

describe("upsert fork repositories", () => {
  it("persists fork fields and preserves personal metadata when imported fields refresh", async () => {
    const { upsertForkRepositories } = await import(
      "../../../src/lib/repos/upsert"
    );

    const result = await upsertForkRepositories([
      {
        repoId: 1,
        fullName: "me/example",
        description: "updated description"
      }
    ]);

    expect(result[0].github.repoId).toBe(1);
    expect(result[0].github.fullName).toBe("me/example");
    expect(result[0].github.isFork).toBe(true);
    expect(result[0].github.description).toBe("updated description");
    expect(result[0].personal.status).toBe("watching");
    expect(result[0].personal.note).toBe("keep for later");
  });
});
