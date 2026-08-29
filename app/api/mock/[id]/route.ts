import { getRedis } from "@/lib/redis";
import { isAllowedStatusCode, type MockRecord } from "@/lib/mock";

export const runtime = "nodejs";
// Without this, Next can treat the handler as static and serve a stale payload
// for a key that has already expired.
export const dynamic = "force-dynamic";

/* This endpoint is the entire point of the product: it has to be callable from
 * any origin, from a browser on localhost:3000, from Postman, from curl. So the
 * CORS headers are wide open — and deliberately so. There is nothing to protect
 * here: the data is public-by-URL by design (PRD § 6), carries no credentials,
 * and the route is read-only. */
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  // `*` is valid for non-credentialed requests and means a caller can send any
  // custom header without tripping the preflight.
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Expose-Headers": "X-Mock-Expires-In, X-Mock-Status",
};

// Mocks are ephemeral and can expire mid-flight, so nothing may be cached —
// not by the browser, not by Vercel's CDN.
const NO_STORE = "no-store, no-cache, must-revalidate";

// nanoid's default alphabet. Anything else is not an ID we ever issued, so it
// is rejected before it reaches Redis.
const ID_PATTERN = /^[A-Za-z0-9_-]{6,32}$/;

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { ...CORS, "Cache-Control": NO_STORE } },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!ID_PATTERN.test(id)) {
    return errorResponse("Mock not found or expired", 404);
  }

  let stored: string | null;
  let ttl: number;

  try {
    const redis = getRedis();
    // GET and TTL in one round trip — the TTL is surfaced to the caller so a
    // consumer can tell how much life the mock has left.
    const results = await redis.multi().get(`mock:${id}`).ttl(`mock:${id}`).exec();

    if (!results) {
      return errorResponse("Mock storage is unavailable. Try again shortly.", 503);
    }

    stored = (results[0]?.[1] as string | null) ?? null;
    ttl = Number(results[1]?.[1] ?? -2);
  } catch (err) {
    console.error("[mock] read failed:", err);
    return errorResponse("Mock storage is unavailable. Try again shortly.", 503);
  }

  if (stored === null) {
    return errorResponse("Mock not found or expired", 404);
  }

  let record: MockRecord;
  try {
    record = JSON.parse(stored) as MockRecord;
  } catch {
    console.error(`[mock] corrupt record at mock:${id}`);
    return errorResponse("Stored mock could not be read.", 500);
  }

  // Trust but verify: a status code that is no longer in the allow-list falls
  // back to 200 rather than letting a bad stored value produce an invalid HTTP
  // response.
  const status = isAllowedStatusCode(record.statusCode) ? record.statusCode : 200;

  // Hand-serialize so the caller receives exactly the bytes that were stored,
  // and so a payload of `null` is still valid JSON output.
  return new Response(JSON.stringify(record.payload), {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": NO_STORE,
      "X-Mock-Status": String(status),
      "X-Mock-Expires-In": ttl >= 0 ? String(ttl) : "unknown",
    },
  });
}

/* Preflight. Any non-simple cross-origin request (a custom header, a JSON
 * content type) sends OPTIONS first; without this handler the browser blocks
 * the real request and the tool looks broken from the outside. */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, "Content-Length": "0" },
  });
}
