import type { CommitState } from "../repos/types";

export interface GitHubRepositoryPayload {
  id: number;
  fork: boolean;
  full_name: string;
  owner: {
    login: string;
  };
  name: string;
  html_url?: string | null;
  description?: string | null;
  parent?: {
    full_name?: string | null;
  } | null;
  topics?: string[];
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  created_at?: string;
  updated_at?: string;
  pushed_at?: string | null;
  default_branch?: string | null;
  has_readme?: boolean;
  readme?: string | null;
  hasMyCommits?: CommitState;
}

export class GitHubSyncError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubSyncError";
    this.status = status;
  }
}

type GitHubSessionLike = {
  accessToken?: string | null;
  user?: {
    accessToken?: string | null;
  } | null;
};

async function fetchRepositoryReadme(
  token: string,
  fullName: string
): Promise<string | null> {
  const response = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new GitHubSyncError(
      `GitHub README request failed (${response.status})`,
      response.status === 401 || response.status === 403 ? response.status : 502
    );
  }

  return response.text();
}

async function fetchCommitState(
  token: string,
  fullName: string,
  ownerLogin: string,
  defaultBranch: string | null | undefined
): Promise<CommitState> {
  const branchQuery = defaultBranch ? `&sha=${encodeURIComponent(defaultBranch)}` : "";
  const response = await fetch(
    `https://api.github.com/repos/${fullName}/commits?per_page=20${branchQuery}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }
  );

  if (response.status === 404 || response.status === 409) {
    return "unknown";
  }

  if (!response.ok) {
    throw new GitHubSyncError(
      `GitHub commits request failed (${response.status})`,
      response.status === 401 || response.status === 403 ? response.status : 502
    );
  }

  const payload = (await response.json()) as Array<{
    author?: { login?: string | null } | null;
    commit?: { author?: { name?: string | null; email?: string | null } | null } | null;
  }>;

  return payload.some((commit) => commit.author?.login === ownerLogin) ? "yes" : "no";
}

export async function fetchForkRepositories(
  session: GitHubSessionLike
): Promise<GitHubRepositoryPayload[]> {
  const token = session.accessToken ?? session.user?.accessToken;

  if (!token) {
    throw new GitHubSyncError("Missing GitHub access token", 401);
  }

  const repositories: GitHubRepositoryPayload[] = [];

  for (let page = 1; page < 1000; page += 1) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator,organization_member&sort=updated&direction=desc`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!response.ok) {
      throw new GitHubSyncError(
        `GitHub API request failed (${response.status})`,
        response.status === 401 || response.status === 403 ? response.status : 502
      );
    }

    const payload = (await response.json()) as unknown;

    if (!Array.isArray(payload)) {
      throw new Error("Unexpected GitHub API response");
    }

    const pageRepositories = payload as GitHubRepositoryPayload[];
    const enrichedRepositories = await Promise.all(
      pageRepositories.map(async (repository) => {
        if (!repository.fork) {
          return repository;
        }

        const [readme, hasMyCommits] = await Promise.all([
          fetchRepositoryReadme(token, repository.full_name),
          fetchCommitState(
            token,
            repository.full_name,
            repository.owner.login,
            repository.default_branch
          )
        ]);

        return {
          ...repository,
          has_readme: readme ? true : repository.has_readme ?? false,
          readme,
          hasMyCommits
        };
      })
    );

    repositories.push(...enrichedRepositories);

    if (payload.length < 100) {
      break;
    }
  }

  return repositories;
}
