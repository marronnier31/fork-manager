import { ReposPageView } from "../../components/repos/repos-page";
import { listRepositories, type ListRepositoriesFilters } from "../../lib/repos/queries";
type SearchParams = Record<string, string | string[] | undefined>;
type ReposPageProps = {
  searchParams?: Promise<SearchParams>;
};

export const dynamic = "force-dynamic";

const REPO_STATUSES = new Set(["active", "watching", "archive", "cleanup", "all"]);
const COMMIT_FILTERS = new Set(["yes", "no", "unknown", "all"]);

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeStatus(value: string): ListRepositoriesFilters["status"] {
  return REPO_STATUSES.has(value) ? (value as ListRepositoriesFilters["status"]) : "all";
}

function normalizeCommits(value: string): ListRepositoriesFilters["commits"] {
  return COMMIT_FILTERS.has(value) ? (value as ListRepositoriesFilters["commits"]) : "all";
}

export default async function ReposPage({ searchParams }: ReposPageProps) {
  const resolvedSearchParams = (await Promise.resolve(
    searchParams ?? ({} as SearchParams)
  )) as SearchParams;
  const normalizedSearchParams = {
    search: firstParam(resolvedSearchParams.search),
    status: normalizeStatus(firstParam(resolvedSearchParams.status)),
    commits: normalizeCommits(firstParam(resolvedSearchParams.commits)),
    tag: firstParam(resolvedSearchParams.tag)
  };
  const repositories = await listRepositories(normalizedSearchParams);

  return ReposPageView({
    repositories,
    searchParams: normalizedSearchParams
  });
}
