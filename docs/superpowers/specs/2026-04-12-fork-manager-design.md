# Fork Manager Design

## Overview

Fork Manager is a personal web app for managing GitHub forks that were saved for later reference but are now hard to remember and organize. The product goal is to help a single developer quickly answer four questions:

- What forks do I have?
- What does each fork contain?
- Which forks are still worth keeping?
- Which forks should be archived or cleaned up?

This is a personal-use product, not a multi-user SaaS. The first version prioritizes speed of understanding and low operational complexity over collaboration features or deep Git automation.

## Product Scope

### Target User

- A single developer using their own GitHub account
- Someone who has forked many repositories and wants to classify, summarize, and revisit them efficiently

### Primary Jobs To Be Done

- Collect all GitHub forks into one place
- Show enough information to remember why a fork exists
- Let the user classify forks with personal metadata
- Surface likely cleanup candidates

### Explicitly Out Of Scope For MVP

- Multi-user support
- GitLab or other Git hosting providers
- Browser-based commit, push, pull, or branch operations
- Deep codebase indexing across all files
- Mobile app
- Sharing lists or recommendations with others

## Recommended Product Approach

The product combines two ideas:

- A GitHub fork dashboard that imports repository metadata automatically
- A personal knowledge layer that stores tags, notes, and reasons for keeping a fork

The app should not behave like a full Git client in the first version. The core value comes from repository understanding and portfolio cleanup, not from replacing local Git tooling.

## User Experience

### Main Flow

1. The user signs in with GitHub.
2. The app imports forked repositories from the user's GitHub account.
3. The app reads repository metadata and README content.
4. The app generates lightweight summaries and classifications.
5. The user reviews the fork list, adds tags or notes, and assigns a status.
6. The app highlights repositories that look inactive or low-value.

### Primary Screens

#### Dashboard

The dashboard gives a high-level view of the fork collection.

- Total number of forks
- Recently updated forks
- Unclassified forks
- Likely cleanup candidates
- Favorite or active forks

The dashboard is for orientation, not detailed management.

#### Repository List

This is the main working screen. It should support fast scanning and filtering.

Each row or card should show:

- Repository name
- Parent repository
- Last updated date
- Whether the user has made their own changes
- Status
- Tags
- One-line summary
- Primary language or stack hints

Filters should include:

- Updated recently
- User-modified only
- Status
- Tags
- Favorites
- Text search across name, summary, and notes

#### Repository Detail

This screen exists to answer "What is this project?" without needing to reopen GitHub.

It should show:

- Repository metadata
- README-based summary
- Topics and language information
- Stack hints
- Important links
- Personal note
- Saved reason
- Current status and tags

#### Cleanup Queue

This is a focused review screen for potential archive or cleanup decisions.

Repositories can appear here when they meet rules such as:

- No recent updates
- No user commits
- No personal note
- No tags
- Not favorited

The user can quickly mark each repository as keep, archive, or cleanup.

## Data Model

The system should separate imported GitHub data from personal metadata.

### Imported Repository Data

- `repoId`
- `owner`
- `name`
- `fullName`
- `htmlUrl`
- `description`
- `isFork`
- `parentFullName`
- `topics`
- `primaryLanguage`
- `stargazersCount`
- `forksCount`
- `createdAt`
- `updatedAt`
- `pushedAt`
- `defaultBranch`

### Derived Analysis Data

- `summary`
- `techStack`
- `category`
- `hasReadme`
- `readmeExcerpt`
- `analyzedAt`
- `activityScore`
- `isLikelyAbandoned`
- `hasMyCommits`

For MVP, `hasMyCommits` should be determined with a simple, explainable rule: detect whether the authenticated user's GitHub identity appears in commit history on the fork's default branch. If this check is unavailable for a repository because of API limits or missing commit data, the app should mark the value as unknown rather than false.

### Personal Metadata

- `status`
- `tags`
- `note`
- `savedReason`
- `reviewLaterAt`
- `isFavorite`
- `lastReviewedAt`

### Status Values

- `active`
- `watching`
- `archive`
- `cleanup`

## Architecture

### Recommended Stack

- `Next.js` with App Router
- `Prisma`
- `SQLite` for the initial release
- `GitHub OAuth`
- GitHub API integration module

### Rationale

This stack keeps the MVP in a single deployable app with minimal infrastructure. Since the app is personal-use and stores lightweight metadata, SQLite is sufficient for the first version. The schema should still be written cleanly enough that migrating to Postgres later remains straightforward.

### Internal Modules

- UI layer for dashboard, list, detail, and cleanup screens
- Server/API layer for authentication, sync, and user metadata updates
- GitHub integration layer for repository and README fetching
- Analysis layer for summary and classification
- Persistence layer for storing imported and personal data

## Data Flow

### Initial Sync

1. User signs in with GitHub.
2. The app fetches the user's repositories and filters for forks.
3. The app stores imported metadata in the database.
4. The app fetches README content and selected repository details as needed.
5. The analysis layer creates summary, stack hints, and category fields.
6. The app marks each repository with a cleanup score or candidate flag.

### Ongoing Sync

The first version should use a manual sync button.

On sync:

- Refresh GitHub-owned fields
- Re-run analysis only when necessary
- Preserve all personal metadata

This prevents accidental loss of user notes, tags, or statuses.

### Analysis Strategy

For MVP, analysis should be lightweight and deterministic.

Inputs:

- GitHub description
- Topics
- Primary language
- README text
- File names when easily available

Outputs:

- One-line summary
- Rough category
- Stack hints
- Cleanup heuristics

The first version should use rules and pattern matching rather than a full LLM dependency. LLM-based summarization can be added later if needed.

## Cleanup Heuristics

The app should not claim certainty. It should provide candidates based on simple signals.

Possible cleanup signals:

- No update in the last six months
- No personal note
- No tags
- No user commits detected
- Not reviewed recently

Possible keep signals:

- User has committed to the fork
- Personal note exists
- Tagged or favorited
- Recently reviewed

The UI should present these as recommendations, not automatic destructive actions.
When the recommendation is based on incomplete data, the UI should clearly show that the confidence is limited.

## Error Handling

The app must keep working even when some GitHub or analysis steps fail.

- README fetch failure should degrade gracefully and leave summary blank or partial
- Rate-limited GitHub calls should surface a retry state
- Sync should be resumable on the next manual run
- Analysis failures should not block browsing the imported repository list

## Security And Privacy

Because the app is personal-use, the design should stay simple.

- GitHub OAuth access is limited to required read scopes
- Tokens must be stored securely on the server side
- Personal notes and classification data remain private to the user

## MVP Implementation Sequence

1. Create the Next.js app structure
2. Set up Prisma and SQLite
3. Add GitHub OAuth login
4. Implement fork sync
5. Build repository list screen
6. Add personal metadata editing
7. Add README-based summary generation
8. Build repository detail screen
9. Build cleanup queue
10. Refine filters and search

This order ensures the product becomes useful early, even before advanced summary quality improvements are added.

## Testing Strategy

Testing should focus on behavior that can break the core management flow.

- Unit tests for cleanup heuristics
- Unit tests for summary and classification rules
- Integration tests for sync and metadata persistence
- UI tests for repository filtering and status editing

Manual verification should confirm:

- GitHub login works
- Forks import correctly
- Personal metadata survives sync
- Cleanup queue rules behave as expected

## Open Migration Path

If the app grows beyond personal use, the likely migration path is:

- Move from SQLite to Postgres
- Add background jobs for periodic sync
- Add richer repository analysis
- Add optional local clone awareness

Those are follow-up phases, not MVP requirements.
