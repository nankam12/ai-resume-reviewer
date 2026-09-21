import { analyzeResume, redactSecrets } from "@/lib/analyze-resume";
import { parseResumeReview } from "@/lib/review";
import { MAX_RESUME_CHARS } from "@/lib/resume-file";

export const runtime = "nodejs";
export const maxDuration = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Send a JSON body with resume and jobDescription." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { error: "Send a JSON object with resume and jobDescription." },
      { status: 400 },
    );
  }

  const { resume, jobDescription } = body;

  if (typeof resume !== "string" || typeof jobDescription !== "string") {
    return Response.json(
      { error: "Resume and job description must both be text." },
      { status: 400 },
    );
  }

  const trimmedResume = resume.trim();
  const trimmedJob = jobDescription.trim();

  if (!trimmedResume || !trimmedJob) {
    return Response.json(
      { error: "Add both a resume and a job description before analyzing." },
      { status: 400 },
    );
  }

  if (trimmedResume.length > MAX_RESUME_CHARS || trimmedJob.length > MAX_RESUME_CHARS) {
    return Response.json(
      {
        error: `Keep each field under ${MAX_RESUME_CHARS.toLocaleString()} characters.`,
      },
      { status: 400 },
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "Analysis is unavailable because the server is not configured." },
      { status: 500 },
    );
  }

  try {
    const rawReview = await analyzeResume(trimmedResume, trimmedJob);
    const review = parseResumeReview(rawReview);

    if (!review) {
      return Response.json(
        { error: "The analyzer returned an unexpected result. Try again." },
        { status: 502 },
      );
    }

    return Response.json(review);
  } catch (error) {
    console.error("Resume analysis failed:", redactSecrets(error));
    return Response.json(
      { error: "The analyzer could not complete this review. Try again in a moment." },
      { status: 502 },
    );
  }
}
