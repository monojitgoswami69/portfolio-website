import type { Metadata } from "next";
import { OfflineActions } from "./offline-actions";

export const metadata: Metadata = {
  title: "Offline | MG Portfolio",
  description: "You are currently offline. Please check your connection.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(136,192,208,0.05),transparent_40%),radial-gradient(circle_at_bottom,rgba(180,142,173,0.05),transparent_35%)]" />
      <div className="text-center max-w-md relative z-10 border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-8 md:p-10 shadow-[var(--shadow-lg)] rounded-base">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-[var(--bg-card-alt)] border-2 border-[var(--border-color)] rounded-base flex items-center justify-center shadow-[3px_3px_0px_0px_var(--shadow-color)]">
            <svg
              className="w-10 h-10 text-[#88c0d0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-quantico font-bold text-white mb-2 uppercase tracking-wider">Connection Severed</h1>
        <p className="text-slate-400 text-xs md:text-sm font-mono mb-8">
          The network link is down. Offline cached state active.
        </p>

        <div className="space-y-3 mb-8 text-left bg-[var(--bg-card-alt)] rounded-base p-5 border-2 border-[var(--border-color)] shadow-[3px_3px_0px_0px_var(--shadow-color)]">
          <p className="text-xs text-[#88c0d0] font-mono font-bold uppercase tracking-wider">✓ CACHED PROCEDURES ACTIVE:</p>
          <ul className="space-y-2 text-[11px] md:text-xs text-slate-400 font-mono">
            <li>• View cached pages and projects</li>
            <li>• Access previously loaded content</li>
            <li>• Read technical skills and experience</li>
          </ul>
        </div>

        <OfflineActions />

        <p className="text-[10px] text-slate-500 mt-6 font-mono uppercase tracking-widest">
          Reconnect physical link to restore live chat
        </p>
      </div>
    </div>
  );
}
