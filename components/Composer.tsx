"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StatusSelect from "./StatusSelect";
import {
  AlertIcon,
  BracesIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  ExternalIcon,
  SparklesIcon,
} from "./Icon";
import {
  byteLength,
  MAX_PAYLOAD_BYTES,
  payloadSizeError,
  type GenerateResponse,
  type StatusCode,
} from "@/lib/mock";

const PLACEHOLDER = '{ "hello": "world" }';
const COPY_FEEDBACK_MS = 2_500;
const TOAST_MS = 2_500;
const MIN_SPINNER_MS = 300;

const EXAMPLES: { label: string; json: string }[] = [
  {
    label: "User profile",
    json: '{\n  "user": {\n    "id": 7,\n    "name": "Ada Lovelace",\n    "roles": ["admin", "engineer"]\n  },\n  "meta": { "page": 1, "total": 128 }\n}',
  },
  {
    label: "Products",
    json: '{\n  "products": [\n    { "id": "sku_01", "name": "Arc Lamp", "price": 89 },\n    { "id": "sku_02", "name": "Pendant", "price": 142 }\n  ],\n  "count": 2\n}',
  },
  {
    label: "Error 404",
    json: '{\n  "error": "Not found",\n  "code": "RESOURCE_MISSING",\n  "hint": "Check the id and try again"\n}',
  },
];

type ParseResult = { ok: true; value: unknown } | { ok: false; message: string };

function parseJson(raw: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "";
    const at = detail.match(/position (\d+)/);
    return {
      ok: false,
      message: at
        ? `Invalid JSON at position ${at[1]} — check for trailing commas or missing quotes.`
        : "Invalid JSON — check for trailing commas or missing quotes.",
    };
  }
}

function formatRemaining(expiresAt: string, now: number) {
  const msLeft = new Date(expiresAt).getTime() - now;
  if (Number.isNaN(msLeft)) return { text: "Expiry unknown", urgent: false };
  if (msLeft <= 0) return { text: "Expired", urgent: true };
  const minutes = Math.round(msLeft / 60_000);
  if (minutes < 60)
    return { text: `Expires in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`, urgent: true };
  const hours = Math.round(minutes / 60);
  return { text: `Expires in ${hours} ${hours === 1 ? "hour" : "hours"}`, urgent: false };
}

async function writeToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }
  try {
    const scratch = document.createElement("textarea");
    scratch.value = text;
    scratch.setAttribute("readonly", "");
    scratch.style.position = "fixed";
    scratch.style.opacity = "0";
    document.body.appendChild(scratch);
    scratch.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(scratch);
    return ok;
  } catch {
    return false;
  }
}

function dotColor(status: number) {
  if (status === 200) return "bg-success";
  if (status === 404) return "bg-warning";
  return "bg-error";
}

