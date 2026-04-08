import crypto from "node:crypto";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { StorageDriver, SavedFileResult } from "@/lib/services/storage.types";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Не задана env-переменная ${name} для S3 storage`);
  }
  return value;
}

function createS3Client() {
  const region = getRequiredEnv("S3_REGION");
  const accessKeyId = getRequiredEnv("S3_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("S3_SECRET_ACCESS_KEY");
  const endpoint = process.env.S3_ENDPOINT || undefined;
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  return new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getBucket() {
  return getRequiredEnv("S3_BUCKET");
}

function getPublicBaseUrl() {
  return getRequiredEnv("S3_PUBLIC_BASE_URL").replace(/\/+$/, "");
}

function normalizeExt(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

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

function getObjectKey(fileName: string) {
  return `documents/${fileName}`;
}

function extractStoredFileNameFromPublicUrl(fileUrl: string) {
  const publicBaseUrl = getPublicBaseUrl();

  if (!fileUrl.startsWith(publicBaseUrl)) {
    throw new Error("fileUrl не соответствует текущему S3_PUBLIC_BASE_URL");
  }

  return fileUrl.slice(publicBaseUrl.length + 1).replace(/^documents\//, "");
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  if (
    typeof stream === "object" &&
    stream !== null &&
    "transformToByteArray" in stream &&
    typeof (stream as { transformToByteArray?: unknown }).transformToByteArray === "function"
  ) {
    const bytes = await (
      stream as { transformToByteArray: () => Promise<Uint8Array> }
    ).transformToByteArray();

    return Buffer.from(bytes);
  }

  const chunks: Buffer[] = [];

  for await (const chunk of stream as AsyncIterable<Uint8Array | Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export const s3StorageDriver: StorageDriver = {
  getSupportedDocumentExtensions() {
    return [".pdf", ".docx", ".txt"];
  },

  isSupportedDocumentExtension(fileName: string) {
    return this.getSupportedDocumentExtensions().includes(normalizeExt(fileName));
  },

  getDocumentPublicUrlFromStoredFileName(fileName: string) {
    return `${getPublicBaseUrl()}/${getObjectKey(fileName)}`;
  },

  async saveDocumentFile(params): Promise<SavedFileResult> {
    const client = createS3Client();
    const bucket = getBucket();

    const ext = normalizeExt(params.originalFileName);
    const base = sanitizeBaseFileName(params.originalFileName);
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const storedFileName = `${base}-${uniqueSuffix}${ext}`;
    const key = getObjectKey(storedFileName);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: params.buffer,
      })
    );

    return {
      storedFileName,
      absolutePath: null,
      publicUrl: this.getDocumentPublicUrlFromStoredFileName(storedFileName),
    };
  },

  async deleteDocumentFileByPublicUrl(fileUrl) {
    const client = createS3Client();
    const bucket = getBucket();
    const storedFileName = extractStoredFileNameFromPublicUrl(fileUrl);
    const key = getObjectKey(storedFileName);

    try {
      await client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
    } catch {
      return { deleted: false, reason: "not_found" as const };
    }

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    return { deleted: true };
  },

  async getDocumentBufferByPublicUrl(fileUrl) {
    const client = createS3Client();
    const bucket = getBucket();
    const storedFileName = extractStoredFileNameFromPublicUrl(fileUrl);
    const key = getObjectKey(storedFileName);

    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    if (!result.Body) {
      throw new Error("S3 не вернул тело файла");
    }

    return streamToBuffer(result.Body);
  },
};