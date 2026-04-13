type CleanupCandidateInput = {
  updatedAt: Date;
  hasMyCommits: "yes" | "no" | "unknown";
  note: string | null;
  tags: string[];
  isFavorite: boolean;
  lastReviewedAt: Date | null;
};

type CleanupCandidateResult = {
  isCandidate: boolean;
  reasons: string[];
};

const SIX_MONTHS_IN_MS = 1000 * 60 * 60 * 24 * 183;
const REVIEW_WINDOW_IN_MS = 1000 * 60 * 60 * 24 * 90;

export function scoreCleanupCandidate(
  input: CleanupCandidateInput
): CleanupCandidateResult {
  const now = Date.now();
  const reasons: string[] = [];

  if (now - input.updatedAt.getTime() > SIX_MONTHS_IN_MS) {
    reasons.push("No recent updates");
  }

  if (!input.note) {
    reasons.push("No personal note");
  }

  if (input.tags.length === 0) {
    reasons.push("No tags");
  }

  if (input.hasMyCommits === "no") {
    reasons.push("No user commits");
  }

  if (!input.isFavorite) {
    reasons.push("Not favorited");
  }

  if (
    input.lastReviewedAt === null ||
    now - input.lastReviewedAt.getTime() > REVIEW_WINDOW_IN_MS
  ) {
    reasons.push("Not reviewed recently");
  }

  return {
    isCandidate: reasons.length >= 4,
    reasons
  };
}
