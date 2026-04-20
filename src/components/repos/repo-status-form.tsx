"use client";

import React from "react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

type RepoStatus = "active" | "watching" | "archive" | "cleanup";

type RepoStatusFormProps = {
  repositoryId: string;
  status: RepoStatus;
  tags: string[];
  isFavorite: boolean;
};

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function RepoStatusForm({ repositoryId, status, tags, isFavorite }: RepoStatusFormProps) {
  const [currentStatus, setCurrentStatus] = useState<RepoStatus>(status);
  const [tagInput, setTagInput] = useState(tags.join(", "));
  const [favorite, setFavorite] = useState(isFavorite);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/repos/${repositoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: currentStatus,
          tags: parseTags(tagInput),
          isFavorite: favorite
        })
      });

      if (!response.ok) {
        setMessage("Unable to save repository metadata.");
        return;
      }

      setMessage("Repository metadata saved.");
    } catch {
      setMessage("Unable to save repository metadata.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleFavoriteToggle() {
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/repos/${repositoryId}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isFavorite: !favorite })
      });

      if (!response.ok) {
        setMessage("Unable to update favorite state.");
        return;
      }

      setFavorite(!favorite);
      setMessage(!favorite ? "Marked as favorite." : "Removed from favorites.");
    } catch {
      setMessage("Unable to update favorite state.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="repo-status-form" onSubmit={handleSubmit}>
      <h3>Personal status</h3>
      <label className="repo-status-form__field">
        <span>Status</span>
        <Select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value as RepoStatus)}>
          <option value="active">Active</option>
          <option value="watching">Watching</option>
          <option value="archive">Archive</option>
          <option value="cleanup">Cleanup</option>
        </Select>
      </label>
      <label className="repo-status-form__field">
        <span>Tags</span>
        <Input
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          placeholder="ai, starter, reference"
        />
      </label>
      <div className="repo-status-form__actions">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save status"}
        </Button>
        <Button type="button" variant="secondary" onClick={handleFavoriteToggle} disabled={isPending}>
          {favorite ? "Unfavorite" : "Favorite"}
        </Button>
      </div>
      {message ? <p className="repo-status-form__message">{message}</p> : null}
    </form>
  );
}
