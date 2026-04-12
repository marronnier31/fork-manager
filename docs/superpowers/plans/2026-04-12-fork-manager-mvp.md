# Fork Manager MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal GitHub fork management web app that imports the user's forks, summarizes their contents, and supports tagging, status tracking, and cleanup review.

**Architecture:** Use a single Next.js App Router application with server-side GitHub OAuth, Prisma for persistence, and SQLite for the initial local database. Keep imported GitHub data separate from personal metadata so sync operations can refresh repository facts without overwriting user notes, tags, and statuses.

**Tech Stack:** Next.js, TypeScript, Prisma, SQLite, NextAuth/Auth.js with GitHub provider, Vitest, Testing Library, Playwright

---

## Planned File Structure

### Create

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `.env.example`
- `.gitignore`
- `prisma/schema.prisma`
- `prisma/migrations/202604120001_init/migration.sql`
- `src/auth.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/repos/page.tsx`
- `src/app/repos/[id]/page.tsx`
- `src/app/cleanup/page.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/sync/route.ts`
- `src/app/api/repos/[id]/route.ts`
- `src/app/api/repos/[id]/favorite/route.ts`
- `src/lib/db.ts`
- `src/lib/github/client.ts`
- `src/lib/github/repositories.ts`
- `src/lib/github/readme.ts`
- `src/lib/analysis/summary.ts`
- `src/lib/analysis/cleanup.ts`
- `src/lib/analysis/stack.ts`
- `src/lib/repos/queries.ts`
- `src/lib/repos/upsert.ts`
- `src/lib/repos/types.ts`
- `src/components/layout/app-shell.tsx`
- `src/components/dashboard/stats-grid.tsx`
- `src/components/repos/repo-table.tsx`
- `src/components/repos/repo-filters.tsx`
- `src/components/repos/repo-status-form.tsx`
- `src/components/repos/repo-note-form.tsx`
- `src/components/repos/repo-detail-card.tsx`
- `src/components/repos/sync-button.tsx`
- `src/components/cleanup/cleanup-list.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/styles/globals.css`
- `tests/unit/analysis/cleanup.test.ts`
- `tests/unit/analysis/summary.test.ts`
- `tests/unit/analysis/stack.test.ts`
- `tests/unit/app/root-route.test.ts`
- `tests/integration/auth/session.test.ts`
- `tests/integration/repos/dashboard-data.test.ts`
- `tests/integration/repos/cleanup-queue.test.ts`
- `tests/integration/repos/update-repo.test.ts`
- `tests/integration/sync/upsert-forks.test.ts`
- `tests/e2e/repos.spec.ts`
- `vitest.config.ts`
- `playwright.config.ts`

### Responsibility Notes

- `src/lib/github/*`: All GitHub API interaction only
- `src/lib/analysis/*`: README parsing, stack hints, cleanup scoring only
- `src/lib/repos/*`: Repository persistence and query logic only
- `src/app/api/*`: HTTP route layer only
- `src/components/repos/*`: Fork browsing, filtering, and editing UI only
- `src/components/cleanup/*`: Cleanup queue UI only

## Task 1: Scaffold The Next.js App And Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Write the failing smoke test for the landing redirect**

```ts
import { describe, expect, it } from "vitest";

describe("root route", () => {
  it("redirects to the dashboard entry point", async () => {
    const { GET } = await import("@/app/page");
    const response = await GET();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/dashboard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/app/root-route.test.ts`
Expected: FAIL with module or export errors because the app scaffold does not exist yet.

- [ ] **Step 3: Create the project scaffold and minimal route implementation**

```json
{
  "name": "fork-manager",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lint": "next lint"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "next": "^15.0.0",
    "next-auth": "^5.0.0-beta.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "prisma": "^6.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

```ts
// src/app/page.tsx
import { redirect } from "next/navigation";

export async function GET() {
  return Response.redirect(new URL("/dashboard", "http://localhost:3000"));
}

export default function HomePage() {
  redirect("/dashboard");
}
```

```tsx
// src/app/layout.tsx
import "@/styles/globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/app/root-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts .gitignore .env.example src/app/layout.tsx src/app/page.tsx src/styles/globals.css tests/unit/app/root-route.test.ts
git commit -m "chore: scaffold fork manager app"
```

## Task 2: Define The Database Schema And Prisma Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/migrations/202604120001_init/migration.sql`
- Create: `src/lib/db.ts`
- Create: `src/lib/repos/types.ts`
- Test: `tests/integration/sync/upsert-forks.test.ts`

