"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route error boundary — replaces Next's bare white "Application error" screen
 * with a themed retry card whenever any client component under a route segment
 * throws. `reset()` re-renders the segment (retry in place); the lobby link is
 * the always-available escape hatch. Kept dependency-light on purpose: it has to
 * render even when the rest of the app is broken.
 *
 * ponytail: no global-error.tsx — the root layout (fonts/metadata/static scripts)
 * has ~no runtime throw surface; add one if layout logic grows.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface once for debugging; the offline app carries no telemetry dep.
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="glow" style={{ background: "#6e1f2b" }} aria-hidden />
      <div className="relative z-10 max-w-md">
        <p className="microlabel mb-3 tracking-[0.3em] text-brass">
          ✦ &nbsp; the circle broke &nbsp; ✦
        </p>
        <h1 className="gilt display text-[clamp(3rem,14vw,7rem)] leading-none">
          A snag
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted sm:text-base">
          Something in this room faltered. The rest of the house is untouched —
          draw the card again, or step back to the lobby.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="microlabel rounded-full border border-brass px-5 py-2.5 text-gold transition hover:bg-brass/10"
          >
            try again
          </button>
          <Link
            href="/"
            className="microlabel rounded-full border border-line px-5 py-2.5 text-muted transition hover:border-brass"
          >
            back to the lobby
          </Link>
        </div>
      </div>
    </main>
  );
}
