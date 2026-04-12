import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { fetchForkRepositories } from "../../../lib/github/client";
import { normalizeForkRepositories } from "../../../lib/github/repositories";
import { upsertForkRepositories } from "../../../lib/repos/upsert";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repositories = await fetchForkRepositories(session);
  const normalized = normalizeForkRepositories(repositories);
  const upsertedRepositories = await upsertForkRepositories(normalized);

  return NextResponse.json({ count: upsertedRepositories.length });
}