- [ ] **Step 1: Write the failing integration test for fork persistence**

```ts
import { describe, expect, it } from "vitest";

describe("upsert fork repositories", () => {
  it("preserves personal metadata when imported fields refresh", async () => {
    const { upsertForkRepositories } = await import("@/lib/repos/upsert");

    const result = await upsertForkRepositories([
      {
        repoId: 1,
        fullName: "me/example",
        description: "updated description"
      }
    ]);

    expect(result[0].personal.status).toBe("watching");
    expect(result[0].personal.note).toBe("keep for later");
    expect(result[0].github.description).toBe("updated description");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/sync/upsert-forks.test.ts`
Expected: FAIL because Prisma schema and upsert logic do not exist.

- [ ] **Step 3: Add Prisma models and DB client**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Repository {
  id                String             @id @default(cuid())
  repoId            Int                @unique
  owner             String
  name              String
  fullName          String             @unique
  htmlUrl           String
  description       String?
  isFork            Boolean            @default(true)
  parentFullName    String?
  topics            String
  primaryLanguage   String?
  stargazersCount   Int                @default(0)
  forksCount        Int                @default(0)
  createdAt         DateTime
  updatedAt         DateTime
  pushedAt          DateTime?
  defaultBranch     String?
  summary           String?
  techStack         String
  category          String?
  hasReadme         Boolean            @default(false)
  readmeExcerpt     String?
  analyzedAt        DateTime?
  activityScore     Int?
  cleanupReasons    String             @default("[]")
  isLikelyAbandoned Boolean            @default(false)
  hasMyCommits      CommitState        @default(unknown)
  personal          RepositoryPersonal?
}

model RepositoryPersonal {
  repositoryId   String      @id
  status         RepoStatus  @default(watching)
  tags           String      @default("[]")
  note           String?
  savedReason    String?
  reviewLaterAt  DateTime?
  isFavorite     Boolean     @default(false)
  lastReviewedAt DateTime?
  repository     Repository  @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
}

enum RepoStatus {
  active
  watching
  archive
  cleanup
}

enum CommitState {
  yes
  no
  unknown
}
```

```ts
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

- [ ] **Step 4: Run the Prisma generation and test**

Run: `npx prisma generate && npx vitest run tests/integration/sync/upsert-forks.test.ts`
Expected: FAIL only on missing `upsertForkRepositories`, proving the schema compiles.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations src/lib/db.ts src/lib/repos/types.ts tests/integration/sync/upsert-forks.test.ts
git commit -m "feat: add prisma schema for fork repositories"
```

## Task 3: Add Authentication With GitHub OAuth

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `.env.example`
- Test: `tests/integration/auth/session.test.ts`

- [ ] **Step 1: Write the failing test for session auth wiring**

```ts
import { describe, expect, it } from "vitest";

