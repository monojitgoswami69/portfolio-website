import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-24 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.1),transparent_30%)]" />
      <div className="relative z-10 max-w-xl rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center shadow-2xl backdrop-blur">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-cyan-400">
          404
        </p>
        <h1 className="mt-4 font-quantico text-4xl font-bold text-white">
          Route Not Found
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-400">
          The page you requested does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-6 py-3 font-mono text-sm font-semibold text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-white"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
