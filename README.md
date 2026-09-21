# ResumeLens

ResumeLens is an AI-powered resume analyzer. It compares a resume with a job description and returns a structured review: a match score, a short summary, skills found, skills the posting asks for that the resume does not mention, keyword alignment, bullet feedback, and practical recommendations.

The review is generated for the text you submit. Resumes are not saved.

## Live Demo

**Live Demo:** not deployed yet. Replace this line with the hosted URL when one exists.

## Features

- Paste a resume and a job description, or upload a PDF resume instead of pasting.
- Select a PDF by clicking **Upload PDF**, or drag and drop it onto the resume panel.
- Accept PDF files only, up to 5 MB and 15 pages. Other types and oversized files are rejected with a clear message.
- Extract text from the PDF on the server, place it in the resume box, and allow edits before analysis.
- Replace or remove the selected PDF. Removing the file keeps the extracted text so it can still be edited.
- Send the resume text and job description to Gemini and show a structured review.
- Show an example review before the first analysis, then replace it with the result.
- Show **Extracting resume...** while a PDF is read and **Analyzing...** while the review is generated.
- Keep the Gemini API key on the server. Uploaded PDFs are processed in memory for that request and are not stored.

Scanned image PDFs and password-protected PDFs cannot be read. The app asks you to paste the text instead.

## Tech Stack

- [Next.js](https://nextjs.org) 16.3.5 (App Router, Node.js route handlers)
- [React](https://react.dev) 19
- TypeScript 5
- [Tailwind CSS](https://tailwindcss.com) 4
- [Geist](https://vercel.com/font) and Geist Mono through `next/font`
- [Google Gen AI SDK](https://github.com/googleapis/js-genai) (`@google/genai`)
- Gemini model `gemini-3.5-flash-lite`
- [unpdf](https://github.com/unjs/unpdf) for server-side PDF text extraction
- [Lucide](https://lucide.dev) icons
- ESLint 9 with `eslint-config-next`

`unpdf` requires Node.js 22 or later.

## How It Works

The page is a single screen: a header, a short introduction, the analyzer, and the review.

1. **Input.** The resume box accepts pasted text. A PDF can be chosen with the file input or dropped on the resume card. The job description is always pasted.
2. **PDF extraction.** The browser sends the file as `multipart/form-data` to `POST /api/extract-resume`. The route checks the file name, type, and size, confirms the PDF header, and rejects documents over 15 pages. `unpdf` extracts the text. The raw PDF is not sent to Gemini.
3. **Review request.** **Analyze Resume** sends JSON to `POST /api/analyze`:

   ```json
   {
     "resume": "...",
     "jobDescription": "..."
   }
   ```

   Both fields are required and limited to 20,000 characters.
4. **Model call.** The route calls `analyzeResume` in `lib/analyze-resume.ts`. That function uses `@google/genai` with `GEMINI_API_KEY` and asks `gemini-3.5-flash-lite` for JSON that matches a fixed schema. The prompt tells the model to use only the supplied resume and job description, and not to invent experience.
5. **Result.** The server checks the JSON shape and returns it. The page renders the match score (0–100), summary, skills, keywords (`present`, `partial`, or `missing`), bullet feedback, and recommendations.

```text
app/page.tsx                 Home page
components/                  Form, review, header, and footer
app/api/extract-resume/      PDF upload and text extraction
app/api/analyze/             Resume review
lib/extract-pdf.ts           unpdf extraction
lib/analyze-resume.ts        Gemini request and schema
lib/review.ts                Review types and response checks
lib/resume-file.ts           Size and file-type limits
```

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd ai-resume-reviewer
npm install
```

Create `.env.local` in the project root:

```bash
GEMINI_API_KEY=your_key_here
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey). Do not commit `.env.local`. It is listed in `.gitignore`.

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run lint    # ESLint
npm run build   # production build
npm start       # run the production build
```

There is no test script in this project.

## Environment Variables

| Name | Required | Where it is used |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Server only. Read in `app/api/analyze/route.ts` and `lib/analyze-resume.ts`. |

Next.js loads `.env.local` for the server. The name is not prefixed with `NEXT_PUBLIC_`, so the key is not bundled into client JavaScript. Error logs redact the key before they are printed.

## Deployment

This repository does not include a deployment config, CI workflow, or live URL.

To host it, use a Node.js environment that can run Next.js 16 and set `GEMINI_API_KEY` in the host’s environment variables. Do not expose that variable to the browser. Then build and start the app:

```bash
npm run build
npm start
```

The analyze route allows up to 60 seconds, and PDF extraction allows up to 30 seconds (`maxDuration` on those route handlers). A host with a shorter function timeout may need that limit raised.

## Screenshots

Add images here after capturing the running app. Suggested files:

1. Home and analyzer — `docs/screenshots/home.png`
2. PDF selected and text extracted — `docs/screenshots/pdf-upload.png`
3. Completed review — `docs/screenshots/review.png`

## Future Improvements

These are ideas, not current features:

- OCR for scanned resumes, which this version cannot read.
- Support for DOCX uploads.
- Saved reviews for returning to an earlier comparison.
- Automated tests for validation, PDF extraction, and the review parser.
- A deployed demo with the live URL filled in above.

## What I Learned

This project was a chance to keep an AI feature on the server instead of calling the model from the browser. The review route validates input, requests a JSON schema from Gemini, and checks the response before the UI renders it. PDF upload is a separate step: the file is checked and converted to text, then the existing analyze route does the review. The interface stays usable while either step is running, and failures such as a non-PDF, an empty scan, or a model error are shown as short messages rather than stack traces.
