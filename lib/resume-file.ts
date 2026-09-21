export const MAX_RESUME_CHARS = 20_000;
export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_PAGES = 15;

const PDF_TYPES = new Set([
  "",
  "application/pdf",
  "application/x-pdf",
  "application/acrobat",
  "application/vnd.pdf",
  "text/pdf",
  "application/octet-stream",
]);

export function pdfFileError(file: { name: string; type: string; size: number }): string | null {
  const extensionOk = file.name.toLowerCase().endsWith(".pdf");
  const typeOk = PDF_TYPES.has(file.type.toLowerCase());

  if (!extensionOk || !typeOk) {
    return "Upload a PDF file. Other file types are not accepted.";
  }

  if (file.size <= 0) {
    return "That PDF is empty. Choose another file or paste the resume text.";
  }

  if (file.size > MAX_PDF_BYTES) {
    return "That PDF is larger than 5 MB. Choose a smaller file or paste the resume text.";
  }

  return null;
}
