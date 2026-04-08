export type SavedFileResult = {
  storedFileName: string;
  absolutePath?: string | null;
  publicUrl: string;
};

export type StorageDriver = {
  saveDocumentFile(params: {
    originalFileName: string;
    buffer: Buffer;
  }): Promise<SavedFileResult>;

  deleteDocumentFileByPublicUrl(fileUrl: string): Promise<{
    deleted: boolean;
    reason?: "not_found";
  }>;

  ensureDocumentFileExists(fileUrl: string): Promise<string>;

  getDocumentPublicUrlFromStoredFileName(fileName: string): string;

  isSupportedDocumentExtension(fileName: string): boolean;

  getSupportedDocumentExtensions(): string[];
};