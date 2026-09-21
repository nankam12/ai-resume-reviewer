"use client";

import { useState } from "react";
import { AnalyzerForm } from "@/components/analyzer-form";
import { ResultsPreview } from "@/components/results-preview";
import { EXAMPLE_REVIEW, parseResumeReview, type ResumeReview } from "@/lib/review";

function readError(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.trim().length > 0
  ) {
    return payload.error;
  }

  return "The analyzer could not complete this review. Try again.";
}

export function AnalyzerSection() {
  const [review, setReview] = useState<ResumeReview>(EXAMPLE_REVIEW);
  const [source, setSource] = useState<"example" | "live">("example");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(input: { resume: string; jobDescription: string }) {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(readError(payload));
        return;
      }

      const parsed = parseResumeReview(payload);
      if (!parsed) {
        setError("The analyzer returned an unexpected result. Try again.");
        return;
      }

      setReview(parsed);
      setSource("live");

      const preview = document.getElementById("preview");
      if (!preview) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      preview.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        setError("The review took too long. Try again.");
        return;
      }

      setError("The analyzer could not be reached. Check your connection and try again.");
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <>
      <section id="analyzer" aria-labelledby="analyzer-heading" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2
            id="analyzer-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Compare a resume with a role
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Put the resume on the left and the job description on the right.
            Paste the resume or upload a PDF. ResumeLens compares it with the
            role and returns a review.
          </p>
          <AnalyzerForm
            loading={loading}
            error={error}
            onAnalyze={handleAnalyze}
            onClearError={() => setError(null)}
          />
        </div>
      </section>
      <ResultsPreview review={review} source={source} loading={loading} />
    </>
  );
}
