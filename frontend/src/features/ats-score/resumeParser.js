
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth/mammoth.browser";

// PDF worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export async function extractResumeText(file) {
  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "txt") {
    return await file.text();
  }

  if (extension === "pdf") {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: buffer,
    }).promise;

    let extractedText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      extractedText +=
        content.items.map((item) => item.str).join(" ") + "\n";
    }

    if (!extractedText.trim()) {
      throw new Error(
        "No text found in this PDF. It may be a scanned document."
      );
    }

    return extractedText;
  }

  if (extension === "docx") {
    const buffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer: buffer,
    });

    return result.value;
  }

  throw new Error("Please upload a PDF, DOCX or TXT file.");
}
