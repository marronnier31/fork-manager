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

  it("removes image markdown cleanly when the image URL contains parentheses", async () => {
    const { normalizeReadmeText } = await import(
      "../../../src/lib/github/readme"
    );

    const normalized = normalizeReadmeText(
      "See ![diagram](https://example.com/a(b).png) and [guide](https://example.com/x(y))."
    );

    expect(normalized).toContain("See and guide.");
    expect(normalized).not.toContain(".png)");
  });
});
