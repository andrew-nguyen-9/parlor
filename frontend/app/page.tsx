import Link from "next/link";
import Marquee from "@/components/Marquee";
import Deck from "@/components/Deck";
import { GAMES } from "@/lib/games";
import { CATEGORY_HEX } from "@/lib/types";
import { isDbConfigured } from "@/lib/db";

const TICKER = [
  "forged nightly from Wikipedia · Deezer · Sleeper · ESPN · TMDB",
  "the rite of spring caused a riot in 1913",
  "saturn has the most confirmed moons",
  "canberra, not sydney",
  "9.58 seconds — usain bolt, 2009",
  "rosebud was a sled",
  "south africa has three capitals",
  "the eiffel tower grows 15 cm taller in summer",
  "♦ your card has been dealt",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="glow" style={{ background: "#6e1f2b" }} aria-hidden />

      {/* The threshold — invitation, not nightlife */}
      <section className="relative z-10 flex min-h-[82vh] flex-col justify-end px-4 pb-10 pt-12 sm:px-8">
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/40 to-transparent" aria-hidden />

        <div className="flex items-center justify-between">
          <span className="microlabel">the secret order · by invitation</span>
          <span className="microlabel" style={{ color: "#a87a2e99" }}>
            {isDbConfigured() ? "♦ live bank" : "♦ nightly deck"}
          </span>
        </div>

        <div className="mt-auto">
          {/* Order seal — the flaming spade & all-seeing eye */}
          <img
            src="/logo-256.png?v=2"
            alt="The Parlor — a secret order"
            width={120}
            height={132}
            className="eye-glow mb-4 h-28 w-auto drop-shadow-[0_6px_30px_rgba(110,31,43,0.5)] sm:h-32"
          />
          <p className="microlabel mb-3 tracking-[0.3em] text-brass">
            ✦ &nbsp; a secret order of the curious &nbsp; ✦
          </p>
          <h1 className="gilt display text-[clamp(4.5rem,20vw,15rem)] leading-[0.86] tracking-[0.01em]">
            Parlor
          </h1>
        </div>

        <p className="mt-4 max-w-lg text-sm text-muted sm:text-base">
          Ten rooms behind one velvet door. A question bank forged nightly, a new
          mystery every dusk. Draw a card — the house always keeps a secret.
        </p>

        <div className="mt-6 flex gap-4 text-lg text-brass opacity-30" aria-hidden>
          <span>♠</span><span>♦</span><span>☾</span><span>♣</span><span>♥</span><span>✦</span>
        </div>
      </section>

      <Marquee items={TICKER} />

      <Deck games={GAMES} />

      {/* The ledger — every room at a glance, server-rendered from GAMES */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <div className="deco-rule mb-8">
          <span className="gilt display text-lg tracking-[0.2em]">The Rooms</span>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <li key={game.href} className={game.href === "/mystery" ? "lg:col-span-3" : undefined}>
              <Link
                href={game.href}
                className="gilt-frame group flex h-full gap-4 rounded-xl bg-surface/40 p-5 transition hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span
                  aria-hidden
                  className="display mt-0.5 shrink-0 text-3xl leading-none"
                  style={{ color: CATEGORY_HEX[game.accent] }}
                >
                  {game.emblem}
                </span>
                <div className="min-w-0">
                  <span
                    className="microlabel block"
                    style={{ color: CATEGORY_HEX[game.accent] }}
                  >
                    {game.character}
                  </span>
                  <h2 className="gilt display mt-1 text-lg leading-tight tracking-[0.04em]">
                    {game.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {game.blurb}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="relative z-10 border-t border-line px-4 py-10 sm:px-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs text-brass opacity-40">✦</span>
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-brass opacity-40">✦</span>
        </div>
        <p className="microlabel">
          data · wikipedia rest api · deezer api · sleeper api · espn · tmdb — this
          product uses the TMDB API but is not endorsed or certified by TMDB
        </p>
      </footer>
    </main>
  );
}
