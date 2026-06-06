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
      <body className="bg-[#01020a] text-slate-200">
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(191,97,106,0.06),transparent_40%),radial-gradient(circle_at_bottom,rgba(136,192,208,0.04),transparent_35%)]" />
          <div className="relative z-10 max-w-xl rounded-base border-2 border-[#232d38] bg-[#060815] p-10 shadow-[6px_6px_0px_0px_#232d38] text-center">
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#bf616a]">
              CRITICAL // ERROR
            </p>
            <h1 className="mt-4 font-quantico text-4xl font-bold text-white uppercase tracking-wider">
              System Interrupted
            </h1>
            <p className="mt-4 text-sm font-mono text-slate-400">
              An unexpected application exception has occurred. The system logs have recorded this incident.
            </p>
            {error.digest ? (
              <p className="mt-4 font-mono text-xs text-slate-500">
                ERROR_ID // {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex items-center bg-[#88c0d0] text-[#1b2234] border-2 border-transparent font-mono font-bold px-6 py-3 shadow-[4px_4px_0px_0px_#232d38] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:transition-none transition-all duration-200 rounded-base cursor-pointer"
            >
              &gt; REBOOT SESSION &lt;
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
