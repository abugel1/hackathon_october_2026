import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { csDeck } from "@/features/quizdeck/data/decks";
import { GameBoard } from "@/features/quizdeck/components/GameBoard";
import { ResultsScreen } from "@/features/quizdeck/components/ResultsScreen";
import { StartScreen } from "@/features/quizdeck/components/StartScreen";
import type {
  Difficulty,
  GameMode,
  GameResult,
} from "@/features/quizdeck/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "QuizDeck — Computer Science Card Matching",
      },
      {
        name: "description",
        content:
          "An elementary-level computer science card-matching game. Flip cards to find each question, then answer it with multiple-choice options to lock in the pair.",
      },
      {
        property: "og:title",
        content: "QuizDeck — Computer Science Card Matching",
      },
      {
        property: "og:description",
        content:
          "Flip a card, answer the multiple-choice computer science question, and lock in the matching pair. Built for elementary learners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "QuizDeck — Computer Science Card Matching",
      },
      {
        name: "twitter:description",
        content:
          "Flip a card, answer the multiple-choice computer science question, and lock in the matching pair. Built for elementary learners.",
      },
    ],
  }),
  component: Index,
});

type Screen = "menu" | "playing" | "results";

const BEST_KEY = "quizdeck-best";

function Index() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<GameMode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [result, setResult] = useState<GameResult | null>(null);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);

  const loadBest = () => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  };

  const startGame = (m: GameMode, d: Difficulty) => {
    setMode(m);
    setDifficulty(d);
    setBest(loadBest());
    setNewBest(false);
    setScreen("playing");
  };

  const finishGame = (r: GameResult) => {
    const savedBest = loadBest();
    const isNewBest = r.score > savedBest;
    if (isNewBest) {
      window.localStorage.setItem(BEST_KEY, String(r.score));
      setBest(r.score);
    } else {
      setBest(savedBest);
    }
    setNewBest(isNewBest);
    setResult(r);
    setScreen("results");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Aurora backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="blob absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[110px]" />
        <div className="blob absolute -right-44 top-1/3 h-[600px] w-[600px] rounded-full bg-flare/20 blur-[130px] [animation-delay:-6s]" />
        <div className="blob absolute -bottom-52 left-1/4 h-[520px] w-[520px] rounded-full bg-aqua/25 blur-[120px] [animation-delay:-11s]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <header className="flex items-center justify-between px-1 py-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-glass-border bg-glass text-lg font-bold text-primary backdrop-blur-md">
              Q
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              QuizDeck
            </span>
          </div>
          {best > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass px-4 py-1.5 font-display text-sm font-bold text-primary backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-flare" />
              Best · {best.toLocaleString()} pts
            </div>
          )}
        </header>

        {screen === "menu" && <StartScreen deck={csDeck} onStart={startGame} />}

        {screen === "playing" && (
          <GameBoard
            key={csDeck.id + mode + difficulty}
            deck={csDeck}
            mode={mode}
            difficulty={difficulty}
            onQuit={() => setScreen("menu")}
            onFinish={finishGame}
          />
        )}

        {screen === "results" && result && (
          <ResultsScreen
            deck={csDeck}
            result={result}
            best={best}
            newBest={newBest}
            onPlayAgain={() => startGame(mode, difficulty)}
            onPickDeck={() => setScreen("menu")}
          />
        )}
      </div>
    </main>
  );
}
