const ALFAPAY_API_URL = process.env.ALFAPAY_API_URL!;
const ALFAPAY_API_KEY = process.env.ALFAPAY_API_KEY!;
const ALFAPAY_PROJECT_ID = process.env.ALFAPAY_PROJECT_ID!;

if (!ALFAPAY_API_URL) {
  throw new Error("ALFAPAY_API_URL is not configured");
}

if (!ALFAPAY_API_KEY) {
  throw new Error("ALFAPAY_API_KEY is not configured");
}

if (!ALFAPAY_PROJECT_ID) {
  throw new Error("ALFAPAY_PROJECT_ID is not configured");
}

type AlfaPayBaseResponse = {
  success: boolean;
  trace_id: string;
  project_id: string;
  timestamp: string;
};

type AlfaPayErrorResponse = AlfaPayBaseResponse & {
  message: string;
};

export type AlfaPayRegisterOrderRequest = {
  amount: number;
  return_url: string;
  fail_url?: string;
  description?: string;
  email?: string;
  phone?: string;
  currency?: number;
  language?: string;
  json_fields?: Record<string, unknown>;
  idempotencyKey?: string;
};

export type AlfaPayRegisterOrderResponse = AlfaPayBaseResponse & {
  order_id: string;
  order_number: string;
  payment_url: string;
  status: string;
  meta?: {
    amount?: number;
    currency?: number;
  };
};

export type AlfaPayGetStatusRequest = {
  order_id?: string;
  order_number?: string;
};

export type AlfaPayGetStatusResponse = AlfaPayBaseResponse & {
  order_status:
    | "pending"
    | "hold"
    | "paid"
    | "cancelled"
    | "refunded"
    | "auth_declined"
    | "failed"
    | "unknown";
  order_status_code: number;
  action_code: number;
  client_message?: string;
  amount?: number;
  currency?: number;
  bindingInfo?: {
    bindingId?: string;
  };
};

export type AlfaPayRefundRequest = {
  order_id: string;
  amount?: number;
};

export type AlfaPayRefundResponse = AlfaPayBaseResponse & {
  error_code?: number | null;
  error_message?: string | null;
};

class AlfaPayGatewayError extends Error {
  statusCode?: number;
  traceId?: string;

  constructor(message: string, statusCode?: number, traceId?: string) {
    super(message);
    this.name = "AlfaPayGatewayError";
    this.statusCode = statusCode;
    this.traceId = traceId;
  }
}

function buildHeaders(idempotencyKey?: string): HeadersInit {
  return {
    Authorization: `Bearer ${ALFAPAY_API_KEY}`,
    "Content-Type": "application/json",
    "X-Project-Id": ALFAPAY_PROJECT_ID,
    ...(idempotencyKey
      ? {
          "Idempotency-Key": idempotencyKey,
        }
      : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new AlfaPayGatewayError(
      "Invalid JSON response from AlfaPay gateway",
      response.status
    );
  }

  if (!response.ok) {
    const errorPayload = payload as Partial<AlfaPayErrorResponse>;

    throw new AlfaPayGatewayError(
      errorPayload.message || "AlfaPay request failed",
      response.status,
      errorPayload.trace_id
    );
  }

  return payload as T;
}

export async function registerAlfaPayOrder(
  payload: AlfaPayRegisterOrderRequest
): Promise<AlfaPayRegisterOrderResponse> {
  const response = await fetch(`${ALFAPAY_API_URL}/api/register.do`, {
    method: "POST",
    headers: buildHeaders(payload.idempotencyKey),
    body: JSON.stringify({
      amount: payload.amount,
      return_url: payload.return_url,
      fail_url: payload.fail_url,
      description: payload.description,
      email: payload.email,
      phone: payload.phone,
      currency: payload.currency ?? 810,
      language: payload.language ?? "ru",
      json_fields: payload.json_fields ?? {},
    }),
    cache: "no-store",
  });

  return parseResponse<AlfaPayRegisterOrderResponse>(response);
}

export async function getAlfaPayOrderStatus(
  payload: AlfaPayGetStatusRequest
): Promise<AlfaPayGetStatusResponse> {
  const response = await fetch(
    `${ALFAPAY_API_URL}/api/getOrderStatusExtended.do`,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        order_id: payload.order_id,
        order_number: payload.order_number,
      }),
      cache: "no-store",
    }
  );

  return parseResponse<AlfaPayGetStatusResponse>(response);
}

export async function refundAlfaPayOrder(
  payload: AlfaPayRefundRequest
): Promise<AlfaPayRefundResponse> {
  const response = await fetch(`${ALFAPAY_API_URL}/api/refund.do`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      order_id: payload.order_id,
      amount: payload.amount,
    }),
    cache: "no-store",
  });

  return parseResponse<AlfaPayRefundResponse>(response);
}

export function mapAlfaPayStatusToInternal(
  status: AlfaPayGetStatusResponse["order_status"]
):
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED"
  | "UNKNOWN" {
  switch (status) {
    case "pending":
      return "PENDING";
    case "hold":
      return "AUTHORIZED";
    case "paid":
      return "PAID";
    case "cancelled":
      return "CANCELED";
    case "refunded":
      return "REFUNDED";
    case "auth_declined":
    case "failed":
      return "FAILED";
    case "unknown":
    default:
      return "UNKNOWN";
  }
}

export { AlfaPayGatewayError };