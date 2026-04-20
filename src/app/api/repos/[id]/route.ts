import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import type { RepoStatus } from "../../../../lib/repos/types";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type PersonalPayload = {
  status?: RepoStatus;
  note?: string | null;
  tags?: string[] | string;
  savedReason?: string | null;
  reviewLaterAt?: string | null;
  isFavorite?: boolean;
};

function parseTags(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseDate(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value.trim() === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeText(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function buildPersonalMutation(payload: PersonalPayload) {
  const tags = payload.tags === undefined ? undefined : JSON.stringify(parseTags(payload.tags));
  const note = normalizeText(payload.note);
  const savedReason = normalizeText(payload.savedReason);
  const reviewLaterAt = parseDate(payload.reviewLaterAt);

  return {
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(tags !== undefined ? { tags } : {}),
    ...(note !== undefined ? { note } : {}),
    ...(savedReason !== undefined ? { savedReason } : {}),
    ...(reviewLaterAt !== undefined ? { reviewLaterAt } : {}),
    ...(payload.isFavorite !== undefined ? { isFavorite: payload.isFavorite } : {}),
    lastReviewedAt: new Date()
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await Promise.resolve(params);
  const payload = (await request.json()) as PersonalPayload;
  const personal = buildPersonalMutation(payload);

  try {
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
  } catch {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }
}
