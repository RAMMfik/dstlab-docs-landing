import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const LOCAL_DOCUMENTS_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "documents"
);

const PUBLIC_DOCUMENTS_PREFIX = "/uploads/documents";

function sanitizeBaseFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);

  const safeBase = base
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return safeBase || "document";
}

function normalizeExt(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

export function getSupportedDocumentExtensions() {
  return [".pdf", ".docx", ".txt"];
}

export function isSupportedDocumentExtension(fileName: string) {
  return getSupportedDocumentExtensions().includes(normalizeExt(fileName));
}

export function getDocumentPublicUrlFromStoredFileName(fileName: string) {
  return `${PUBLIC_DOCUMENTS_PREFIX}/${fileName}`;
}

export function getLocalAbsolutePathFromPublicUrl(fileUrl: string) {
  const normalized = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
  return path.join(process.cwd(), "public", normalized);
}

export async function saveDocumentFile(params: {
  originalFileName: string;
  buffer: Buffer;
}) {
  const ext = normalizeExt(params.originalFileName);
  const base = sanitizeBaseFileName(params.originalFileName);
  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
  const storedFileName = `${base}-${uniqueSuffix}${ext}`;
  const absolutePath = path.join(LOCAL_DOCUMENTS_DIR, storedFileName);

  await fs.mkdir(LOCAL_DOCUMENTS_DIR, { recursive: true });
  await fs.writeFile(absolutePath, params.buffer);

  return {
    storedFileName,
    absolutePath,
    publicUrl: getDocumentPublicUrlFromStoredFileName(storedFileName),
  };
}

export async function deleteDocumentFileByPublicUrl(fileUrl: string) {
  const absolutePath = getLocalAbsolutePathFromPublicUrl(fileUrl);

  try {
    await fs.unlink(absolutePath);
    return { deleted: true };
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : null;

    if (code === "ENOENT") {
      return { deleted: false, reason: "not_found" as const };
    }

    throw error;
  }
}

export async function ensureDocumentFileExists(fileUrl: string) {
  const absolutePath = getLocalAbsolutePathFromPublicUrl(fileUrl);
  await fs.access(absolutePath);
  return absolutePath;
}