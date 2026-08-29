"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "./Icon";
import { STATUS_OPTIONS, type StatusCode } from "@/lib/mock";

type Props = {
  value: StatusCode;
  onChange: (value: StatusCode) => void;
  disabled?: boolean;
};

function dotColor(code: number) {
  if (code === 200) return "bg-success";
  if (code === 404) return "bg-warning";
  return "bg-error";
}

export default function StatusSelect({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, STATUS_OPTIONS.findIndex((o) => o.code === value)),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const selected =
    STATUS_OPTIONS.find((o) => o.code === value) ?? STATUS_OPTIONS[0];

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openList(startIndex?: number) {
    if (disabled) return;
    setActiveIndex(
      startIndex ??
        Math.max(0, STATUS_OPTIONS.findIndex((o) => o.code === value)),
    );
    setOpen(true);
  }

  function closeList({ refocus = true }: { refocus?: boolean } = {}) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function commit(index: number) {
    const option = STATUS_OPTIONS[index];
    if (option) onChange(option.code);
    closeList();
  }

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        openList();
        break;
      case "ArrowUp":
        event.preventDefault();
        openList(STATUS_OPTIONS.length - 1);
        break;
    }
  }

  function onListKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(STATUS_OPTIONS.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(STATUS_OPTIONS.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <span className="sr-only" id={labelId}>
        Status code
      </span>

      <button
        type="button"
        ref={triggerRef}
        className="flex items-center gap-2 w-full min-h-[2.75rem] px-3 bg-surface text-primary border border-field-edge rounded-lg outline-2 outline-transparent outline-offset-2 text-left cursor-pointer transition hover:bg-raised focus-visible:border-ring focus-visible:outline-ring active:bg-[var(--color-bg-option-active)] disabled:opacity-55 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${baseId}-value`}
        disabled={disabled}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={`size-2.5 rounded-full shrink-0 ${dotColor(selected.code)}`} />
        <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[0.92rem]" id={`${baseId}-value`}>
          {selected.label}
        </span>
        <ChevronDownIcon size={16} className={`shrink-0 text-secondary transition duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          className="absolute inset-x-0 top-[calc(100%+4px)] z-[100] m-0 p-1 list-none bg-raised border border-hairline rounded-lg shadow-[var(--shadow-raised)] outline-none"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={optionId(activeIndex)}
          onKeyDown={onListKeyDown}
          onBlur={(event) => {
            if (!rootRef.current?.contains(event.relatedTarget as Node)) {
              setOpen(false);
            }
          }}
        >
          {STATUS_OPTIONS.map((option, index) => {
            const isSelected = option.code === value;
            return (
              <li
                key={option.code}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                className={`flex items-center gap-2 min-h-[2.75rem] px-3 rounded-md cursor-pointer font-mono text-[0.88rem] transition ${index === activeIndex ? "bg-[var(--color-bg-option-active)]" : ""}`}
                data-active={index === activeIndex}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
              >
                <span className={`size-2.5 rounded-full shrink-0 ${dotColor(option.code)}`} />
                <span>{option.label}</span>
                {isSelected && <CheckIcon size={16} className="shrink-0 ml-auto text-brand" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
