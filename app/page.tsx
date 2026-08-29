import Composer from "@/components/Composer";
import CursorGlow from "@/components/CursorGlow";
import ThemeToggle from "@/components/ThemeToggle";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is MockDrop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MockDrop is a free tool to paste JSON and get a live, CORS-enabled REST API endpoint in 2 seconds. No signup required. Mocks expire after 24 hours.",
      },
    },
    {
      "@type": "Question",
      name: "How do I create a mock API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paste a JSON object or array, choose a status code (200, 404, 500), click Generate endpoint, and copy the URL. Use it with fetch, axios, or Postman.",
      },
    },
    {
      "@type": "Question",
      name: "Is the mock API CORS-enabled?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All mock endpoints return Access-Control-Allow-Origin: * so you can fetch them directly from localhost or any frontend.",
      },
    },
    {
      "@type": "Question",
      name: "How long do mocks live?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "24 hours. Mocks are stored in Redis with a TTL and auto-delete. No history is kept.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. MockDrop is zero-friction — no signup, no API key, no project setup.",
      },
    },
  ],
};

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

      {/* SEO: secondary content — visible, keyword-rich, no design disruption */}
      <section
        className="w-full max-w-[68rem] mx-auto px-4 sm:px-6 mt-12 grid gap-6 md:grid-cols-3"
        aria-labelledby="how-it-works-heading"
      >
        <h2 id="how-it-works-heading" className="sr-only">
          How MockDrop works for frontend developers
        </h2>
        <article className="bg-surface border border-hairline rounded-xl p-5">
          <h3 className="font-display text-base font-semibold tracking-tight">For frontend prototypes</h3>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Test your UI without waiting for the backend. Generate a real HTTP GET endpoint from any JSON and
            fetch it from localhost, staging, or CodeSandbox.
          </p>
        </article>
        <article className="bg-surface border border-hairline rounded-xl p-5">
          <h3 className="font-display text-base font-semibold tracking-tight">CORS & status simulation</h3>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Every mock is CORS-enabled with correct Content-Type and status code. Simulate 200, 404, and 500 for
            loading and error states.
          </p>
        </article>
        <article className="bg-surface border border-hairline rounded-xl p-5">
          <h3 className="font-display text-base font-semibold tracking-tight">Ephemeral by design</h3>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Mocks live for 24 hours then auto-delete via Redis TTL. No database to clean, no account, 100KB max
            — ideal for demos and QA.
          </p>
        </article>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

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
