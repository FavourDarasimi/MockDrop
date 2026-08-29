import { nanoid } from "nanoid";
import { getRedis } from "@/lib/redis";
import { checkRateLimit, clientIp, RATE_LIMIT } from "@/lib/rateLimit";
import {
  byteLength,
  ID_LENGTH,
  isAllowedStatusCode,
  isPayloadShape,
  MAX_REQUEST_BYTES,
  payloadSizeError,
  TTL_SECONDS,
  type GenerateResponse,
  type MockRecord,
} from "@/lib/mock";

// ioredis needs a real TCP socket, so this route cannot run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Deliberately NOT CORS-open. Only the MockDrop page itself should be able to
 * mint mocks; the permissive headers belong on the read endpoint, which is the
 * thing that has to be fetchable from anywhere. Opening this route would let any
 * site burn through the Redis free tier on your behalf. */

function bad(error: string, status: number, extraHeaders?: HeadersInit) {
  return Response.json({ error }, { status, headers: extraHeaders });
}

/* Builds the public URL for a mock. Derived from the request so it is correct on
 * localhost, on a Vercel preview deployment and on a custom domain without any
 * configuration. MOCKDROP_BASE_URL overrides it for proxies that rewrite Host. */
function resolveOrigin(request: Request): string {
  const configured = process.env.MOCKDROP_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const host = request.headers.get("host");
  if (host) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const proto =
      forwardedProto?.split(",")[0]?.trim() ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  // 1 — Reject oversized bodies on the header, before reading them into memory.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_REQUEST_BYTES) {
    return bad("Request body is too large. The payload limit is 100KB.", 413);
  }

  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    console.error("[generate] redis unavailable:", err);
    return bad("Mock storage is unavailable. Try again shortly.", 503);
  }

  // 2 — Rate limit before doing any real work, so invalid spam still counts.
  const ip = clientIp(request.headers);
  const verdict = await checkRateLimit(redis, ip);
  if (!verdict.allowed) {
    return bad(
      `Too many mocks from this address. You can create ${RATE_LIMIT} per minute — try again in ${verdict.retryAfter}s.`,
      429,
      { "Retry-After": String(verdict.retryAfter) },
    );
  }

  // 3 — Read and parse. content-length can be absent or wrong, so the actual
  //     body is measured too.
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return bad("Could not read the request body.", 400);
  }

  if (byteLength(raw) > MAX_REQUEST_BYTES) {
    return bad("Request body is too large. The payload limit is 100KB.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return bad("Request body must be valid JSON.", 400);
  }

  if (!isPayloadShape(body)) {
    return bad("Request body must be a JSON object.", 400);
  }

  const { payload, statusCode } = body as {
    payload?: unknown;
    statusCode?: unknown;
  };

  // 4 — Validate the two fields.
  if (payload === undefined) {
    return bad("Missing 'payload'.", 400);
  }

  if (!isPayloadShape(payload)) {
    return bad(
      "'payload' must be a JSON object or array, not a bare value.",
      400,
    );
  }

  if (!isAllowedStatusCode(statusCode)) {
    return bad("'statusCode' must be one of 200, 404 or 500.", 400);
  }

  // 5 — Serialize once and enforce the 100KB cap on what actually gets stored.
  let record: string;
  try {
    const value: MockRecord = { payload, statusCode };
    record = JSON.stringify(value);
  } catch {
    // Circular references and BigInt both land here.
    return bad("'payload' could not be serialized. Check for circular references.", 400);
  }

  const serializedPayload = JSON.stringify(payload);
  const sizeError = payloadSizeError(serializedPayload);
  if (sizeError) {
    return bad(sizeError, 400);
  }

  // 6 — Write under an unused key. NX makes the write refuse to clobber an
  //     existing mock, so a nanoid collision can never destroy someone's data.
  //     At 10 chars the odds are negligible, but "negligible" is not "handled".
  let id = "";
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = nanoid(ID_LENGTH);
      const written = await redis.set(
        `mock:${candidate}`,
        record,
        "EX",
        TTL_SECONDS,
        "NX",
      );
      if (written === "OK") {
        id = candidate;
        break;
      }
    }
  } catch (err) {
    console.error("[generate] write failed:", err);
    return bad("Could not save the mock. Try again shortly.", 503);
  }

  if (!id) {
    return bad("Could not allocate a mock ID. Try again.", 503);
  }

  const payloadBody: GenerateResponse = {
    id,
    url: `${resolveOrigin(request)}/api/mock/${id}`,
    expiresAt: new Date(Date.now() + TTL_SECONDS * 1000).toISOString(),
  };

  return Response.json(payloadBody, {
    status: 201,
    headers: {
      "Cache-Control": "no-store",
      "X-RateLimit-Limit": String(RATE_LIMIT),
      "X-RateLimit-Remaining": String(verdict.remaining),
    },
  });
}

/* Anything other than POST gets an explicit 405 rather than Next's default,
 * so a misdirected GET returns the same JSON error shape as everything else. */
export async function GET() {
  return bad("Use POST to create a mock.", 405, { Allow: "POST" });
}
