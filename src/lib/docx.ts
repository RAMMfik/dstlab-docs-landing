import fs from "node:fs/promises";

export async function parseDocxBuffer(buffer: Buffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function parseDocx(filePath: string) {
  const buffer = await fs.readFile(filePath);
  return parseDocxBuffer(buffer);
}