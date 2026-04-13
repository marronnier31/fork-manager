import { ReposPageView } from "../../components/repos/repos-page";
import { db } from "../../lib/db";

import type { RepoTableRow } from "../../components/repos/repo-table";
type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ReposPage({
  searchParams = {}
}: {
  searchParams?: SearchParams;
} = {}) {
  const repositories = (await db.repository.findMany({
    include: { personal: true }
  })) as unknown as RepoTableRow[];

  return ReposPageView({
    repositories,
    searchParams: {
      search: firstParam(searchParams.search),
      status: firstParam(searchParams.status)
    }
  });
}
