import { describe, expect, it } from "vitest";

describe("normalizeReadmeText", () => {
  it("keeps markdown link text when the URL contains parentheses", async () => {
    const { normalizeReadmeText } = await import(
      "../../../src/lib/github/readme"
    );

    const normalized = normalizeReadmeText(
      "Read the [guide](https://example.com/docs/foo(bar)) for more."
    );

    expect(normalized).toContain("Read the guide for more.");
    expect(normalized).not.toContain("guide)");
  });
});
