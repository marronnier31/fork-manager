import React from "react";
import type { ImportedRepository } from "../../lib/repos/types";
import { Badge } from "../ui/badge";

export type RepoTableRow = ImportedRepository & {
  personal:
    | {
        status: "active" | "watching" | "archive" | "cleanup";
        tags: string;
        note: string | null;
        savedReason: string | null;
        reviewLaterAt: Date | null;
        isFavorite: boolean;
        lastReviewedAt: Date | null;
      }
    | null;
};

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
            <th scope="col">Stars</th>
            <th scope="col">Updated</th>
            <th scope="col">Cleanup</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repository) => (
            <tr key={repository.repoId}>
              <td>
                <div className="repo-table__repo">
                  <a href={repository.htmlUrl}>{repository.fullName}</a>
                  {repository.description ? (
                    <p>{repository.description}</p>
                  ) : (
                    <p>No description available.</p>
                  )}
                </div>
              </td>
              <td>
                <Badge tone={statusTone(repository.personal?.status)}>
                  {statusLabel(repository.personal?.status)}
                </Badge>
              </td>
              <td>{repository.stargazersCount}</td>
              <td>{formatDate(repository.updatedAt)}</td>
              <td>{repository.isLikelyAbandoned ? "Review" : "Healthy"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
