import Composer from "@/components/Composer";
import CursorGlow from "@/components/CursorGlow";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-app text-primary bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2740%27%20height%3D%2740%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M20%201L39%2020L20%2039L1%2020Z%27%20fill%3D%27none%27%20stroke%3D%27%230f1a12%27%20stroke-width%3D%270.5%27%20opacity%3D%270.12%27/%3E%3C/svg%3E')] bg-[length:40px_40px] dark:bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2740%27%20height%3D%2740%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M20%201L39%2020L20%2039L1%2020Z%27%20fill%3D%27none%27%20stroke%3D%27%23ecf0ed%27%20stroke-width%3D%270.5%27%20opacity%3D%270.08%27/%3E%3C/svg%3E')]">
      <CursorGlow />
      {/* N5 · Floating pill */}
      <header className="w-full max-w-[68rem] mx-auto px-4 sm:px-6">
        <nav
          className="sticky top-4 z-[200] flex items-center justify-between gap-4 w-fit max-w-[calc(100%-2*var(--page-gutter))] mx-auto mt-4 py-2 pr-2 pl-6 bg-[color-mix(in_oklab,var(--color-bg-surface)_82%,transparent)] backdrop-blur-[12px] backdrop-saturate-[1.4] border border-hairline rounded-full shadow-[var(--shadow-bento)]"
          aria-label="Primary"
        >
          <a
            className="inline-flex items-baseline gap-[0.06em] font-display text-[1.05rem] font-bold tracking-[-0.025em] text-primary no-underline whitespace-nowrap"
            href="/"
          >
            MockDrop<span className="text-brand">.</span>
          </a>
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero — centered, fixed-height */}
      <header className="w-full max-w-[44rem] mx-auto px-4 sm:px-6 text-center pt-10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-raised border border-hairline rounded-full font-mono text-[0.68rem] font-medium tracking-[0.1em] uppercase text-secondary">
          <span className="size-2 rounded-full bg-brand animate-[pulse_2s_ease-in-out_infinite]" aria-hidden="true" />
          Live in 2 seconds · Expires in 24 hours
        </div>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw+0.6rem,3.75rem)] leading-[0.98] tracking-[-0.03em] font-bold max-[60rem]:text-[clamp(2rem,6vw+0.5rem,2.8rem)]">
          Paste <span className="text-brand">JSON.</span> Get a live API.
        </h1>
        <p className="mt-4 mx-auto max-w-[38ch] text-[1.0625rem] leading-6 text-secondary text-balance">
          No signup, no config, no waiting. Paste any object or array, pick a status, and fetch it from
          anywhere.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.06em] uppercase text-secondary">
          Public by URL · don’t paste secrets · 100KB max
        </p>
      </header>

      <main className="w-full max-w-[68rem] mx-auto px-4 sm:px-6">
        <Composer />
      </main>

      {/* Ft5 · Statement */}
      <footer className="w-full max-w-[68rem] mx-auto px-4 sm:px-6 mt-16 border-t border-hairline pt-10 pb-[max(var(--space-xl),env(safe-area-inset-bottom))] text-center">
        <p className="font-display text-[clamp(1.4rem,3vw+0.6rem,2.2rem)] font-bold tracking-[-0.03em] leading-[1.1] text-primary text-balance max-w-[32ch] mx-auto">
          Ephemeral by <span className="text-brand">design.</span> No history, nothing to clean up.
        </p>
        <p className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-[0.74rem] text-secondary">
          <span>MockDrop</span>
          <span className="text-hairline" aria-hidden="true">
            ·
          </span>
          <span>Ephemeral JSON endpoints</span>
          <span className="text-hairline" aria-hidden="true">
            ·
          </span>
          <span>Built for prototypes, demos &amp; error-state QA</span>
        </p>
      </footer>
    </div>
  );
}
