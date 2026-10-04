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
        title: "Guess CS — Cute Pairs",
      },
      {
        name: "description",
        content:
          "Flip cute cards, find matching pairs, and learn computer science along the way.",
      },
      {
        property: "og:title",
        content: "Guess CS — Cute Pairs",
      },
      {
        property: "og:description",
        content:
          "A cheerful matching game with classic pairs and multiple-choice quiz rounds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Guess CS — Cute Pairs",
      },
      {
        name: "twitter:description",
        content:
          "A cheerful matching game with classic pairs and multiple-choice quiz rounds.",
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
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [round, setRound] = useState(0);
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
    setRound((currentRound) => currentRound + 1);
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
    <main className="app-shell">
      {screen === "menu" ? (
        <StartScreen deck={csDeck} onStart={startGame} />
      ) : (
        <div className="game-page">
          <header className="game-page-header">
            <button
              type="button"
              className="game-brand"
              onClick={() => setScreen("menu")}
              aria-label="Back to Guess CS home"
            >
              <span aria-hidden="true" className="game-brand-flower">
                ✿
              </span>
              <span>Guess CS</span>
            </button>
            {best > 0 && (
              <div className="game-best-score">
                <span aria-hidden="true">★</span>
                Best · {best.toLocaleString()} pts
              </div>
            )}
          </header>

          <div className="game-page-content">
            {screen === "playing" && (
              <GameBoard
                key={csDeck.id + mode + difficulty + round}
                deck={csDeck}
                mode={mode}
                difficulty={difficulty}
                onRestart={() => setRound((currentRound) => currentRound + 1)}
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
        </div>
      )}
    </main>
  );
}
