"use client";

export function OfflineActions() {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => {
          window.location.href = "/";
        }}
        className="w-full bg-[#88c0d0] text-[#1b2234] border-2 border-transparent font-mono font-bold py-3 px-4 rounded-base shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 cursor-pointer text-xs md:text-sm uppercase tracking-wider"
      >
        Go to Home
      </button>
      <button
        onClick={() => window.location.reload()}
        className="w-full bg-[var(--bg-card-alt)] text-slate-300 border-2 border-[var(--border-color)] font-mono font-bold py-3 px-4 rounded-base shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 cursor-pointer text-xs md:text-sm uppercase tracking-wider"
      >
        Try Again
      </button>
    </div>
  );
}
