import type { StorageDriver, SavedFileResult } from "@/lib/services/storage.types";

function notConfigured(): never {
  throw new Error(
    "S3 storage driver пока не настроен. Переключите STORAGE_DRIVER=local или реализуйте S3 client."
  );
}

export const s3StorageDriver: StorageDriver = {
  getSupportedDocumentExtensions() {
    return [".pdf", ".docx", ".txt"];
  },

  isSupportedDocumentExtension(fileName: string) {
    const lower = fileName.toLowerCase();
    return (
      lower.endsWith(".pdf") ||
      lower.endsWith(".docx") ||
      lower.endsWith(".txt")
    );
  },

  getDocumentPublicUrlFromStoredFileName(fileName: string) {
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL || "";
    if (!publicBaseUrl) {
      notConfigured();
    }

    return `${publicBaseUrl.replace(/\/+$/, "")}/${fileName}`;
  },

  async saveDocumentFile(_params: {
    originalFileName: string;
    buffer: Buffer;
  }): Promise<SavedFileResult> {
    return notConfigured();
  },

  async deleteDocumentFileByPublicUrl(
    _fileUrl: string
  ): Promise<{ deleted: boolean; reason?: "not_found" }> {
    return notConfigured();
  },

  async ensureDocumentFileExists(_fileUrl: string): Promise<string> {
    return notConfigured();
  },
};