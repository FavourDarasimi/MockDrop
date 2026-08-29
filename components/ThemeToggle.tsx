"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icon";

type Mode = "light" | "dark";
const STORAGE_KEY = "mockdrop-theme";

function readAppliedMode(): Mode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(readAppliedMode());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setMode(next);
  }

  const goingTo = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="inline-grid place-items-center size-8 bg-raised text-secondary border border-hairline rounded-full cursor-pointer transition hover:bg-[var(--color-bg-option-active)] hover:text-primary active:translate-y-px focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      onClick={toggle}
      aria-label={mounted ? `Switch to ${goingTo} theme` : "Switch theme"}
      title={mounted ? `Switch to ${goingTo} theme` : "Switch theme"}
    >
      {mode === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
