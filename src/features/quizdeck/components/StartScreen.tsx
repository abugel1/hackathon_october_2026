import { useState } from "react";
import type { Deck, Difficulty, GameMode } from "@/features/quizdeck/types";

const difficulties: { id: Difficulty; title: string; pairs: number }[] = [
  { id: "easy", title: "Easy", pairs: 3 },
  { id: "medium", title: "Medium", pairs: 6 },
  { id: "hard", title: "Hard", pairs: 8 },
];

const modes: { id: GameMode; title: string; description: string }[] = [
  {
    id: "classic",
    title: "Classic match",
    description: "Flip cards to find matching question and answer pairs.",
  },
  {
    id: "quiz",
    title: "Quiz round",
    description: "Answer a multiple-choice question whenever you flip a card.",
  },
];

export function StartScreen({
  deck,
  onStart,
}: {
  deck: Deck;
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<GameMode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");

  return (
    <section className="landing-screen" aria-label="Guess CS">
      <div className="landing-artwork">
        <img
          className="landing-artwork-image"
          src="/guess-cs-cover.png"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className="landing-title-replacement" aria-hidden="true">
          <span>Guess</span>
          <span>CS</span>
        </div>
        <button
          type="button"
          className="landing-start-button"
          aria-label="Start Guess CS"
          onClick={() => setShowSettings(true)}
        />
      </div>

      {showSettings && (
        <div
          className="game-settings-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSettings(false);
          }}
        >
          <section
            aria-labelledby="game-settings-title"
            aria-modal="true"
            className="game-settings-card"
            role="dialog"
          >
            <div className="game-settings-heading">
              <span aria-hidden="true" className="game-settings-flower">
                ✿
              </span>
              <p className="game-settings-kicker">
                A little learning, a lot of fun
              </p>
              <h1 id="game-settings-title">Ready to play Guess CS?</h1>
              <p className="game-settings-description">
                Pick a game style and difficulty for {deck.title.toLowerCase()}.
              </p>
            </div>

            <fieldset className="game-settings-group">
              <legend>Choose how to play</legend>
              <div className="game-choice-list">
                {modes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={mode === option.id}
                    className={`game-choice ${mode === option.id ? "is-selected" : ""}`}
                    onClick={() => setMode(option.id)}
                  >
                    <span className="game-choice-copy">
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </span>
                    <span aria-hidden="true" className="game-choice-check">
                      {mode === option.id ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="game-settings-group">
              <legend>Choose your level</legend>
              <div className="game-difficulty-list">
                {difficulties.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={difficulty === option.id}
                    className={`game-difficulty ${difficulty === option.id ? "is-selected" : ""}`}
                    onClick={() => setDifficulty(option.id)}
                  >
                    <strong>{option.title}</strong>
                    <span>
                      {option.pairs} pairs ·{" "}
                      {mode === "classic" ? option.pairs * 2 : option.pairs}{" "}
                      cards
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="game-settings-actions">
              <button
                type="button"
                className="game-settings-cancel"
                onClick={() => setShowSettings(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="game-settings-start"
                onClick={() => onStart(mode, difficulty)}
              >
                Let&apos;s play! <span aria-hidden="true">♥</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
