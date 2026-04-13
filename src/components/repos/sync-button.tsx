import React from "react";
import { Button } from "../ui/button";

export function SyncButton() {
  return (
    <form action="/api/sync" method="post" className="sync-button">
      <Button type="submit">Sync repositories</Button>
    </form>
  );
}
