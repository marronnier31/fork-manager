import { describe, expect, it } from "vitest";

describe("root route", () => {
  it("redirects to the dashboard entry point", async () => {
    const { GET } = await import("../../../src/app/page");
    const response = await GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/dashboard");
  });
});
