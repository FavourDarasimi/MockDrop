import Redis from "ioredis";

/* Redis Cloud speaks plain TCP, not HTTP. In a serverless runtime each cold
 * start would otherwise open a new socket and the free tier's connection limit
 * would be exhausted under mild concurrency (PRD § 8).
 *
 * The client is therefore cached on `globalThis`, not just in module scope:
 * Next.js re-evaluates modules on every hot reload in development, so a plain
 * module-level `const` leaks one connection per file save. The global survives
 * the reload; the socket is reused. */

declare global {
  // eslint-disable-next-line no-var
  var __mockdropRedis: Redis | undefined;
}

function create(): Redis {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error(
      "REDIS_URL is not set. Copy .env.example to .env.local and point it at your Redis instance.",
    );
  }

  const client = new Redis(url, {
    // Fail fast instead of hanging a request for 10s behind a dead host.
    connectTimeout: 8_000,
    commandTimeout: 5_000,
    // Cap reconnect attempts so a permanently-wrong URL surfaces as an error
    // rather than retrying forever in the background.
    maxRetriesPerRequest: 2,
    enableOfflineQueue: true,
    retryStrategy(times) {
      if (times > 5) return null; // stop retrying; next request will re-create
      return Math.min(times * 200, 2_000);
    },
    lazyConnect: false,
  });

  // Without a listener, a connection-level error becomes an unhandled
  // 'error' event and takes the whole process down.
  client.on("error", (err) => {
    console.error("[redis]", err instanceof Error ? err.message : err);
  });

  return client;
}

export function getRedis(): Redis {
  if (!globalThis.__mockdropRedis) {
    globalThis.__mockdropRedis = create();
  }
  return globalThis.__mockdropRedis;
}
