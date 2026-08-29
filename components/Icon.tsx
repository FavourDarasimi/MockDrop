/* One icon voice: 24×24, 1.5px stroke, round caps/joins, no fill.
 * Hand-built, single stroke language. All aria-hidden. */

type IconProps = { size?: number; className?: string };

function Svg({ size = 16, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export function SunIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Svg>
  );
}
export function MoonIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </Svg>
  );
}
export function CopyIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  );
}
export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}
export function ClockIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}
export function AlertIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </Svg>
  );
}
export function ChevronDownIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}
export function SparklesIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3z M19 11l0.9 2.1L22 14l-2.1 0.9L19 17l-0.9-2.1L16 14l2.1-0.9L19 11z M5 15l0.8 1.8L8 18l-2.2 0.8L5 21l-0.8-2.2L2 18l2.2-0.8L5 15z" />
    </Svg>
  );
}
export function BracesIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3H6a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h2 M16 3h2a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-2" />
    </Svg>
  );
}
export function WandIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 4V2 M18 8h2 M15 12v2 M8 14l-3 3 1 1 3-3-1-1z M14 8l2 2" />
      <path d="M12 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4" />
    </Svg>
  );
}
export function ExternalIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6 M10 14L21 3" />
    </Svg>
  );
}
