-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repoId" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "description" TEXT,
    "isFork" BOOLEAN NOT NULL DEFAULT true,
    "parentFullName" TEXT,
    "topics" TEXT NOT NULL DEFAULT '[]',
    "primaryLanguage" TEXT,
    "stargazersCount" INTEGER NOT NULL DEFAULT 0,
    "forksCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "pushedAt" DATETIME,
    "defaultBranch" TEXT,
    "summary" TEXT,
    "techStack" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT,
    "hasReadme" BOOLEAN NOT NULL DEFAULT false,
    "readmeExcerpt" TEXT,
    "analyzedAt" DATETIME,
    "activityScore" INTEGER,
    "cleanupReasons" TEXT NOT NULL DEFAULT '[]',
    "isLikelyAbandoned" BOOLEAN NOT NULL DEFAULT false,
    "hasMyCommits" TEXT NOT NULL DEFAULT 'unknown'
);

-- CreateTable
CREATE TABLE "RepositoryPersonal" (
    "repositoryId" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'watching',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT,
    "savedReason" TEXT,
    "reviewLaterAt" DATETIME,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "lastReviewedAt" DATETIME,
    CONSTRAINT "RepositoryPersonal_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_repoId_key" ON "Repository"("repoId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");
