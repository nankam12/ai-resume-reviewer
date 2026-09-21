import { ArrowDown } from "lucide-react";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const points = [
  {
    title: "Missing skills",
    body: "Requirements from the posting that the resume never mentions.",
  },
  {
    title: "Keyword alignment",
    body: "Terms the job description repeats, marked as present, partial, or absent.",
  },
  {
    title: "Bullet feedback",
    body: "Lines that undersell the work, with a clearer way to write them.",
  },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 pb-6 sm:px-8 sm:pt-24">
      <p className="text-sm font-medium text-accent">Before you hit submit</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
        Turn your resume into a stronger application.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-pretty text-muted">
        ResumeLens compares your resume with a job description and identifies
        missing skills, keywords the posting emphasizes, and bullets that
        undersell your work.
      </p>
      <a
        href="#analyzer"
        className={`mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover ${focusRing}`}
      >
        Analyze a resume
        <ArrowDown className="size-4" aria-hidden="true" />
      </a>

      <ul className="mt-14 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
        {points.map((point) => (
          <li key={point.title}>
            <p className="text-sm font-semibold text-foreground">{point.title}</p>
            <p className="mt-1.5 text-sm leading-6 text-muted">{point.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
