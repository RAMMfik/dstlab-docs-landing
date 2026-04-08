const memoryStore = new Map<
  string,
  { count: number; expiresAt: number }
>();

type Params = {
  key: string;
  limit: number;
  windowMs: number;
};

export function checkRateLimit({ key, limit, windowMs }: Params) {
  const now = Date.now();

  const record = memoryStore.get(key);

  if (!record || record.expiresAt < now) {
    memoryStore.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return { ok: true as const };
  }

  if (record.count >= limit) {
    return {
      ok: false as const,
      retryAfter: Math.ceil((record.expiresAt - now) / 1000),
    };
  }

  record.count += 1;

  return { ok: true as const };
}