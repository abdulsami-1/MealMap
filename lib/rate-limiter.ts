// In-memory sliding window rate limiter — no Redis required
const store = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    return { allowed: false, remaining: 0, resetInMs: windowMs - (now - oldest) };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length, resetInMs: 0 };
}

// Cleanup stale entries every 15 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const HOUR = 60 * 60 * 1000;
    for (const [key, timestamps] of store.entries()) {
      const fresh = timestamps.filter((t) => now - t < HOUR);
      if (fresh.length === 0) store.delete(key);
      else store.set(key, fresh);
    }
  }, 15 * 60 * 1000);
}
