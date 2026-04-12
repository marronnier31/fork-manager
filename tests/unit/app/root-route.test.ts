import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("root route", () => {
  it("redirects the page component to the dashboard entry point", async () => {
    const page = await import("../../../src/app/page");
    const { redirect } = await import("next/navigation");

    expect("GET" in page).toBe(false);

    page.default();

    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
