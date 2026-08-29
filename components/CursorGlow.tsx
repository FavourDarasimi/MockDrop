"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      el!.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed -top-[200px] -left-[200px] size-[400px] rounded-full bg-brand opacity-[0.07] blur-[80px] pointer-events-none z-0 will-change-transform"
      aria-hidden="true"
    />
  );
}
