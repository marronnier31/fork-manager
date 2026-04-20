"use client";

import React from "react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type RepoNoteFormProps = {
  repositoryId: string;
  note: string;
};

export function RepoNoteForm({ repositoryId, note }: RepoNoteFormProps) {
  const [currentNote, setCurrentNote] = useState(note);
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
          note: currentNote
        })
      });

      if (!response.ok) {
        setMessage("Unable to save note.");
        return;
      }

      setMessage("Note saved.");
    } catch {
      setMessage("Unable to save note.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="repo-note-form" onSubmit={handleSubmit}>
      <h3>Personal note</h3>
      <label className="repo-note-form__field">
        <span>Note</span>
        <Textarea
          value={currentNote}
          onChange={(event) => setCurrentNote(event.target.value)}
          placeholder="Why did you keep this fork?"
          rows={6}
        />
      </label>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save note"}
      </Button>
      {message ? <p className="repo-note-form__message">{message}</p> : null}
    </form>
  );
}
