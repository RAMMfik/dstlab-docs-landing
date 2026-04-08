import { localStorageDriver } from "@/lib/services/storage.local";
import { s3StorageDriver } from "@/lib/services/storage.s3";
import type { StorageDriver } from "@/lib/services/storage.types";

function getStorageMode() {
  const mode = (process.env.STORAGE_DRIVER || "local").toLowerCase();
  return mode === "s3" ? "s3" : "local";
}

function resolveStorageDriver(): StorageDriver {
  return getStorageMode() === "s3" ? s3StorageDriver : localStorageDriver;
}

export function getStorageDriver() {
  return resolveStorageDriver();
}

export function getSupportedDocumentExtensions() {
  return resolveStorageDriver().getSupportedDocumentExtensions();
}

export function isSupportedDocumentExtension(fileName: string) {
  return resolveStorageDriver().isSupportedDocumentExtension(fileName);
}

export function getDocumentPublicUrlFromStoredFileName(fileName: string) {
  return resolveStorageDriver().getDocumentPublicUrlFromStoredFileName(fileName);
}

export async function saveDocumentFile(params: {
  originalFileName: string;
  buffer: Buffer;
}) {
  return resolveStorageDriver().saveDocumentFile(params);
}

export async function deleteDocumentFileByPublicUrl(fileUrl: string) {
  return resolveStorageDriver().deleteDocumentFileByPublicUrl(fileUrl);
}

export async function ensureDocumentFileExists(fileUrl: string) {
  return resolveStorageDriver().ensureDocumentFileExists(fileUrl);
}