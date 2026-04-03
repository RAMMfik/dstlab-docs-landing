import fs from "node:fs/promises";

export async function parseDocx(filePath: string) {
  const buffer = await fs.readFile(filePath);

  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });

  return result.value.trim();
}