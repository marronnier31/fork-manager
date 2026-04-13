import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

type RepoFiltersProps = {
  search: string;
  status: string;
};

export function RepoFilters({ search, status }: RepoFiltersProps) {
  return (
    <form className="repo-filters" method="get">
      <label className="repo-filters__field">
        <span className="repo-filters__label">Search repositories</span>
        <Input
          defaultValue={search}
          name="search"
          placeholder="Search repositories"
          type="search"
        />
      </label>
      <label className="repo-filters__field">
        <span className="repo-filters__label">Status</span>
        <Select defaultValue={status} name="status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="watching">Watching</option>
          <option value="archive">Archive</option>
          <option value="cleanup">Cleanup</option>
        </Select>
      </label>
      <div className="repo-filters__actions">
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
        <a className="repo-filters__reset" href="/repos">
          Reset
        </a>
      </div>
    </form>
  );
}
