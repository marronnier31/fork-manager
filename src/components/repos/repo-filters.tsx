import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

type RepoFiltersProps = {
  search: string;
  status: string;
  commits: string;
  tag: string;
};

export function RepoFilters({ search, status, commits, tag }: RepoFiltersProps) {
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
      <label className="repo-filters__field">
        <span className="repo-filters__label">My commits</span>
        <Select defaultValue={commits} name="commits">
          <option value="all">All repositories</option>
          <option value="yes">Touched by me</option>
          <option value="no">No personal commits</option>
          <option value="unknown">Commit status unknown</option>
        </Select>
      </label>
      <label className="repo-filters__field">
        <span className="repo-filters__label">Tag</span>
        <Input defaultValue={tag} name="tag" placeholder="Filter by tag" type="search" />
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
