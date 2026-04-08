import { NextResponse } from "next/server";

type JsonData = Record<string, unknown> | unknown[] | string | number | boolean | null;

type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "LIMIT_REACHED"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "INTERNAL_ERROR";

export function ok(data: JsonData, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(
  message: string,
  status = 400,
  code: ErrorCode = "BAD_REQUEST",
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export function unauthorized(message = "Не авторизован") {
  return apiError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "Недостаточно прав") {
  return apiError(message, 403, "FORBIDDEN");
}

export function notFound(message = "Ресурс не найден") {
  return apiError(message, 404, "NOT_FOUND");
}

export function badRequest(
  message = "Некорректный запрос",
  code: ErrorCode = "BAD_REQUEST",
  details?: Record<string, unknown>
) {
  return apiError(message, 400, code, details);
}

export function internalError(message = "Внутренняя ошибка сервера") {
  return apiError(message, 500, "INTERNAL_ERROR");
}