export default function Composer() {
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<StatusCode>(200);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ key: number; message: string; tone: "success" | "error" } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [previewTried, setPreviewTried] = useState(false);
  const [previewResult, setPreviewResult] = useState<{ status: number; body: string } | null>(null);

  const copyTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  const trimmed = text.trim();
  const isEmpty = trimmed.length === 0;

  const parsed = useMemo<ParseResult | null>(() => (isEmpty ? null : parseJson(trimmed)), [trimmed, isEmpty]);

  const sizeError = useMemo(() => {
    if (!parsed?.ok) return null;
    try {
      return payloadSizeError(JSON.stringify(parsed.value));
    } catch {
      return "That payload could not be serialized.";
    }
  }, [parsed]);

  const shapeError =
    parsed?.ok && (typeof parsed.value !== "object" || parsed.value === null)
      ? "Payload must be a JSON object or array, not a bare value."
      : null;

  const blockingError = parsed && !parsed.ok ? parsed.message : (sizeError ?? shapeError);
  const canGenerate = !isEmpty && !blockingError && !loading;
  const visibleError = serverError ?? (touched ? blockingError : null);

  const byteCount = useMemo(() => {
    if (!parsed?.ok) return 0;
    try {
      return byteLength(JSON.stringify(parsed.value));
    } catch {
      return 0;
    }
  }, [parsed]);

  useEffect(() => {
    if (!result) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [result]);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string, tone: "success" | "error") => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ key: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  async function generate() {
    if (!canGenerate || !parsed?.ok) return;
    setLoading(true);
    setServerError(null);
    setPreviewResult(null);
    setPreviewTried(false);
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: parsed.value, statusCode: status }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          (data as { error?: string } | null)?.error ?? `Could not create the mock (HTTP ${response.status}).`;
        setServerError(message);
        showToast(message, "error");
        return;
      }
      const created = data as GenerateResponse;
      setResult(created);
      setNow(Date.now());
      setCopied(false);
    } catch {
      const message = "Could not reach the server. Check your connection and retry.";
      setServerError(message);
      showToast(message, "error");
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SPINNER_MS) await new Promise((r) => setTimeout(r, MIN_SPINNER_MS - elapsed));
      setLoading(false);
    }
  }

  async function copyUrl() {
    if (!result) return;
    const ok = await writeToClipboard(result.url);
    if (!ok) {
      showToast("Couldn't reach the clipboard. Select the URL and copy it.", "error");
      return;
    }
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    showToast("Endpoint URL copied to clipboard", "success");
  }

  async function tryFetch() {
    if (!result) return;
    setPreviewTried(true);
    try {
      const r = await fetch(result.url);
      const body = await r.text();
      setPreviewResult({ status: r.status, body: body.slice(0, 1200) });
    } catch (e) {
      setPreviewResult({ status: 0, body: e instanceof Error ? e.message : "Fetch failed" });
    }
  }

  const expiry = result ? formatRemaining(result.expiresAt, now) : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 mt-6 pb-16 md:grid-cols-2 lg:grid-cols-6 max-[40rem]:gap-3">
        {/* Payload — large tile */}
        <div className="bg-surface border border-hairline rounded-xl shadow-[var(--shadow-bento)] flex flex-col min-w-0 transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[var(--shadow-raised)] lg:col-span-4 lg:row-span-2 md:col-span-2">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-hairline bg-surface rounded-t-xl">
            <span className="flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[0.12em] uppercase text-secondary whitespace-nowrap">
              <BracesIcon size={14} />
              JSON payload
            </span>
          </div>
          <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4 gap-3 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                id="payload"
                className={`block w-full flex-1 min-h-[14rem] px-4 py-3 bg-surface text-primary border rounded-lg outline-2 outline-transparent outline-offset-2 font-mono text-sm leading-6 resize-y [tab-size:2] transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-secondary hover:bg-raised focus-visible:border-ring focus-visible:shadow-[var(--glow-focus)] focus-visible:outline-ring disabled:opacity-55 disabled:cursor-not-allowed ${visibleError ? "border-error focus-visible:outline-error" : "border-field-edge"}`}
                value={text}
                placeholder={PLACEHOLDER}
                onChange={(e) => {
                  setText(e.target.value);
                  setServerError(null);
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={visibleError ? true : undefined}
                aria-describedby="payload-helper"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                disabled={loading}
              />
              <p
                className={`flex items-start gap-1 min-h-[1lh] mt-2 font-mono text-[0.8125rem] leading-[1.45] ${visibleError ? "text-error" : "text-secondary"}`}
                id="payload-helper"
                role="status"
                aria-live="polite"
              >
                {visibleError ? (
                  <>
                    <AlertIcon size={13} className="shrink-0 mt-[0.15em]" />
                    <span>{visibleError}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>

        {/* Controls — status + generate */}
        <div className="bg-surface border border-hairline rounded-xl shadow-[var(--shadow-bento)] flex flex-col min-w-0 lg:col-span-2 md:col-span-2">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-hairline bg-surface rounded-t-xl">
            <span className="flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[0.12em] uppercase text-secondary whitespace-nowrap">
              Status &amp; action
            </span>
          </div>
          <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4 gap-3 overflow-visible">
            <StatusSelect value={status} onChange={setStatus} disabled={loading} />
            <button
              type="button"
              className="group relative inline-flex items-center justify-center gap-2 min-h-[2.75rem] w-full px-6 bg-brand text-brand-on border border-transparent rounded-full font-sans text-base font-semibold whitespace-nowrap cursor-pointer transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-brand-hi hover:-translate-y-px hover:shadow-[var(--shadow-whisper)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none data-[state=loading]:cursor-progress"
              onClick={generate}
              disabled={!canGenerate}
              data-state={loading ? "loading" : undefined}
              title={
                isEmpty ? "Paste a JSON payload first" : blockingError ? "Fix the JSON to continue" : undefined
              }
            >
              <span className="group-data-[state=loading]:invisible">Generate endpoint</span>
              {loading && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="size-[1.125rem] border-2 border-current border-t-transparent rounded-full animate-[spin_620ms_linear_infinite]" />
                  <span className="sr-only">Creating your endpoint…</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Examples — quick start */}
        <div className="bg-surface border border-hairline rounded-xl shadow-[var(--shadow-bento)] flex flex-col min-w-0 lg:col-span-2 md:col-span-2">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-hairline bg-surface rounded-t-xl">
            <span className="flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[0.12em] uppercase text-secondary whitespace-nowrap">
              <SparklesIcon size={13} />
              Try an example
            </span>
          </div>
          <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4 gap-3">
            <p className="font-mono text-[0.8125rem] leading-[1.45] text-secondary min-h-0 mt-0">
              One click to fill the editor. Edit, then generate.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  className="inline-flex items-center gap-[0.35rem] px-[0.65rem] py-[0.35rem] bg-raised border border-hairline rounded-full font-mono text-[0.72rem] text-primary whitespace-nowrap cursor-pointer transition duration-150 hover:bg-[var(--color-bg-option-active)] hover:border-field-edge focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  onClick={() => {
                    setText(ex.json);
                    setTouched(true);
                    setServerError(null);
                    if (ex.label === "Error 404") setStatus(404);
                    else setStatus(200);
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result — full width when present */}
        {result && expiry && (
          <div className="bg-surface border border-hairline rounded-xl shadow-[var(--shadow-bento)] flex flex-col min-w-0 lg:col-span-6 md:col-span-2 animate-[rise_200ms_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-hairline bg-surface rounded-t-xl">
              <span className="flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[0.12em] uppercase text-secondary whitespace-nowrap">
                Your endpoint
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[0.72rem] text-secondary">
                <span className={`size-2.5 rounded-full shrink-0 ${dotColor(status)}`} /> returns {status}
              </span>
            </div>
            <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4 gap-3">
              <div className="flex items-center gap-2 p-1 pl-3 bg-raised border border-hairline rounded-lg">
                <a
                  className="flex-1 min-w-0 font-mono text-sm leading-6 text-primary no-underline break-all hover:underline decoration-brand decoration-[1.6px] underline-offset-[3px]"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {result.url}
                </a>
                <button
                  type="button"
                  className="relative inline-grid place-items-center shrink-0 size-9 bg-transparent text-secondary border border-transparent rounded-md cursor-pointer transition hover:bg-[var(--color-bg-option-active)] hover:text-primary active:translate-y-px focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 data-[state=copied]:text-brand max-[40rem]:size-11"
                  onClick={copyUrl}
                  data-state={copied ? "copied" : undefined}
                  aria-label={copied ? "URL copied" : "Copy endpoint URL"}
                >
                  {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[0.78rem] text-secondary">
                <span className={`inline-flex items-center gap-1 ${expiry.urgent ? "text-warning" : ""}`}>
                  <ClockIcon size={13} />
                  {expiry.text}
                </span>
                <span className="tabular-nums">GET · {result.id}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  type="button"
                  className="relative inline-flex items-center justify-center gap-2 min-h-8 w-auto px-4 bg-surface text-primary border border-hairline rounded-full font-sans text-[0.82rem] font-semibold whitespace-nowrap cursor-pointer transition hover:bg-raised hover:border-field-edge hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  onClick={copyUrl}
                >
                  {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                  {copied ? "Copied" : "Copy URL"}
                </button>
                <a
                  className="relative inline-flex items-center justify-center gap-2 min-h-8 w-auto px-4 bg-surface text-primary border border-hairline rounded-full font-sans text-[0.82rem] font-semibold whitespace-nowrap cursor-pointer transition hover:bg-raised hover:border-field-edge hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 no-underline"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalIcon size={13} />
                  Open
                </a>
                <button
                  type="button"
                  className="relative inline-flex items-center justify-center gap-2 min-h-8 w-auto px-4 bg-surface text-primary border border-hairline rounded-full font-sans text-[0.82rem] font-semibold whitespace-nowrap cursor-pointer transition hover:bg-raised hover:border-field-edge hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  onClick={tryFetch}
                >
                  Try fetch
                </button>
              </div>
              {previewTried && previewResult && (
                <pre className="m-0 mt-3 px-4 py-3 bg-raised border border-hairline rounded-lg font-mono text-[0.82rem] leading-6 text-primary overflow-x-auto whitespace-pre max-w-full min-w-0">
                  {`HTTP ${previewResult.status}\n`}
                  {previewResult.body}
                </pre>
              )}
              <p className="sr-only" role="status" aria-live="polite">
                Endpoint created. Returns status {status}. {expiry.text}.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed z-[500] inset-x-4 bottom-4 flex justify-center pointer-events-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end" role="region" aria-label="Notifications">
        {toast && (
          <output
            key={toast.key}
            className="flex items-center gap-2 max-w-sm px-4 py-3 bg-raised text-primary border border-hairline border-l-[3px] rounded-lg shadow-[var(--shadow-raised)] font-mono text-[0.8125rem] pointer-events-auto animate-[toast-in_400ms_cubic-bezier(0.16,1,0.3,1)_both] data-[tone=error]:border-l-error border-l-brand"
            data-tone={toast.tone}
          >
            {toast.tone === "success" ? (
              <CheckIcon size={16} className="shrink-0 text-brand" />
            ) : (
              <AlertIcon size={16} className="shrink-0 text-error" />
            )}
            <span>{toast.message}</span>
          </output>
        )}
      </div>
    </>
  );
}
