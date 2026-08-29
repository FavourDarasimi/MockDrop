/* Shared contract between the browser and the API.
 * Both sides import these, so the rules cannot drift apart — the client can
 * never let through something the server will reject, and the error copy the
 * user sees for a size overrun is the same string in both places. */

export const TTL_SECONDS = 86_400; // 24 hours
export const MAX_PAYLOAD_BYTES = 100 * 1024; // 100KB
export const ID_LENGTH = 10; // nanoid, within the 8–10 char band

/* Guards the raw request body before it is parsed, so a multi-megabyte POST is
 * rejected on the header rather than after being read into memory. Sized a
 * little above the payload cap to leave room for the JSON envelope. */
export const MAX_REQUEST_BYTES = MAX_PAYLOAD_BYTES + 2 * 1024;

export const STATUS_OPTIONS = [
  { code: 200, label: "200 OK" },
  { code: 404, label: "404 Not Found" },
  { code: 500, label: "500 Internal Server Error" },
] as const;

export type StatusCode = (typeof STATUS_OPTIONS)[number]["code"];

export const ALLOWED_STATUS_CODES: readonly number[] = STATUS_OPTIONS.map(
  (o) => o.code,
);

export function isAllowedStatusCode(value: unknown): value is StatusCode {
  return typeof value === "number" && ALLOWED_STATUS_CODES.includes(value);
}

/* A REST endpoint can legitimately return an object or an array, so both are
 * accepted. Bare primitives and null are not — they would make for a mock that
 * cannot represent a resource, and the brief specifies an object payload. */
export function isPayloadShape(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function byteLength(value: string): number {
  // TextEncoder counts UTF-8 bytes, which is what Redis actually stores.
  // A naive `.length` would undercount every non-ASCII character.
  return new TextEncoder().encode(value).length;
}

/* Two decimal places, not one. A payload 11 bytes over the cap is 100.01 KB;
 * rounding to 100.0 KB would render the error as "Payload is 100.0 KB. The
 * limit is 100.0 KB", which reads as a bug rather than an explanation. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  // Trim pointless trailing zeros so 512 KB doesn't render as "512.00 KB".
  return `${kb.toFixed(2).replace(/\.?0+$/, "")} KB`;
}

/* The single source of truth for "is this payload acceptable".
 * Returns null when valid, or a ready-to-display message when not. */
export function payloadSizeError(serialized: string): string | null {
  const size = byteLength(serialized);
  if (size > MAX_PAYLOAD_BYTES) {
    return `Payload is ${formatBytes(size)}. The limit is ${formatBytes(
      MAX_PAYLOAD_BYTES,
    )} — trim it and try again.`;
  }
  return null;
}

export type MockRecord = {
  payload: unknown;
  statusCode: StatusCode;
};

export type GenerateResponse = {
  id: string;
  url: string;
  expiresAt: string;
};