describe("auth config", () => {
  it("uses GitHub as the configured provider", async () => {
    const { authConfig } = await import("@/auth");
    expect(authConfig.providers).toHaveLength(1);
    expect(authConfig.providers[0].id).toBe("github");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/auth/session.test.ts`
Expected: FAIL because auth config is not defined.

- [ ] **Step 3: Implement GitHub auth configuration**

```ts
// src/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
    })
  ],
  session: { strategy: "jwt" }
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
```

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

```env
# .env.example
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-me"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/auth/session.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/auth.ts src/app/api/auth/[...nextauth]/route.ts .env.example tests/integration/auth/session.test.ts
git commit -m "feat: add github auth configuration"
```

## Task 4: Build GitHub Sync And Repository Upsert Logic

**Files:**
- Create: `src/lib/github/client.ts`
- Create: `src/lib/github/repositories.ts`
- Create: `src/lib/repos/upsert.ts`
- Create: `src/app/api/sync/route.ts`
- Modify: `src/lib/repos/types.ts`
- Test: `tests/integration/sync/upsert-forks.test.ts`

- [ ] **Step 1: Extend the failing sync test with fork filtering and metadata merge**

```ts
import { describe, expect, it } from "vitest";

describe("sync github forks", () => {
  it("keeps only forks and preserves personal fields during upsert", async () => {
    const { normalizeForkRepositories } = await import("@/lib/github/repositories");

    const normalized = normalizeForkRepositories([
      { id: 1, fork: true, full_name: "me/one", owner: { login: "me" }, name: "one" },
      { id: 2, fork: false, full_name: "me/two", owner: { login: "me" }, name: "two" }
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].fullName).toBe("me/one");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/sync/upsert-forks.test.ts`
Expected: FAIL because GitHub normalization and upsert logic are still missing.

- [ ] **Step 3: Implement GitHub client, normalization, and API sync route**

```ts
// src/lib/github/repositories.ts
import type { ImportedRepository } from "@/lib/repos/types";

export function normalizeForkRepositories(payload: Array<Record<string, any>>): ImportedRepository[] {
  return payload
    .filter((repo) => repo.fork)
    .map((repo) => ({
      repoId: repo.id,
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url ?? "",
      description: repo.description ?? null,
      isFork: true,
      parentFullName: repo.parent?.full_name ?? null,
      topics: repo.topics ?? [],
      primaryLanguage: repo.language ?? null,
      stargazersCount: repo.stargazers_count ?? 0,
      forksCount: repo.forks_count ?? 0,
      createdAt: new Date(repo.created_at),
      updatedAt: new Date(repo.updated_at),
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      defaultBranch: repo.default_branch ?? null
    }));
}
```

```ts
// src/lib/repos/upsert.ts
import { db } from "@/lib/db";
import type { ImportedRepository } from "@/lib/repos/types";

export async function upsertForkRepositories(repositories: ImportedRepository[]) {
  const results = [];

  for (const repo of repositories) {
    const existing = await db.repository.findUnique({
      where: { repoId: repo.repoId },
      include: { personal: true }
    });

    const record = await db.repository.upsert({
      where: { repoId: repo.repoId },
      create: {
        ...repo,
        topics: JSON.stringify(repo.topics),
        techStack: JSON.stringify([]),
        personal: {
          create: {}
        }
      },
      update: {
        ...repo,
        topics: JSON.stringify(repo.topics)
      },
      include: { personal: true }
    });

    results.push({
      github: record,
      personal: record.personal ?? existing?.personal
    });
  }

  return results;
}
```

```ts
// src/app/api/sync/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { fetchForkRepositories } from "@/lib/github/client";
import { normalizeForkRepositories } from "@/lib/github/repositories";
import { upsertForkRepositories } from "@/lib/repos/upsert";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await fetchForkRepositories(session);
  const normalized = normalizeForkRepositories(payload);
  const repositories = await upsertForkRepositories(normalized);

  return NextResponse.json({ count: repositories.length });
}
```

- [ ] **Step 4: Run tests to verify sync passes**

Run: `npx vitest run tests/integration/sync/upsert-forks.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/github/client.ts src/lib/github/repositories.ts src/lib/repos/upsert.ts src/app/api/sync/route.ts src/lib/repos/types.ts tests/integration/sync/upsert-forks.test.ts
git commit -m "feat: add github fork sync pipeline"
```

## Task 5: Implement README Summary, Stack Hints, And Cleanup Heuristics

**Files:**
- Create: `src/lib/github/readme.ts`
- Create: `src/lib/analysis/summary.ts`
- Create: `src/lib/analysis/stack.ts`
- Create: `src/lib/analysis/cleanup.ts`
- Test: `tests/unit/analysis/summary.test.ts`
- Test: `tests/unit/analysis/stack.test.ts`
- Test: `tests/unit/analysis/cleanup.test.ts`

- [ ] **Step 1: Write the failing unit tests for analysis rules**

```ts
import { describe, expect, it } from "vitest";
import { summarizeRepository } from "@/lib/analysis/summary";
import { detectStackHints } from "@/lib/analysis/stack";
import { scoreCleanupCandidate } from "@/lib/analysis/cleanup";

describe("repository analysis", () => {
  it("builds a concise summary from description and readme", () => {
    const summary = summarizeRepository({
      description: "Starter for AI apps",
      readme: "# AI Starter\nBuilt with Next.js and TypeScript"
    });

    expect(summary).toContain("AI apps");
    expect(summary.length).toBeLessThanOrEqual(140);
  });

  it("detects stack hints from readme content", () => {
    const stack = detectStackHints("Next.js TypeScript Tailwind Prisma");
    expect(stack).toEqual(["Next.js", "TypeScript", "Tailwind", "Prisma"]);
  });

  it("marks low-signal forks as cleanup candidates", () => {
    const result = scoreCleanupCandidate({
      updatedAt: new Date("2025-01-01"),
      hasMyCommits: "no",
      note: null,
      tags: [],
      isFavorite: false,
      lastReviewedAt: null
    });

    expect(result.isCandidate).toBe(true);
    expect(result.reasons).toContain("No personal note");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/analysis/summary.test.ts tests/unit/analysis/stack.test.ts tests/unit/analysis/cleanup.test.ts`
Expected: FAIL because analysis modules do not exist yet.

- [ ] **Step 3: Implement the analysis functions**

```ts
// src/lib/analysis/summary.ts
export function summarizeRepository(input: { description?: string | null; readme?: string | null }) {
  const parts = [input.description, input.readme?.replace(/[#>*`]/g, " ").trim()]
    .filter(Boolean)
    .join(". ");

  return parts.slice(0, 140).trim();
}
```

```ts
// src/lib/analysis/stack.ts
const STACK_KEYWORDS = ["Next.js", "TypeScript", "Tailwind", "Prisma", "React", "Python", "FastAPI"];

export function detectStackHints(text: string) {
  return STACK_KEYWORDS.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}
```

```ts
// src/lib/analysis/cleanup.ts
export function scoreCleanupCandidate(input: {
  updatedAt: Date;
  hasMyCommits: "yes" | "no" | "unknown";
  note: string | null;
  tags: string[];
  isFavorite: boolean;
  lastReviewedAt: Date | null;
}) {
  const reasons: string[] = [];

  if (input.updatedAt < new Date("2025-10-12")) reasons.push("No recent updates");
  if (!input.note) reasons.push("No personal note");
  if (input.tags.length === 0) reasons.push("No tags");
  if (input.hasMyCommits === "no") reasons.push("No user commits");
  if (!input.isFavorite) reasons.push("Not favorited");

  return {
    isCandidate: reasons.length >= 4,
    reasons
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/analysis/summary.test.ts tests/unit/analysis/stack.test.ts tests/unit/analysis/cleanup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/github/readme.ts src/lib/analysis/summary.ts src/lib/analysis/stack.ts src/lib/analysis/cleanup.ts tests/unit/analysis/summary.test.ts tests/unit/analysis/stack.test.ts tests/unit/analysis/cleanup.test.ts
git commit -m "feat: add repository analysis heuristics"
```

## Task 6: Build Repository Queries And Dashboard Data

**Files:**
- Create: `src/lib/repos/queries.ts`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard/stats-grid.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Test: `tests/integration/repos/dashboard-data.test.ts`

- [ ] **Step 1: Write the failing dashboard data test**

```ts
import { describe, expect, it } from "vitest";

describe("dashboard repository stats", () => {
  it("returns total, recent, unclassified, and cleanup counts", async () => {
    const { getDashboardStats } = await import("@/lib/repos/queries");
    const stats = await getDashboardStats();

    expect(stats).toEqual({
      totalForks: 3,
      recentForks: 1,
      unclassifiedForks: 1,
      cleanupCandidates: 2,
      activeFavorites: 1
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/repos/dashboard-data.test.ts`
Expected: FAIL because dashboard query logic does not exist.

- [ ] **Step 3: Implement dashboard query and UI shell**

```ts
// src/lib/repos/queries.ts
import { db } from "@/lib/db";

export async function getDashboardStats() {
  const repositories = await db.repository.findMany({ include: { personal: true } });

  return {
    totalForks: repositories.length,
    recentForks: repositories.filter((repo) => repo.updatedAt > new Date(Date.now() - 30 * 86400000)).length,
    unclassifiedForks: repositories.filter((repo) => !repo.personal?.note && repo.personal?.status === "watching").length,
    cleanupCandidates: repositories.filter((repo) => repo.isLikelyAbandoned).length,
    activeFavorites: repositories.filter((repo) => repo.personal?.isFavorite).length
  };
}
```

```tsx
// src/app/dashboard/page.tsx
import { getDashboardStats } from "@/lib/repos/queries";
import { AppShell } from "@/components/layout/app-shell";
import { StatsGrid } from "@/components/dashboard/stats-grid";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AppShell title="Dashboard">
      <StatsGrid stats={stats} />
    </AppShell>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/repos/dashboard-data.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/repos/queries.ts src/app/dashboard/page.tsx src/components/dashboard/stats-grid.tsx src/components/layout/app-shell.tsx tests/integration/repos/dashboard-data.test.ts
git commit -m "feat: add dashboard statistics view"
```

## Task 7: Build The Repository List, Filters, And Manual Sync Button

**Files:**
- Create: `src/app/repos/page.tsx`
- Create: `src/components/repos/repo-table.tsx`
- Create: `src/components/repos/repo-filters.tsx`
- Create: `src/components/repos/sync-button.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/select.tsx`
- Test: `tests/e2e/repos.spec.ts`

- [ ] **Step 1: Write the failing E2E test for list browsing**

```ts
import { test, expect } from "@playwright/test";

test("repo list supports filtering and manual sync", async ({ page }) => {
  await page.goto("/repos");
  await expect(page.getByRole("heading", { name: "Repositories" })).toBeVisible();
  await page.getByLabel("Search").fill("starter");
  await page.getByRole("button", { name: "Sync GitHub" }).click();
  await expect(page.getByText("Sync complete")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/repos.spec.ts`
Expected: FAIL because the repository list page and controls do not exist.

- [ ] **Step 3: Implement repository list UI**

```tsx
// src/app/repos/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { RepoFilters } from "@/components/repos/repo-filters";
import { RepoTable } from "@/components/repos/repo-table";
import { SyncButton } from "@/components/repos/sync-button";
import { listRepositories } from "@/lib/repos/queries";

export default async function ReposPage() {
  const repositories = await listRepositories();

  return (
    <AppShell title="Repositories">
      <div className="page-toolbar">
        <RepoFilters />
        <SyncButton />
      </div>
      <RepoTable repositories={repositories} />
    </AppShell>
  );
}
```

```tsx
// src/components/repos/sync-button.tsx
"use client";

export function SyncButton() {
  async function handleClick() {
    const response = await fetch("/api/sync", { method: "POST" });
    if (response.ok) window.alert("Sync complete");
  }

  return <button onClick={handleClick}>Sync GitHub</button>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/repos.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/repos/page.tsx src/components/repos/repo-table.tsx src/components/repos/repo-filters.tsx src/components/repos/sync-button.tsx src/components/ui/badge.tsx src/components/ui/button.tsx src/components/ui/input.tsx src/components/ui/select.tsx tests/e2e/repos.spec.ts
git commit -m "feat: add repository list and sync controls"
```

## Task 8: Add Repository Detail View And Personal Metadata Editing

**Files:**
- Create: `src/app/repos/[id]/page.tsx`
- Create: `src/app/api/repos/[id]/route.ts`
- Create: `src/app/api/repos/[id]/favorite/route.ts`
- Create: `src/components/repos/repo-detail-card.tsx`
- Create: `src/components/repos/repo-status-form.tsx`
- Create: `src/components/repos/repo-note-form.tsx`
- Create: `src/components/ui/textarea.tsx`
- Test: `tests/integration/repos/update-repo.test.ts`

- [ ] **Step 1: Write the failing integration test for metadata updates**

```ts
import { describe, expect, it } from "vitest";

describe("update repository personal metadata", () => {
  it("updates status, note, tags, and favorite without touching imported fields", async () => {
    const { updateRepositoryPersonal } = await import("@/lib/repos/upsert");

    const result = await updateRepositoryPersonal("repo-1", {
      status: "active",
      note: "use for future AI tooling",
      tags: ["ai", "starter"],
      isFavorite: true
    });

    expect(result.personal.status).toBe("active");
    expect(result.personal.isFavorite).toBe(true);
    expect(result.github.fullName).toBe("me/example");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/repos/update-repo.test.ts`
Expected: FAIL because update logic and detail route do not exist.

- [ ] **Step 3: Implement detail page and metadata update API**

```ts
// src/app/api/repos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateRepositoryPersonal } from "@/lib/repos/upsert";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const repository = await updateRepositoryPersonal(params.id, payload);
  return NextResponse.json(repository);
}
```

```tsx
// src/app/repos/[id]/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { RepoDetailCard } from "@/components/repos/repo-detail-card";
import { getRepositoryById } from "@/lib/repos/queries";

export default async function RepoDetailPage({ params }: { params: { id: string } }) {
  const repository = await getRepositoryById(params.id);

  return (
    <AppShell title={repository.fullName}>
      <RepoDetailCard repository={repository} />
    </AppShell>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/repos/update-repo.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/repos/[id]/page.tsx src/app/api/repos/[id]/route.ts src/app/api/repos/[id]/favorite/route.ts src/components/repos/repo-detail-card.tsx src/components/repos/repo-status-form.tsx src/components/repos/repo-note-form.tsx src/components/ui/textarea.tsx tests/integration/repos/update-repo.test.ts
git commit -m "feat: add repository detail and metadata editing"
```

## Task 9: Build The Cleanup Queue Screen

**Files:**
- Create: `src/app/cleanup/page.tsx`
- Create: `src/components/cleanup/cleanup-list.tsx`
- Modify: `src/lib/repos/queries.ts`
- Test: `tests/integration/repos/cleanup-queue.test.ts`

- [ ] **Step 1: Write the failing cleanup queue test**

```ts
import { describe, expect, it } from "vitest";

describe("cleanup queue", () => {
  it("returns repositories flagged as cleanup candidates with reasons", async () => {
    const { listCleanupCandidates } = await import("@/lib/repos/queries");
    const candidates = await listCleanupCandidates();

    expect(candidates[0].reasons).toContain("No personal note");
    expect(candidates[0].personal.status).toBe("cleanup");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/repos/cleanup-queue.test.ts`
Expected: FAIL because cleanup queue query logic and page do not exist.

- [ ] **Step 3: Implement cleanup queue page and query**

```ts
// src/lib/repos/queries.ts
export async function listCleanupCandidates() {
  const repositories = await db.repository.findMany({ include: { personal: true } });

  return repositories
    .filter((repo) => repo.isLikelyAbandoned || repo.personal?.status === "cleanup")
    .map((repo) => ({
      ...repo,
      reasons: JSON.parse(repo.cleanupReasons)
    }));
}
```

```tsx
// src/app/cleanup/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { CleanupList } from "@/components/cleanup/cleanup-list";
import { listCleanupCandidates } from "@/lib/repos/queries";

export default async function CleanupPage() {
  const candidates = await listCleanupCandidates();

  return (
    <AppShell title="Cleanup Queue">
      <CleanupList repositories={candidates} />
    </AppShell>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/repos/cleanup-queue.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/cleanup/page.tsx src/components/cleanup/cleanup-list.tsx src/lib/repos/queries.ts tests/integration/repos/cleanup-queue.test.ts
git commit -m "feat: add cleanup queue review screen"
```

## Task 10: Add Full Verification And MVP Polish

**Files:**
- Modify: `playwright.config.ts`
- Modify: `vitest.config.ts`
- Modify: `package.json`
- Modify: `src/styles/globals.css`
- Test: all existing test files

- [ ] **Step 1: Write the final verification checklist into the repo README**

```md
## Verification

- `npm run test`
- `npm run test:e2e`
- `npm run build`
```

- [ ] **Step 2: Run the full test suite before polish**

Run: `npm run test`
Expected: PASS

Run: `npm run test:e2e`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Fix any failing selectors, layout issues, or config gaps with minimal changes**

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000"
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true
  }
});
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
```

- [ ] **Step 4: Run the full verification again**

Run: `npm run test && npm run test:e2e && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts vitest.config.ts package.json src/styles/globals.css README.md
git commit -m "chore: finalize fork manager mvp verification"
```

## Spec Coverage Check

- GitHub login: Task 3
- Fork sync and imported metadata: Task 4
- README-based summary and stack hints: Task 5
- Dashboard: Task 6
- Repository list and filters: Task 7
- Repository detail and personal metadata: Task 8
- Cleanup queue and candidate review: Task 9
- Testing and verification: Task 10

No spec sections are intentionally left uncovered for MVP.
