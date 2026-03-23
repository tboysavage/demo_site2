type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __babySonovueRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

function getStore() {
  if (!globalThis.__babySonovueRateLimitStore) {
    globalThis.__babySonovueRateLimitStore = new Map();
  }

  return globalThis.__babySonovueRateLimitStore;
}

function pruneExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  if (store.size < 500) {
    return;
  }

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getRequestIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const store = getStore();
  pruneExpiredEntries(store, now);

  const currentEntry = store.get(key);
  if (!currentEntry || currentEntry.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: limit - 1,
    };
  }

  if (currentEntry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  currentEntry.count += 1;
  store.set(key, currentEntry);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, limit - currentEntry.count),
  };
}
