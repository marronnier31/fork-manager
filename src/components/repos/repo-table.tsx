import React from "react";
import type { ListedRepository } from "../../lib/repos/queries";
import { Badge } from "../ui/badge";

export type RepoTableRow = ListedRepository;

type RepoTableProps = {
  repositories: RepoTableRow[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

type RepoStatus = NonNullable<RepoTableRow["personal"]>["status"];

function statusLabel(status: RepoStatus | undefined) {
  if (!status) {
    return "Unclassified";
  }

  return status[0].toUpperCase() + status.slice(1);
}

function statusTone(status: RepoStatus | undefined) {
  switch (status) {
    case "active":
      return "success";
    case "watching":
      return "info";
    case "archive":
      return "neutral";
    case "cleanup":
      return "warning";
    default:
      return "neutral";
  }
}

function commitBadgeTone(state: RepoTableRow["hasMyCommits"]) {
  switch (state) {
    case "yes":
      return "success";
    case "no":
      return "warning";
    default:
      return "neutral";
  }
}

function commitLabel(state: RepoTableRow["hasMyCommits"]) {
  switch (state) {
    case "yes":
      return "Has my commits";
    case "no":
      return "No personal commits";
    default:
      return "Commit state unknown";
  }
}

export function RepoTable({ repositories }: RepoTableProps) {
  if (repositories.length === 0) {
    return <p className="repo-table__empty">No repositories match these filters.</p>;
  }

  return (
    <div className="repo-table">
      <table>
        <thead>
          <tr>
            <th scope="col">Repository</th>
            <th scope="col">Status</th>
            <th scope="col">Signals</th>
            <th scope="col">Updated</th>
            <th scope="col">Cleanup</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repository) => (
            <tr key={repository.repoId}>
              <td>
                <div className="repo-table__repo">
                  <a href={repository.id ? `/repos/${repository.id}` : repository.htmlUrl}>
                    {repository.fullName}
                  </a>
                  {repository.description ? (
                    <p>{repository.description}</p>
                  ) : (
                    <p>No description available.</p>
                  )}
                  {repository.summary ? (
                    <p className="repo-table__summary">{repository.summary}</p>
                  ) : null}
                  <p className="repo-table__links">
                    <a href={repository.htmlUrl}>Open on GitHub</a>
                  </p>
                </div>
              </td>
              <td>
                <Badge tone={statusTone(repository.personal?.status)}>
                  {statusLabel(repository.personal?.status)}
                </Badge>
              </td>
              <td>
                <div className="repo-table__signals">
                  <Badge tone={commitBadgeTone(repository.hasMyCommits)}>
                    {commitLabel(repository.hasMyCommits)}
                  </Badge>
                  {repository.personal?.tags.length ? (
                    <p>Tags: {repository.personal.tags.join(", ")}</p>
                  ) : null}
                  <p>Stars: {repository.stargazersCount}</p>
                </div>
              </td>
              <td>{formatDate(repository.updatedAt)}</td>
              <td>
                {repository.isLikelyAbandoned ? (
                  <div className="repo-table__cleanup">
                    <strong>Review</strong>
                    {repository.cleanupReasons.length ? (
                      <p>{repository.cleanupReasons.join(", ")}</p>
                    ) : null}
                  </div>
                ) : (
                  "Healthy"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
