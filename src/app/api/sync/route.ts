import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import {
  fetchForkRepositories,
  GitHubSyncError
} from "../../../lib/github/client";
import { normalizeForkRepositories } from "../../../lib/github/repositories";
import { upsertForkRepositories } from "../../../lib/repos/upsert";

export async function POST() {
  const session = await auth();
  const accessToken = session?.accessToken ?? session?.user?.accessToken;

  if (!session?.user || !accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repositories = await fetchForkRepositories({ accessToken });
    const normalized = normalizeForkRepositories(repositories);
    const upsertedRepositories = await upsertForkRepositories(normalized);

    return NextResponse.json({ count: upsertedRepositories.length });
  } catch (error) {
    if (error instanceof GitHubSyncError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "GitHub sync failed" }, { status: 502 });
  }
}
