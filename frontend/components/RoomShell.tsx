import Link from "next/link";
import { CATEGORY_HEX, CATEGORY_GLYPH } from "@/lib/types";
import type { Category } from "@/lib/types";
import { RankBadge } from "./CardFace";
import { gameByHref } from "@/lib/games";
import { tutorialByHref } from "@/lib/tutorials";
import TutorialOverlay from "./TutorialOverlay";
import FluidStage from "./FluidStage";
import SettingsHub from "./SettingsHub";

const SUIT = CATEGORY_GLYPH; // single source (a11y non-color channel)

/** Room chrome: brass doorway frame, engraved nameplate, exit back to lobby. */
export default function RoomShell({
  label,
  title,
  accent,
  href,
  leftRail,
  rightRail,
  children,
}: {
  label: string;
  /** Page heading. Rooms whose content already renders an <h1> omit this; rooms
   *  that don't (séance/thread/ladder/clock) pass one so every route has exactly
   *  one <h1> for the outline/SEO/screen-reader. Rendered `sr-only` (mirrors
   *  BoardGame's pattern) — it names the page without imposing a visual title. */
  title?: string;
  accent: Category;
  /** This room's deck href (e.g. "/mystery") — looked up in lib/games.ts for
   *  the top-right rank badge. Omit for non-game rooms (e.g. /profile). */
  href?: string;
  /** Optional left-rail slot (mount a <CollapsiblePanel side="left" …>). On
   *  mobile it stacks above the play area; on `lg:` it sits in a sticky column. */
  leftRail?: React.ReactNode;
  /** Optional right-rail slot (mount a <CollapsiblePanel side="right" …>). */
  rightRail?: React.ReactNode;
  children: React.ReactNode;
}) {
  const hex = CATEGORY_HEX[accent];
  const game = href ? gameByHref(href) : undefined;
  // First-play tutorial + help icon for this room (undefined for non-game rooms).
  const tutorial = href ? tutorialByHref(href) : undefined;
  const hasRails = Boolean(leftRail || rightRail);
  // Desktop track template: rails are fixed ~15rem columns, the play area takes
  // the rest. Only the present rails get a column, so a single-rail room never
  // leaves a dead gap. Mobile is always one column (rails stack, collapsed).
  const railCols =
    leftRail && rightRail
      ? "lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,15rem)]"
      : leftRail
        ? "lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
        : "lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]";
  return (
    <main className="relative min-h-screen overflow-hidden pb-24 pt-6">
      <div className="glow" style={{ background: hex }} aria-hidden />

      {/* Brass doorway top rule */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${hex}66, transparent)` }}
        aria-hidden
      />

      {/* FluidStage owns the adaptive L/R gutter (clamp), so header and content
          share ONE fluid column that fills the viewport smallest→largest at any
          zoom with no dead side gutters and never x-overflows. No fixed max-width
          cap here (that left empty margins when zoomed out / on ultra-wide) — the
          padding is proportional (grows with vw) so utilization stays full while
          readability floors hold; rooms that want a tighter measure set their own
          cap inside `children` (e.g. Séance's inner FluidStage maxWidth="74rem"). */}
      <FluidStage
        as="div"
        padding="clamp(1rem, 4vw, 4rem)"
        className="relative z-10"
      >
      {/* One page heading for the outline/SEO/SR; only rooms lacking their own. */}
      {title && <h1 className="sr-only">{title}</h1>}

      <header className="flex items-center justify-between">
        {/* Logo, top-left — the way back to the lobby */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="PARLOR — home"
            className="flex min-h-[44px] min-w-[44px] items-center transition hover:opacity-80"
          >
            <img
              src="/logo-96.png?v=2"
              alt=""
              width={28}
              height={31}
              className="h-7 w-auto drop-shadow-[0_2px_8px_rgba(110,31,43,0.5)]"
            />
          </Link>
          {/* Engraved nameplate */}
          <span style={{ color: hex }} className="text-sm opacity-70" aria-hidden>
            {SUIT[accent]}
          </span>
          <span className="microlabel">{label}</span>
        </div>
        {/* Rank badge + the global settings gear, top-right */}
        <div className="flex items-center gap-2">
          {game && <RankBadge game={game} />}
          <SettingsHub />
        </div>
      </header>

      {/* Thin brass accent rule under header */}
      <div className="mt-3 border-t brass-rule" aria-hidden />

      {hasRails ? (
        <div
          className={`mt-6 grid grid-cols-1 gap-4 lg:items-start ${railCols}`}
        >
          {leftRail && <div className="min-w-0 lg:sticky lg:top-6">{leftRail}</div>}
          <div className="min-w-0">{children}</div>
          {rightRail && <div className="min-w-0 lg:sticky lg:top-6">{rightRail}</div>}
        </div>
      ) : (
        <div className="mt-6">{children}</div>
      )}
      </FluidStage>

      <Link
        href="/"
        className="microlabel fixed bottom-6 left-6 z-20 flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-2 backdrop-blur transition hover:border-brass"
      >
        <span className="opacity-60">←</span> Lobby
      </Link>

      {/* First-play tutorial overlay + persistent help icon (F2). Mounts itself
          — reads the current room's content from the tutorial registry by href. */}
      {tutorial && <TutorialOverlay tutorial={tutorial} />}
    </main>
  );
}
