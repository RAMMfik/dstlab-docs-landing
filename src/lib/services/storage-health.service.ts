import { getStorageDriver } from "@/lib/services/storage.service";

export async function checkStorageHealth() {
  try {
    const driver = getStorageDriver();

    // простая проверка: получаем список поддерживаемых форматов
    const extensions = driver.getSupportedDocumentExtensions();

    if (!extensions || extensions.length === 0) {
      return {
        ok: false,
        message: "Storage driver не вернул расширения",
      };
    }

    return {
      ok: true,
      message: "Storage работает",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Storage error",
    };
  }
}