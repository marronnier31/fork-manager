import { ReposPageView } from "../../components/repos/repos-page";
import { listRepositories, type ListRepositoriesFilters } from "../../lib/repos/queries";
type SearchParams = Record<string, string | string[] | undefined>;

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

export default async function ReposPage({
  searchParams = {}
}: {
  searchParams?: SearchParams;
} = {}) {
  const normalizedSearchParams = {
    search: firstParam(searchParams.search),
    status: normalizeStatus(firstParam(searchParams.status)),
    commits: normalizeCommits(firstParam(searchParams.commits)),
    tag: firstParam(searchParams.tag)
  };
  const repositories = await listRepositories(normalizedSearchParams);

  return ReposPageView({
    repositories,
    searchParams: normalizedSearchParams
  });
}
