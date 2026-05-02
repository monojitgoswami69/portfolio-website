import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline | MG Portfolio",
  description: "You are currently offline. Please check your connection.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-slate-400"
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

        <h1 className="text-4xl font-space-grotesk font-bold text-white mb-2">You&rsquo;re Offline</h1>
        <p className="text-slate-400 mb-8">
          It looks like you&rsquo;ve lost your internet connection. Some features may be limited.
        </p>

        <div className="space-y-4 mb-8 text-left bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-300 font-medium">✓ Available offline:</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• View cached pages and projects</li>
            <li>• Access previously loaded content</li>
            <li>• Read skills and experience</li>
          </ul>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => window.location.href = "/"}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Reconnect to your internet to access all features.
        </p>
      </div>
    </div>
  );
}
