import { Check, Minus } from "lucide-react";
import type { KeywordStatus, ResumeReview } from "@/lib/review";

const STATUS_LABEL: Record<KeywordStatus, string> = {
  present: "Present",
  partial: "Partial",
  missing: "Missing",
};

const STATUS_CLASS: Record<KeywordStatus, string> = {
  present: "bg-[#e5f0ea] text-[#1b4336]",
  partial: "bg-[#f6edd9] text-[#7a5412]",
  missing: "bg-[#f6e4dc] text-[#7a3e2a]",
};

function SkillList({
  title,
  description,
  skills,
  tone,
  emptyLabel,
}: {
  title: string;
  description: string;
  skills: string[];
  tone: "found" | "missing";
  emptyLabel: string;
}) {
  const chipClass =
    tone === "found"
      ? "bg-[#e5f0ea] text-[#1b4336]"
      : "bg-[#f6e4dc] text-[#7a3e2a]";
  const Icon = tone === "found" ? Check : Minus;

  return (
    <div className="bg-card p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      {skills.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">{emptyLabel}</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <li key={`${skill}-${index}`}>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm ${chipClass}`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {skill}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ResultsPreviewProps = {
  review: ResumeReview;
  source: "example" | "live";
  loading: boolean;
};

export function ResultsPreview({ review, source, loading }: ResultsPreviewProps) {
  const isExample = source === "example";

  return (
    <section
      id="preview"
      aria-labelledby="preview-heading"
      aria-busy={loading}
      className="scroll-mt-20 border-t border-line bg-band"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-full border border-line bg-highlight px-2.5 py-1 text-xs font-medium text-foreground">
            {isExample ? "Example preview" : "Your review"}
          </p>
        </div>
        <h2
          id="preview-heading"
          className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {isExample ? "What a review looks like" : "Review for this application"}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          {isExample
            ? "Sample output for a frontend engineer resume compared with a full-stack posting. Run the analyzer to replace this with a review of your text."
            : "Findings from the resume and job description you submitted. Missing items are requirements the resume does not mention."}
        </p>
        {loading ? (
          <p role="status" className="mt-4 text-sm font-medium text-foreground">
            Analyzing...
          </p>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_2px_rgba(28,25,22,0.04)]">
          <div className="grid gap-6 border-b border-line p-5 sm:p-6 lg:grid-cols-[220px_1fr] lg:items-end">
            <div>
              <p className="text-sm font-medium text-muted">Match score</p>
              <p className="mt-1 font-mono text-5xl font-medium tracking-tight text-foreground">
                <span className="sr-only">Match score </span>
                {review.matchScore}
                <span className="text-2xl text-muted">%</span>
              </p>
              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-highlight"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${review.matchScore}%` }}
                />
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-foreground sm:text-base sm:leading-7">
              {review.summary}
            </p>
          </div>

          <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
            <SkillList
              title="Skills found"
              description="Written in the resume and relevant to this role."
              skills={review.skillsFound}
              tone="found"
              emptyLabel="No matching skills were identified."
            />
            <SkillList
              title="Skills missing"
              description="Asked for in the job description, and not mentioned in the resume."
              skills={review.skillsMissing}
              tone="missing"
              emptyLabel="No unmentioned requirements stood out."
            />
          </div>

          <div className="grid divide-y divide-line border-t border-line lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <div className="bg-card p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground">Keyword alignment</h3>
              {review.keywords.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-muted">
                  No keywords were returned for this comparison.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {review.keywords.map((keyword, index) => (
                    <li
                      key={`${keyword.keyword}-${index}`}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm"
                    >
                      <span className="text-foreground">{keyword.keyword}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[keyword.status]}`}
                      >
                        {STATUS_LABEL[keyword.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground">Bullet feedback</h3>
              {review.bulletFeedback.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-muted">
                  No bullet-level issues stood out for this job.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {review.bulletFeedback.map((bullet, index) => (
                    <li
                      key={`${bullet.original}-${index}`}
                      className="rounded-xl border border-line bg-background p-4"
                    >
                      <p className="text-sm leading-6 text-foreground">“{bullet.original}”</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{bullet.issue}</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        <span className="font-medium">Suggestion. </span>
                        {bullet.suggestion}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="border-t border-line bg-[#f7f3ea] px-5 py-6 sm:px-6">
            <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
            {review.recommendations.length === 0 ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                No recommendations were returned.
              </p>
            ) : (
              <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
                {review.recommendations.map((recommendation, index) => (
                  <li key={`${recommendation}-${index}`}>{recommendation}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
