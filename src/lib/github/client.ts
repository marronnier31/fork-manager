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

    repositories.push(...(payload as GitHubRepositoryPayload[]));

    if (payload.length < 100) {
      break;
    }
  }

  return repositories;
}
