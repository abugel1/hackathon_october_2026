import { useState } from "react";
import type { Deck, Difficulty, GameMode } from "@/features/quizdeck/types";

const difficulties: { id: Difficulty; title: string; pairs: number }[] = [
  { id: "easy", title: "Easy", pairs: 3 },
  { id: "medium", title: "Medium", pairs: 6 },
  { id: "hard", title: "Hard", pairs: 9 },
];

const steps = [
  {
    title: "Flip a card",
    text: "Tap any card to turn it over and peek inside.",
  },
  {
    title: "Find the match",
    text: "Pair each question with the card that answers it.",
  },
  {
    title: "Lock in the pair",
    text: "Get it right and the question and answer match up!",
  },
];

const modes: { id: GameMode; title: string; text: string }[] = [
  {
    id: "classic",
    title: "Classic",
    text: "Find the matching pairs — pair each question card with its answer card.",
  },
  {
    id: "quiz",
    title: "Quiz round",
    text: "No answer cards — flipping a question opens a separate quiz section with the answers.",
  },
];

export function StartScreen({
  deck,
  onStart,
}: {
  deck: Deck;
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
}) {
  const [mode, setMode] = useState<GameMode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Educational card matching
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          Learn computers.
          <br />
          Match faster.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] font-medium leading-relaxed text-muted-foreground">
          Flip the cards to pair each {deck.level.toLowerCase()}-level{" "}
          {deck.title.toLowerCase()} question with its answer. Two ways to play
          — pure matching, or a quiz round with multiple-choice. Chain matches
          to build a streak.
        </p>
      </div>

      <div className="rounded-[28px] border border-glass-border bg-glass-soft p-7 shadow-[0_24px_70px_-24px_rgba(49,46,129,0.45)] backdrop-blur-2xl">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-glass-border bg-primary/10 font-display text-2xl font-bold text-primary">
            {deck.letter}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {deck.title}
            </h2>
            <p className="mt-1 text-sm font-medium leading-snug text-muted-foreground">
              {deck.blurb}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-glass-border bg-glass px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                {deck.level}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {deck.pairs.length} pairs · {deck.pairs.length * 2} cards
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-glass-border bg-glass p-4"
            >
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Step {i + 1}
              </span>
              <p className="mt-1 font-display text-sm font-bold text-foreground">
                {step.title}
              </p>
              <p className="mt-1 text-[12px] font-medium leading-snug text-muted-foreground">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Choose your mode
          </p>
          <div
            className="grid gap-3 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Game mode"
          >
            {modes.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(m.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-primary/60 bg-primary/10 shadow-[0_10px_28px_-12px_rgba(79,70,229,0.5)]"
                      : "border-glass-border bg-glass hover:bg-glass-strong"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-foreground">
                      {m.title}
                    </span>
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-glass-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </span>
                  <p className="mt-1 text-[12px] font-medium leading-snug text-muted-foreground">
                    {m.text}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7">
          <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Choose a difficulty
          </p>
          <div
            className="grid gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Difficulty"
          >
            {difficulties.map((d) => {
              const active = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDifficulty(d.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-primary/60 bg-primary/10 shadow-[0_10px_28px_-12px_rgba(79,70,229,0.5)]"
                      : "border-glass-border bg-glass hover:bg-glass-strong"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-foreground">
                      {d.title}
                    </span>
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-glass-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </span>
                  <p className="mt-1 text-[12px] font-medium leading-snug text-muted-foreground">
                    {d.pairs} pairs ·{" "}
                    {mode === "classic" ? d.pairs * 2 : d.pairs} cards
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onStart(mode, difficulty)}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-primary px-7 py-3.5 font-display text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        >
          Start playing
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
