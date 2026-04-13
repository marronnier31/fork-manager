import React from "react";
import { AppShell } from "../layout/app-shell";
import { RepoFilters } from "./repo-filters";
import { RepoTable, type RepoTableRow } from "./repo-table";
import { SyncButton } from "./sync-button";

type SearchParams = {
  search?: string;
  status?: string;
};

type ReposPageProps = {
  repositories: RepoTableRow[];
  searchParams?: SearchParams;
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function matchesStatus(repository: RepoTableRow, status: string) {
  if (!status || status === "all") {
    return true;
  }

  return repository.personal?.status === status;
}

function matchesSearch(repository: RepoTableRow, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [
    repository.fullName,
    repository.description,
    repository.personal?.note,
    repository.primaryLanguage,
    repository.category,
    repository.techStack.join(" "),
    repository.topics.join(" ")
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
}

export function ReposPageView({
  repositories,
  searchParams = {}
}: ReposPageProps) {
  const search = normalizeSearch(searchParams.search ?? "");
  const status = searchParams.status ?? "all";
  const filteredRepositories = repositories
    .filter((repository) => repository.isFork)
    .filter((repository) => matchesStatus(repository, status))
    .filter((repository) => matchesSearch(repository, search));

  return (
    <AppShell
      title="Repositories"
      subtitle="Browse imported forks, narrow the list, and trigger a fresh sync."
    >
      <section className="repos-page">
        <div className="repos-page__toolbar">
          <RepoFilters search={searchParams.search ?? ""} status={status} />
          <SyncButton />
        </div>
        <RepoTable repositories={filteredRepositories} />
      </section>
    </AppShell>
  );
}
