import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { fetchForkRepositories } from "../../../lib/github/client";
import { normalizeForkRepositories } from "../../../lib/github/repositories";
import { upsertForkRepositories } from "../../../lib/repos/upsert";

type SyncSession = {
  accessToken?: string;
  user?: {
    accessToken?: string;
  } | null;
} | null;

type GitHubSyncFailure = {
  name?: string;
  message?: string;
  status?: number;
};

function isGitHubSyncFailure(error: unknown): error is GitHubSyncFailure {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as GitHubSyncFailure;

  return candidate.name === "GitHubSyncError" && typeof candidate.status === "number";
}

export async function POST() {
  const session = (await auth()) as SyncSession;
  const accessToken = session?.accessToken ?? session?.user?.accessToken;

  if (!session?.user || !accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let repositories;

  try {
    repositories = await fetchForkRepositories({ accessToken });
  } catch (error) {
    if (isGitHubSyncFailure(error)) {
      return NextResponse.json(
        { error: error.message ?? "GitHub sync failed" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "GitHub sync failed" }, { status: 502 });
  }

  let normalized;

  try {
    normalized = normalizeForkRepositories(repositories);
  } catch {
    return NextResponse.json({ error: "Repository normalization failed" }, { status: 500 });
  }

  try {
    const upsertedRepositories = await upsertForkRepositories(normalized);

    return NextResponse.json({ count: upsertedRepositories.length });
  } catch {
    return NextResponse.json({ error: "Repository sync failed" }, { status: 500 });
  }
}
