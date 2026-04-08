import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { StorageDriver } from "@/lib/services/storage.types";

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

function getAbsolutePathFromPublicUrl(fileUrl: string) {
  const normalized = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
  return path.join(process.cwd(), "public", normalized);
}

export const localStorageDriver: StorageDriver = {
  getSupportedDocumentExtensions() {
    return [".pdf", ".docx", ".txt"];
  },

  isSupportedDocumentExtension(fileName: string) {
    return this.getSupportedDocumentExtensions().includes(normalizeExt(fileName));
  },

  getDocumentPublicUrlFromStoredFileName(fileName: string) {
    return `${PUBLIC_DOCUMENTS_PREFIX}/${fileName}`;
  },

  async saveDocumentFile(params) {
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
      publicUrl: this.getDocumentPublicUrlFromStoredFileName(storedFileName),
    };
  },

  async deleteDocumentFileByPublicUrl(fileUrl) {
    const absolutePath = getAbsolutePathFromPublicUrl(fileUrl);

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
  },

  async getDocumentBufferByPublicUrl(fileUrl) {
    const absolutePath = getAbsolutePathFromPublicUrl(fileUrl);
    return fs.readFile(absolutePath);
  },
};