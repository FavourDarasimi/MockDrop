import type Redis from "ioredis";

/* Fixed-window IP rate limit on /api/generate, backed by Redis so the counter
 * is shared across serverless instances — an in-memory Map would reset on every
 * cold start and each concurrent lambda would keep its own tally, which makes
 * the limit close to meaningless in production.
 *
 * Deliberately fail-OPEN: if the rate-limit read itself errors we let the
 * request proceed. Generating a mock needs Redis anyway, so a genuine outage
 * still surfaces as a 503 from the write path — but a transient blip on the
 * counter should not block a legitimate user. */

export const RATE_LIMIT = 20; // requests…
export const RATE_WINDOW_SECONDS = 60; // …per IP per minute

export type RateVerdict = {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds
};

/* Vercel puts the real client IP first in x-forwarded-for. We take only the
 * first hop: later entries are attacker-controllable. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export async function checkRateLimit(
  redis: Redis,
  ip: string,
): Promise<RateVerdict> {
  const key = `rl:gen:${ip}`;

  try {
    // INCR then conditionally EXPIRE in one round trip. Setting the TTL only
    // when count === 1 makes this a fixed window: the window starts at the
    // first request and is not extended by later ones.
    const results = await redis
      .multi()
      .incr(key)
      .expire(key, RATE_WINDOW_SECONDS, "NX")
      .ttl(key)
      .exec();

    if (!results) return permit();

    const count = Number(results[0]?.[1] ?? 0);
    const ttlRaw = Number(results[2]?.[1] ?? RATE_WINDOW_SECONDS);
    const ttl = ttlRaw > 0 ? ttlRaw : RATE_WINDOW_SECONDS;

    if (count > RATE_LIMIT) {
      return { allowed: false, remaining: 0, retryAfter: ttl };
    }

    return {
      allowed: true,
      remaining: Math.max(0, RATE_LIMIT - count),
      retryAfter: 0,
    };
  } catch (err) {
    console.error(
      "[ratelimit] failing open:",
      err instanceof Error ? err.message : err,
    );
    return permit();
  }
}

function permit(): RateVerdict {
  return { allowed: true, remaining: RATE_LIMIT, retryAfter: 0 };
}
