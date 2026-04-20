import React from "react";
import { Badge } from "../ui/badge";
import { RepoNoteForm } from "./repo-note-form";
import { RepoStatusForm } from "./repo-status-form";

type PersonalMetadata = {
  status: "active" | "watching" | "archive" | "cleanup";
  tags: string[];
  note: string | null;
  savedReason: string | null;
  reviewLaterAt: Date | null;
  isFavorite: boolean;
  lastReviewedAt: Date | null;
} | null;

export type RepositoryDetail = {
  id: string;
  repoId: number;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  isFork: boolean;
  parentFullName: string | null;
  topics: string[];
  primaryLanguage: string | null;
  stargazersCount: number;
  forksCount: number;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date | null;
  defaultBranch: string | null;
  summary: string | null;
  techStack: string[];
  category: string | null;
  hasReadme: boolean;
  readmeExcerpt: string | null;
  analyzedAt: Date | null;
  activityScore: number | null;
  cleanupReasons: string[];
  isLikelyAbandoned: boolean;
  hasMyCommits: "yes" | "no" | "unknown";
  personal: PersonalMetadata;
};

type RepoDetailCardProps = {
  repository: RepositoryDetail;
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

export function RepoDetailCard({ repository }: RepoDetailCardProps) {
  return (
    <section className="repo-detail">
      <div className="repo-detail__intro">
        <p className="app-shell__eyebrow">Imported fork</p>
        <h2 className="repo-detail__title">{repository.fullName}</h2>
        <p className="repo-detail__description">
          {repository.description ?? "No description available."}
        </p>
        <a className="repo-detail__link" href={repository.htmlUrl}>
          Open on GitHub
        </a>
      </div>

      <div className="repo-detail__signals">
        <Badge tone={repository.personal?.isFavorite ? "success" : "neutral"}>
          {repository.personal?.isFavorite ? "Favorite" : "Not favorited"}
        </Badge>
        <Badge tone={repository.isLikelyAbandoned ? "warning" : "info"}>
          {repository.isLikelyAbandoned ? "Cleanup review" : "Healthy"}
        </Badge>
        <p>Stack: {repository.techStack.length ? repository.techStack.join(", ") : "Unknown"}</p>
        <p>Topics: {repository.topics.length ? repository.topics.join(", ") : "None"}</p>
      </div>

      {repository.summary ? (
        <section className="repo-detail__section">
          <h3>Summary</h3>
          <p>{repository.summary}</p>
        </section>
      ) : null}

      <section className="repo-detail__section">
        <h3>Repository facts</h3>
        <dl className="repo-detail__facts">
          <div>
            <dt>Primary language</dt>
            <dd>{repository.primaryLanguage ?? "Unknown"}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDate(repository.updatedAt)}</dd>
          </div>
          <div>
            <dt>Cleanup reasons</dt>
            <dd>{repository.cleanupReasons.length ? repository.cleanupReasons.join(", ") : "None"}</dd>
          </div>
          <div>
            <dt>Last reviewed</dt>
            <dd>{formatDate(repository.personal?.lastReviewedAt ?? null)}</dd>
          </div>
        </dl>
      </section>

      <div className="repo-detail__forms">
        <RepoStatusForm
          repositoryId={repository.id}
          status={repository.personal?.status ?? "watching"}
          tags={repository.personal?.tags ?? []}
          isFavorite={repository.personal?.isFavorite ?? false}
        />
        <RepoNoteForm repositoryId={repository.id} note={repository.personal?.note ?? ""} />
      </div>
    </section>
  );
}
