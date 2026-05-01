"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200">
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_35%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.08),transparent_30%)]" />
          <div className="relative z-10 max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl backdrop-blur">
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-rose-400">
              Application Error
            </p>
            <h1 className="mt-4 font-quantico text-4xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-400">
              An unexpected error interrupted the page. You can retry the
              request or refresh the site.
            </p>
            {error.digest ? (
              <p className="mt-4 font-mono text-xs text-slate-500">
                Reference: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-6 py-3 font-mono text-sm font-semibold text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-white"
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
