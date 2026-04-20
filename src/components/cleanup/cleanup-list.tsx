import React from "react";
import type { ListedRepository } from "../../lib/repos/queries";
import { Badge } from "../ui/badge";

type CleanupListProps = {
  repositories: ListedRepository[];
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatStatus(status: "active" | "watching" | "archive" | "cleanup" | undefined) {
  if (!status) {
    return "Unclassified";
  }

  return status[0].toUpperCase() + status.slice(1);
}

export function CleanupList({ repositories }: CleanupListProps) {
  if (repositories.length === 0) {
    return (
      <section className="cleanup-list cleanup-list--empty">
        <p>No repositories are currently flagged for cleanup review.</p>
      </section>
    );
  }

  return (
    <section className="cleanup-list">
      {repositories.map((repository) => (
        <article key={repository.id ?? repository.repoId} className="cleanup-list__card">
          <div className="cleanup-list__header">
            <div>
              <p className="app-shell__eyebrow">Needs review</p>
              <h2 className="cleanup-list__title">{repository.fullName}</h2>
              <p className="cleanup-list__description">
                {repository.description ?? "No description available."}
              </p>
            </div>
            <div className="cleanup-list__badges">
              <Badge tone="warning">Needs review</Badge>
              <Badge tone={repository.personal?.status === "cleanup" ? "warning" : "neutral"}>
                Status: {formatStatus(repository.personal?.status)}
              </Badge>
            </div>
          </div>

          <div className="cleanup-list__meta">
            <p>Updated: {formatDate(repository.updatedAt)}</p>
            <p>My commits: {repository.hasMyCommits}</p>
            <p>
              Tags:{" "}
              {repository.personal?.tags.length ? repository.personal.tags.join(", ") : "None"}
            </p>
          </div>

          <section className="cleanup-list__section">
            <h3>Why it is queued</h3>
            <ul className="cleanup-list__reasons">
              {repository.cleanupReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>

          {repository.summary ? (
            <section className="cleanup-list__section">
              <h3>Summary</h3>
              <p>{repository.summary}</p>
            </section>
          ) : null}

          <section className="cleanup-list__section">
            <h3>Personal context</h3>
            <p>Note: {repository.personal?.note ?? "No personal note"}</p>
            <p>Saved reason: {repository.personal?.savedReason ?? "None saved"}</p>
          </section>
        </article>
      ))}
    </section>
  );
}
