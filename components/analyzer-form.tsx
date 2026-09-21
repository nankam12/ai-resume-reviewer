"use client";

import { ArrowRight, Briefcase, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { useId, useRef, useState, type DragEvent, type FormEvent, type ReactNode, type RefObject } from "react";
import { pdfFileError } from "@/lib/resume-file";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const RESUME_PLACEHOLDER = `Alex Rivera
Software Engineer

Experience
Frontend Engineer, Northwind Labs — 2023 to Present
- Built a customer dashboard in React and TypeScript used by 12,000 monthly users
- Reduced billing page load time by 38% by splitting the checkout bundle

Skills
TypeScript, React, Next.js, Node.js, Git`;

const JOB_PLACEHOLDER = `Full-Stack Engineer

We are hiring someone to own features from design through production.

Requirements
- 2+ years with TypeScript and React
- Experience designing REST APIs and working with PostgreSQL
- Comfort with CI/CD, code review, and writing clear pull requests
- Resume bullets should show measurable impact, not only responsibilities`;

type AnalyzerInput = {
  resume: string;
  jobDescription: string;
};

type InputPanelProps = {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  value: string;
  placeholder: string;
  disabled: boolean;
  dragging?: boolean;
  onChange: (value: string) => void;
  onDragEnter?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  children?: ReactNode;
};

function InputPanel({
  id,
  label,
  description,
  icon,
  value,
  placeholder,
  disabled,
  dragging = false,
  onChange,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: InputPanelProps) {
  const countId = `${id}-count`;

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(28,25,22,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(28,25,22,0.05)] sm:p-5 ${
        dragging ? "border-accent" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-accent" aria-hidden="true">
          {icon}
        </span>
        <div>
          <label htmlFor={id} className="text-base font-semibold text-foreground">
            {label}
          </label>
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      {children}
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={12}
        spellCheck
        disabled={disabled}
        aria-describedby={countId}
        className={`mt-4 min-h-72 w-full resize-y rounded-xl border border-line bg-background px-4 py-3 text-sm leading-6 text-foreground placeholder:text-[#8a837a] disabled:cursor-wait disabled:opacity-80 ${focusRing}`}
      />
      <p id={countId} className="mt-2 text-right text-xs tabular-nums text-muted">
        {value.length.toLocaleString()} characters
      </p>
    </div>
  );
}

type ResumePdfControlProps = {
  fileName: string | null;
  extracting: boolean;
  disabled: boolean;
  dragging: boolean;
  describedBy: string;
  invalid: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onRemove: () => void;
};

function ResumePdfControl({
  fileName,
  extracting,
  disabled,
  dragging,
  describedBy,
  invalid,
  inputRef,
  onFile,
  onRemove,
}: ResumePdfControlProps) {
  const inputId = "resume-pdf";

  function handleChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    onFile(file);
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-line bg-background px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          name="resume-pdf"
          type="file"
          accept="application/pdf,.pdf"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            handleChange(event.target.files);
            event.target.value = "";
          }}
          className="peer sr-only"
        />
        <label
          htmlFor={inputId}
          className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-3 text-sm font-medium text-foreground peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-60 ${
            disabled ? "pointer-events-none opacity-60" : "hover:bg-highlight"
          }`}
        >
          <Upload className="size-4" aria-hidden="true" />
          {fileName ? "Replace PDF" : "Upload PDF"}
        </label>
        {fileName ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-sm font-medium text-foreground hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            <X className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        ) : null}
      </div>
      <p id="resume-pdf-hint" className="mt-2 text-sm leading-6 text-muted">
        {dragging
          ? "Drop the PDF to extract its text."
          : fileName
            ? `Selected file: ${fileName}. The extracted text is in the box below, and you can edit it.`
            : "PDF only, up to 5 MB. You can also paste resume text below."}
      </p>
      {extracting ? (
        <p role="status" className="mt-2 text-sm font-medium text-foreground">
          Extracting resume...
        </p>
      ) : null}
    </div>
  );
}

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

  return "The resume PDF could not be read. Try another file or paste the text.";
}

type AnalyzerFormProps = {
  loading: boolean;
  error: string | null;
  onAnalyze: (input: AnalyzerInput) => void;
  onClearError: () => void;
};

export function AnalyzerForm({ loading, error, onAnalyze, onClearError }: AnalyzerFormProps) {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const extractAbortRef = useRef<AbortController | null>(null);

  const busy = extracting || loading;
  const canAnalyze = resume.trim().length > 0 && jobDescription.trim().length > 0 && !extracting;
  const visibleError = fileError ?? error;

  async function acceptPdf(file: File) {
    const validationError = pdfFileError(file);
    onClearError();

    if (validationError) {
      setFileName(null);
      setFileError(validationError);
      return;
    }

    extractAbortRef.current?.abort();
    const controller = new AbortController();
    extractAbortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 45_000);

    setFileError(null);
    setFileName(file.name);
    setExtracting(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/extract-resume", {
        method: "POST",
        body,
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (extractAbortRef.current !== controller) {
        return;
      }

      if (!response.ok) {
        setFileName(null);
        setFileError(readError(payload));
        return;
      }

      const text =
        typeof payload === "object" &&
        payload !== null &&
        "text" in payload &&
        typeof payload.text === "string"
          ? payload.text.trim()
          : "";

      if (!text) {
        setFileName(null);
        setFileError(
          "This PDF has no extractable text. If it is a scanned image, paste the resume text instead.",
        );
        return;
      }

      setResume(text);
    } catch (requestError) {
      if (extractAbortRef.current !== controller) {
        return;
      }

      setFileName(null);
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        setFileError("Extracting the resume took too long. Try again or paste the text.");
        return;
      }

      setFileError("The resume PDF could not be uploaded. Check your connection and try again.");
    } finally {
      window.clearTimeout(timeout);
      if (extractAbortRef.current === controller) {
        extractAbortRef.current = null;
        setExtracting(false);
      }
    }
  }

  function removePdf() {
    extractAbortRef.current?.abort();
    extractAbortRef.current = null;
    setExtracting(false);
    setFileName(null);
    setFileError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }

    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (busy) {
      return;
    }

    const file = event.dataTransfer.files[0];
    if (file) {
      void acceptPdf(file);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAnalyze || loading) {
      return;
    }

    onAnalyze({
      resume: resume.trim(),
      jobDescription: jobDescription.trim(),
    });
  }

  const buttonLabel = extracting ? "Extracting resume..." : loading ? "Analyzing..." : "Analyze Resume";

  return (
    <form onSubmit={handleSubmit} className="mt-8" aria-busy={busy}>
      <div className="grid gap-5 lg:grid-cols-2">
        <InputPanel
          id="resume"
          label="Your Resume"
          description="Paste your resume, or upload a PDF. Include roles, bullets, and skills."
          icon={<FileText className="size-5" />}
          value={resume}
          placeholder={RESUME_PLACEHOLDER}
          disabled={busy}
          dragging={dragging}
          onChange={setResume}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ResumePdfControl
            fileName={fileName}
            extracting={extracting}
            disabled={busy}
            dragging={dragging}
            describedBy={visibleError ? `${hintId} resume-pdf-hint` : "resume-pdf-hint"}
            invalid={Boolean(fileError)}
            inputRef={inputRef}
            onFile={(file) => {
              void acceptPdf(file);
            }}
            onRemove={removePdf}
          />
        </InputPanel>
        <InputPanel
          id="job-description"
          label="Job Description"
          description="Paste the posting you want this resume measured against."
          icon={<Briefcase className="size-5" />}
          value={jobDescription}
          placeholder={JOB_PLACEHOLDER}
          disabled={busy}
          onChange={setJobDescription}
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        {visibleError ? (
          <p id={hintId} role="alert" className="max-w-xl text-sm leading-6 text-[#7a3e2a]">
            {visibleError}
          </p>
        ) : (
          <p
            id={hintId}
            role={busy ? "status" : undefined}
            className="max-w-xl text-sm leading-6 text-muted"
          >
            {extracting
              ? "Extracting resume..."
              : loading
                ? "Analyzing..."
                : "Paste a resume or upload a PDF, then add a job description. Nothing is stored."}
          </p>
        )}
        <button
          type="submit"
          disabled={!canAnalyze || loading}
          aria-describedby={hintId}
          className={`inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover sm:w-auto sm:min-w-48 ${
            busy
              ? "cursor-wait disabled:bg-accent disabled:text-accent-foreground disabled:opacity-80 disabled:hover:bg-accent"
              : "disabled:cursor-not-allowed disabled:bg-[#ddd6cb] disabled:text-[#4f4943] disabled:hover:bg-[#ddd6cb]"
          } ${focusRing}`}
        >
          {buttonLabel}
          {busy ? (
            <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </form>
  );
}
