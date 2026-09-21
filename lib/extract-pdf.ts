import { extractText, getDocumentProxy } from "unpdf";
import { MAX_PDF_PAGES, MAX_RESUME_CHARS } from "@/lib/resume-file";

export type PdfExtractResult =
  | { ok: true; text: string }
  | { ok: false; status: number; error: string };

const UNREADABLE_PDF =
  "The resume PDF could not be read. If it is password-protected or damaged, paste the resume text instead.";

const NO_TEXT =
  "This PDF has no extractable text. If it is a scanned image, paste the resume text instead.";

function hasPdfHeader(data: Uint8Array): boolean {
  const limit = Math.min(data.length, 1024);
  const header = new TextDecoder("latin1").decode(data.subarray(0, limit));
  return header.includes("%PDF-");
}

export async function extractResumePdf(data: Uint8Array): Promise<PdfExtractResult> {
  if (!hasPdfHeader(data)) {
    return {
      ok: false,
      status: 400,
      error: "Upload a PDF file. Other file types are not accepted.",
    };
  }

  let pdf: Awaited<ReturnType<typeof getDocumentProxy>> | undefined;

  try {
    pdf = await getDocumentProxy(data);

    if (pdf.numPages > MAX_PDF_PAGES) {
      return {
        ok: false,
        status: 400,
        error: `This PDF has too many pages. Upload a resume of ${MAX_PDF_PAGES} pages or fewer, or paste the text.`,
      };
    }

    const extracted = await extractText(pdf, { mergePages: true });
    const text = extracted.text.replaceAll("\u0000", "").trim();

    if (!text) {
      return { ok: false, status: 422, error: NO_TEXT };
    }

    if (text.length > MAX_RESUME_CHARS) {
      return {
        ok: false,
        status: 400,
        error: `The extracted resume is longer than ${MAX_RESUME_CHARS.toLocaleString()} characters. Shorten it or paste a shorter version.`,
      };
    }

    return { ok: true, text };
  } catch (error) {
    console.error(
      "PDF extraction failed:",
      error instanceof Error ? error.name : "unknown",
    );
    return { ok: false, status: 422, error: UNREADABLE_PDF };
  } finally {
    await pdf?.loadingTask.destroy();
  }
}
