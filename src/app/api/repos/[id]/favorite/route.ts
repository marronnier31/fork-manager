import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import type { RepoStatus } from "../../../../../lib/repos/types";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type PersonalState = {
  status: RepoStatus;
  tags: string;
  note: string | null;
  savedReason: string | null;
  reviewLaterAt: Date | null;
  isFavorite: boolean;
  lastReviewedAt: Date | null;
};

function parseTags(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function buildPersonalState(existing: PersonalState | null, nextFavorite: boolean): PersonalState {
  return {
    status: existing?.status ?? "watching",
    tags: JSON.stringify(parseTags(existing?.tags)),
    note: existing?.note ?? null,
    savedReason: existing?.savedReason ?? null,
    reviewLaterAt: existing?.reviewLaterAt ?? null,
    isFavorite: nextFavorite,
    lastReviewedAt: existing?.lastReviewedAt ?? null
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await Promise.resolve(params);
  const repository = await db.repository.findUnique({
    where: { id },
    include: { personal: true }
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  let payload: { isFavorite?: boolean } | null = null;

  try {
    payload = (await request.json()) as { isFavorite?: boolean };
  } catch {
    payload = null;
  }

  const nextFavorite =
    typeof payload?.isFavorite === "boolean"
      ? payload.isFavorite
      : !repository.personal?.isFavorite;

  const personal = buildPersonalState(repository.personal as PersonalState | null, nextFavorite);

  const updatedRepository = await db.repository.update({
    where: { id },
    data: {
      personal: {
        upsert: {
          create: personal,
          update: personal
        }
      }
    },
    include: { personal: true }
  });

  return NextResponse.json(updatedRepository);
}
