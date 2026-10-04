import type { Deck, GameResult } from "@/features/quizdeck/types";

const fmtTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function ResultsScreen({
  deck,
  result,
  best,
  newBest,
  onPlayAgain,
  onPickDeck,
}: {
  deck: Deck;
  result: GameResult;
  best: number;
  newBest: boolean;
  onPlayAgain: () => void;
  onPickDeck: () => void;
}) {
  const accuracy =
    result.moves > 0 ? Math.round((result.pairs / result.moves) * 100) : 0;

  const stats = [
    { label: "Time", value: fmtTime(result.seconds) },
    { label: "Moves", value: String(result.moves) },
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "Pairs", value: `${result.pairs}` },
  ];

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-[28px] border border-glass-border bg-panel p-10 text-center shadow-[0_24px_70px_-24px_rgba(49,46,129,0.45)] backdrop-blur-2xl">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          {deck.title} · Round complete
        </p>
        <p className="anim-pop mt-6 font-display text-7xl font-bold leading-none tracking-tight text-foreground">
          {result.score.toLocaleString()}
        </p>
        <p className="mt-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Final score
        </p>

        {newBest && (
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-flare/40 bg-flare/15 px-4 py-1.5 font-display text-xs font-bold text-flare-deep">
            <span className="h-2 w-2 rounded-full bg-flare" />
            New personal best!
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-glass-border bg-glass p-4"
            >
              <p className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium text-muted-foreground">
          Best score · {best.toLocaleString()} pts
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onPlayAgain}
            className="rounded-full bg-primary px-7 py-2.5 font-display text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
          >
            Play again
          </button>
          <button
            onClick={onPickDeck}
            className="rounded-full border border-glass-border bg-glass px-7 py-2.5 font-display text-sm font-bold text-foreground backdrop-blur-md transition hover:bg-glass-strong"
          >
            Back to start
          </button>
        </div>
      </div>
    </section>
  );
}
