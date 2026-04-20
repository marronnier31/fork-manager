import React from "react";
import { AppShell } from "../layout/app-shell";
import { RepoFilters } from "./repo-filters";
import { RepoTable, type RepoTableRow } from "./repo-table";
import { SyncButton } from "./sync-button";

type SearchParams = {
  search?: string;
  status?: string;
  commits?: string;
  tag?: string;
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
    repository.summary,
    repository.readmeExcerpt,
    repository.personal?.note,
    repository.primaryLanguage,
    repository.category,
    repository.techStack.join(" "),
    repository.topics.join(" "),
    repository.personal?.tags.join(" ")
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
}

function matchesCommitState(repository: RepoTableRow, commits: string) {
  if (!commits || commits === "all") {
    return true;
  }

  return repository.hasMyCommits === commits;
}

function matchesTag(repository: RepoTableRow, tag: string) {
  if (!tag) {
    return true;
  }

  return repository.personal?.tags.some((value) => value.toLowerCase().includes(tag)) ?? false;
}

export function ReposPageView({
  repositories,
  searchParams = {}
}: ReposPageProps) {
  const search = normalizeSearch(searchParams.search ?? "");
  const status = searchParams.status ?? "all";
  const commits = searchParams.commits ?? "all";
  const tag = normalizeSearch(searchParams.tag ?? "");
  const filteredRepositories = repositories
    .filter((repository) => repository.isFork)
    .filter((repository) => matchesStatus(repository, status))
    .filter((repository) => matchesCommitState(repository, commits))
    .filter((repository) => matchesTag(repository, tag))
    .filter((repository) => matchesSearch(repository, search));

  return (
    <AppShell
      title="Repositories"
      subtitle="Browse imported forks, narrow the list, and trigger a fresh sync."
    >
      <section className="repos-page">
        <div className="repos-page__toolbar">
          <RepoFilters
            search={searchParams.search ?? ""}
            status={status}
            commits={commits}
            tag={searchParams.tag ?? ""}
          />
          <SyncButton />
        </div>
        <RepoTable repositories={filteredRepositories} />
      </section>
    </AppShell>
  );
}
