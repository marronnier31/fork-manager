# Fork Manager

Fork Manager is a personal web app for collecting, reviewing, and cleaning up GitHub forks.
It imports forked repositories from your GitHub account, stores repository metadata locally,
derives lightweight summaries and cleanup signals, and lets you maintain your own notes,
statuses, tags, and favorites.

## What It Does

- Signs in with GitHub OAuth
- Imports repositories from the authenticated GitHub account and keeps fork data in sync
- Extracts lightweight repository context from descriptions, topics, language data, and README content
- Helps classify forks with personal metadata such as status, tags, notes, and favorites
- Surfaces likely cleanup candidates in a dedicated review screen

## Stack

- Next.js App Router
- TypeScript
- Prisma
- SQLite
- Auth.js / NextAuth with GitHub provider
- Vitest

## Project Status

This repository currently targets an MVP workflow for a single user running the app locally.
The UI and data model are built around personal fork management rather than multi-user SaaS use.

## Features

### Dashboard

- Total fork count
- Recent fork count
- Unclassified fork count
- Cleanup candidate count
- Favorite fork count

### Repository List

- Search across repository metadata and personal notes
- Filter by status
- Filter by commit ownership signal
- Filter by tag
- Manual GitHub sync button
- Internal detail page entry plus direct GitHub link

### Repository Detail

- Imported repository facts
- Summary and cleanup context
- Favorite toggle
- Status editing
- Tag editing
- Personal note editing

### Cleanup Queue

- Lists repositories that look abandoned or were explicitly marked for cleanup
- Shows cleanup reasons and personal context in one place

## Prerequisites

- Node.js 20+ recommended
- npm
- A GitHub OAuth app if you want to enable sign-in and repository sync

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env.local` and update the values for your machine:

```bash
copy .env.example .env.local
```

If you already have a `.env.local`, compare it against the table below.

### Required Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string for the local SQLite database |
| `AUTH_SECRET` | Yes | Secret used by Auth.js for session signing |
| `GITHUB_CLIENT_ID` | Required for login/sync | GitHub OAuth application client ID |
| `GITHUB_CLIENT_SECRET` | Required for login/sync | GitHub OAuth application client secret |

### Default Local Values

For local development, this repository expects a SQLite database in the project root:

```env
DATABASE_URL="file:./dev.db"
```

### Generate `AUTH_SECRET`

Use any sufficiently long random string. For example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### GitHub OAuth Setup

Create a GitHub OAuth app and configure:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Then place the generated credentials into `.env.local`:

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Behavior Without GitHub Credentials

The app will still build and start without GitHub OAuth credentials, but authentication and
GitHub sync will be disabled. At startup, the server logs a warning so the missing configuration
is visible instead of silently failing later.

## Database Setup

Generate the Prisma client and apply the initial migration:

```bash
npx prisma generate
npx prisma migrate deploy
```

For a fresh local database during development, `npx prisma migrate dev` is also acceptable.

## Development

Start the local dev server:

```bash
npm run dev
```

Open:

- `http://localhost:3000/dashboard`
- `http://localhost:3000/repos`
- `http://localhost:3000/cleanup`

## Available Scripts

- `npm run dev`: Start the Next.js development server
- `npm run build`: Create a production build
- `npm run start`: Start the production server
- `npm run test`: Run the full Vitest suite
- `npm run test:e2e`: Run the repository-page rendering checks

## Verification

Run the full verification set before merging or deploying:

```bash
npm run test
npm run test:e2e
npm run build
```

## Notes

- The dashboard, repository list, detail page, and cleanup queue are server-rendered on demand
  because they depend on local database state.
- If you change the Prisma schema, regenerate the client before running the app again.
- The current implementation is optimized for a single-user local workflow.
