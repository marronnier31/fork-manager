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

export async function POST() {
  const session = (await auth()) as SyncSession;
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
    return NextResponse.json({ error: "GitHub sync failed" }, { status: 502 });
  }
}
