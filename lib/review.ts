export type KeywordStatus = "present" | "partial" | "missing";

export type KeywordAlignment = {
  keyword: string;
  status: KeywordStatus;
};

export type BulletFeedback = {
  original: string;
  issue: string;
  suggestion: string;
};

export type ResumeReview = {
  matchScore: number;
  summary: string;
  skillsFound: string[];
  skillsMissing: string[];
  keywords: KeywordAlignment[];
  bulletFeedback: BulletFeedback[];
  recommendations: string[];
};

export const EXAMPLE_REVIEW: ResumeReview = {
  matchScore: 78,
  summary:
    "Frontend skills line up with the posting. The gap is data storage, delivery tooling, and bullets that describe activity instead of impact.",
  skillsFound: ["TypeScript", "React", "Next.js", "REST APIs", "Git"],
  skillsMissing: [
    "PostgreSQL — not mentioned",
    "CI/CD — not mentioned",
    "System design — not mentioned",
  ],
  keywords: [
    { keyword: "TypeScript", status: "present" },
    { keyword: "React", status: "present" },
    { keyword: "REST APIs", status: "present" },
    { keyword: "Code review", status: "partial" },
    { keyword: "PostgreSQL", status: "missing" },
    { keyword: "CI/CD", status: "missing" },
  ],
  bulletFeedback: [
    {
      original: "Built a customer dashboard in React and TypeScript.",
      issue:
        "The stack is relevant, but the line stops at the task and hides the audience.",
      suggestion:
        "Lead with the scope already in the resume: “Built a React and TypeScript customer dashboard used by 12,000 monthly users.”",
    },
    {
      original: "Helped the team ship features each sprint.",
      issue: "“Helped” hides ownership, and the line has no outcome.",
      suggestion:
        "Name the feature, your role, and one measurable outcome. Do not add a metric that is not already in the resume.",
    },
  ],
  recommendations: [
    "Open with a two-line summary that names TypeScript, React, and API work.",
    "Rewrite the dashboard bullet so the 12,000 monthly users and the 38% load-time cut come first.",
    "PostgreSQL and CI/CD are not mentioned. Add one real project, course, or plan for each, or leave them off rather than implying experience you have not shown.",
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isKeywordStatus(value: unknown): value is KeywordStatus {
  return value === "present" || value === "partial" || value === "missing";
}

function normalizeScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function asKeywords(value: unknown): KeywordAlignment[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const keywords: KeywordAlignment[] = [];

  for (const item of value) {
    if (!isRecord(item) || !isKeywordStatus(item.status)) {
      continue;
    }

    const keyword = asText(item.keyword);
    if (!keyword) {
      continue;
    }

    keywords.push({ keyword, status: item.status });
  }

  return keywords;
}

function asBulletFeedback(value: unknown): BulletFeedback[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const bullets: BulletFeedback[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const original = asText(item.original);
    const issue = asText(item.issue);
    const suggestion = asText(item.suggestion);

    if (!original || !issue || !suggestion) {
      continue;
    }

    bullets.push({ original, issue, suggestion });
  }

  return bullets;
}

export function parseResumeReview(value: unknown): ResumeReview | null {
  if (!isRecord(value)) {
    return null;
  }

  const matchScore = normalizeScore(value.matchScore);
  const summary = asText(value.summary);
  const skillsFound = asStringList(value.skillsFound);
  const skillsMissing = asStringList(value.skillsMissing);
  const keywords = asKeywords(value.keywords);
  const bulletFeedback = asBulletFeedback(value.bulletFeedback);
  const recommendations = asStringList(value.recommendations);

  if (
    matchScore === null ||
    summary === null ||
    skillsFound === null ||
    skillsMissing === null ||
    keywords === null ||
    bulletFeedback === null ||
    recommendations === null
  ) {
    return null;
  }

  return {
    matchScore,
    summary,
    skillsFound,
    skillsMissing,
    keywords,
    bulletFeedback,
    recommendations,
  };
}
