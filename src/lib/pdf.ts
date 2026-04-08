import fs from "node:fs";
import path from "node:path";

type PdfTextItem = {
  str?: string;
};

export async function parsePdfBuffer(buffer: Buffer) {
  const data = new Uint8Array(buffer);

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => {
        const maybeTextItem = item as PdfTextItem;
        return typeof maybeTextItem.str === "string" ? maybeTextItem.str : "";
      })
      .join(" ");

    text += pageText + "\n";
  }

  return text.trim();
}

export async function parsePdf(filePath: string) {
  const absolutePath = path.resolve(filePath);
  const buffer = fs.readFileSync(absolutePath);
  return parsePdfBuffer(buffer);
}