import { extractResumePdf } from "@/lib/extract-pdf";
import { MAX_PDF_BYTES, pdfFileError } from "@/lib/resume-file";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_REQUEST_BYTES = MAX_PDF_BYTES + 64 * 1024;

export async function POST(request: Request) {
  const lengthHeader = request.headers.get("content-length");

  if (lengthHeader) {
    const length = Number(lengthHeader);
    if (!Number.isFinite(length) || length > MAX_REQUEST_BYTES) {
      return Response.json(
        {
          error:
            "That PDF is larger than 5 MB. Choose a smaller file or paste the resume text.",
        },
        { status: 400 },
      );
    }
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { error: "The resume PDF could not be uploaded. Try again or paste the text." },
      { status: 400 },
    );
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a PDF resume to upload." }, { status: 400 });
  }

  const fileError = pdfFileError(file);

  if (fileError) {
    return Response.json({ error: fileError }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await extractResumePdf(bytes);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ text: result.text });
}
