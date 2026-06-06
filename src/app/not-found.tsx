import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] px-6 py-24 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(136,192,208,0.05),transparent_40%),radial-gradient(circle_at_bottom,rgba(180,142,173,0.05),transparent_35%)]" />
      <div className="relative z-10 max-w-xl rounded-base border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-10 text-center shadow-[var(--shadow-lg)]">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#88c0d0]">
          ERROR // 404
        </p>
        <h1 className="mt-4 font-quantico text-4xl font-bold text-white uppercase tracking-wider">
          Route Not Found
        </h1>
        <p className="mt-4 text-sm font-mono text-slate-400">
          The requested system module does not exist or has been offline.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center bg-[#88c0d0] text-[#1b2234] border-2 border-transparent font-mono font-bold px-6 py-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:transition-none transition-all duration-200 rounded-base cursor-pointer"
        >
          &gt; Return Home &lt;
        </Link>
      </div>
    </main>
  );
}
