import React from "react";
"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export function SyncButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSync() {
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as
        | { count?: number; error?: string }
        | null;

      if (!response.ok) {
        setMessage(payload?.error ?? "Sync failed");
        return;
      }

      setMessage(
        typeof payload?.count === "number"
          ? `Sync complete: ${payload.count} repositories updated`
          : "Sync complete"
      );
    } catch {
      setMessage("Sync failed");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="sync-button">
      <Button type="button" onClick={handleSync} disabled={isPending}>
        {isPending ? "Syncing..." : "Sync GitHub"}
      </Button>
      {message ? (
        <p className="sync-button__message" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
