import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Deck,
  Difficulty,
  GameMode,
  GameResult,
  Pair,
} from "@/features/quizdeck/types";

const DIFFICULTY_PAIRS: Record<Difficulty, number> = {
  easy: 3,
  medium: 6,
  hard: 8,
};

type CardT = { key: string; pairId: string; kind: "q" | "a" };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

const fmtTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const GLASS_CARD =
  "rounded-3xl border border-glass-border shadow-[0_18px_50px_-22px_rgba(49,46,129,0.4)] backdrop-blur-xl";

export function GameBoard({
  deck,
  mode,
  difficulty,
  onRestart,
  onFinish,
}: {
  deck: Deck;
  mode: GameMode;
  difficulty: Difficulty;
  onRestart: () => void;
  onFinish: (result: GameResult) => void;
}) {
  // Difficulty sets the round length: easy 3 pairs, medium 6, hard 8.
  const activePairs = useMemo(
    () => deck.pairs.slice(0, DIFFICULTY_PAIRS[difficulty]),
    [deck, difficulty],
  );
  const cards = useMemo(
    () =>
      shuffle(
        mode === "quiz"
          ? // Quiz mode has no answer cards — answers happen in the separate quiz section.
            activePairs.map((p): CardT => ({
              key: p.id + "-q",
              pairId: p.id,
              kind: "q",
            }))
          : activePairs.flatMap((p): CardT[] => [
              { key: p.id + "-q", pairId: p.id, kind: "q" },
              { key: p.id + "-a", pairId: p.id, kind: "a" },
            ]),
      ),
    [mode, activePairs],
  );
  const choicesByPair = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const p of deck.pairs) m[p.id] = shuffle(p.choices);
    return m;
  }, [deck]);
  const pairById = useMemo(
    () =>
      Object.fromEntries(activePairs.map((p) => [p.id, p])) as Record<
        string,
        Pair
      >,
    [activePairs],
  );
  const cardByKey = useMemo(
    () =>
      Object.fromEntries(cards.map((c) => [c.key, c])) as Record<string, CardT>,
    [cards],
  );

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongKeys, setWrongKeys] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  // The separate quiz section: which pair is being answered, and how it's going.
  const [quizPairId, setQuizPairId] = useState<string | null>(null);
  const [quizWrong, setQuizWrong] = useState<string | null>(null);
  const [quizSolved, setQuizSolved] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishedRef = useRef(false);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const totalPairs = activePairs.length;
  const isDone = matched.length === totalPairs;

  // Round timer.
  useEffect(() => {
    if (isDone) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isDone]);

  // A lone flipped answer card is a peek — flip it back after a few seconds.
  useEffect(() => {
    if (flipped.length !== 1) return;
    if (cardByKey[flipped[0]!]?.kind !== "a") return;
    const t = setTimeout(
      () => setFlipped((f) => (f.length === 1 ? [] : f)),
      4200,
    );
    return () => clearTimeout(t);
  }, [flipped, cardByKey]);

  // Report the finished round.
  useEffect(() => {
    if (!isDone || finishedRef.current) return;
    finishedRef.current = true;
    const t = setTimeout(
      () => onFinish({ score, moves, seconds, pairs: totalPairs }),
      1100,
    );
    return () => clearTimeout(t);
  }, [isDone, score, moves, seconds, totalPairs, onFinish]);

  const matchPair = (pairId: string, streakAtCall: number) => {
    const nextStreak = streakAtCall + 1;
    const pts = 100 + streakAtCall * 25;
    setMatched((m) => [...m, pairId]);
    setScore((s) => s + pts);
    setStreak(nextStreak);
    setFlipped([]);
    setWrongKeys([]);
    setLock(false);
    setFeedback(
      `Correct — +${pts} pts${nextStreak > 1 ? ` · streak ×${nextStreak}` : ""}`,
    );
    later(() => setFeedback(null), 2800);
  };

  const missPair = (keys: string[], msg: string) => {
    setStreak(0);
    setScore((s) => Math.max(0, s - 15));
    setWrongKeys(keys);
    setFeedback(msg);
    setLock(true);
    later(() => {
      setFlipped([]);
      setWrongKeys([]);
      setLock(false);
      setFeedback(null);
    }, 1000);
  };

  const handleCardClick = (card: CardT) => {
    if (lock || isDone || quizPairId) return;
    if (matched.includes(card.pairId) || flipped.includes(card.key)) return;

    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length < 2) return;

    setLock(true);
    setMoves((m) => m + 1);
    const a = cardByKey[next[0]!]!;
    const b = cardByKey[next[1]!]!;
    if (a.pairId === b.pairId && a.kind !== b.kind) {
      later(() => matchPair(a.pairId, streak), 520);
    } else {
      missPair(next, "No match — try again");
    }
  };

  // Quiz mode: open the separate multiple-choice section for a flipped question card.
  const openQuiz = (pairId: string) => {
    if (lock || isDone) return;
    setQuizPairId(pairId);
    setQuizWrong(null);
    setQuizSolved(false);
  };

  const closeQuiz = (flipBack: boolean) => {
    if (flipBack && quizPairId) {
      const qKey = quizPairId + "-q";
      setFlipped((f) => f.filter((k) => k !== qKey));
    }
    setQuizPairId(null);
    setQuizWrong(null);
    setQuizSolved(false);
  };

  const handleQuizChoice = (pair: Pair, choice: string) => {
    if (quizSolved || isDone || matched.includes(pair.id)) return;
    setMoves((m) => m + 1);
    if (choice === pair.answer) {
      setQuizSolved(true);
      const streakAtCall = streak;
      later(() => {
        matchPair(pair.id, streakAtCall);
        closeQuiz(false);
      }, 1100);
    } else {
      setStreak(0);
      setScore((s) => Math.max(0, s - 15));
      setQuizWrong(choice);
      later(() => setQuizWrong(null), 900);
    }
  };

  const renderCard = (card: CardT) => {
    const isMatched = matched.includes(card.pairId);
    const isFlipped = isMatched || flipped.includes(card.key);
    const pair = pairById[card.pairId]!;
    const isWrong = wrongKeys.includes(card.key);

    if (!isFlipped) {
      return (
        <button
          key={card.key}
          onClick={() => handleCardClick(card)}
          className={`matching-card matching-card-back group relative grid min-h-[215px] cursor-pointer place-items-center bg-glass-soft transition-all duration-200 hover:-translate-y-1 hover:bg-glass ${GLASS_CARD}`}
        >
          <span className="matching-card-question" aria-hidden="true">
            ?
          </span>
        </button>
      );
    }

    if (isMatched) {
      return (
        <div
          key={card.key}
          className={`matching-card matching-card-matched anim-pop relative flex min-h-[215px] flex-col justify-between bg-success/10 border-success/40 ${GLASS_CARD}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-success">
              {card.kind === "q" ? "Question" : "Answer"}
            </span>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-success text-[11px] font-bold text-background">
              ✓
            </span>
          </div>
          <p className="font-display text-[15px] font-semibold leading-snug text-foreground">
            {card.kind === "q" ? pair.question : pair.answer}
          </p>
          <span className="text-xs font-medium text-muted-foreground">
            {card.kind === "q" ? `→ ${pair.answer}` : "Locked in"}
          </span>
        </div>
      );
    }

    if (card.kind === "a") {
      return (
        <div
          key={card.key}
          className={`matching-card matching-card-face anim-flip relative flex min-h-[215px] flex-col justify-between bg-glass ${GLASS_CARD}`}
        >
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Answer
          </span>
          <p className="font-display text-lg font-bold leading-snug text-foreground">
            {pair.answer}
          </p>
          <span className="text-xs font-medium text-muted-foreground">
            Peek · flips back soon
          </span>
        </div>
      );
    }

    // Flipped question card.
    if (mode === "quiz") {
      // Quiz mode — invites the player into the separate quiz section.
      return (
        <div
          key={card.key}
          className={`matching-card matching-card-face anim-flip relative flex min-h-[215px] flex-col p-4 ${
            isWrong
              ? "anim-shake border-flare/60 bg-flare/10"
              : "bg-glass border-glass-border"
          } ${GLASS_CARD}`}
        >
          <span className="mb-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Question
          </span>
          <p className="font-display text-[15px] font-semibold leading-snug text-foreground">
            {pair.question}
          </p>
          <button
            onClick={() => openQuiz(pair.id)}
            disabled={lock || isDone}
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 font-display text-xs font-bold text-primary-foreground shadow-[0_10px_28px_-10px_rgba(79,70,229,0.7)] transition hover:brightness-110 disabled:opacity-60"
          >
            Answer this question
            <span aria-hidden="true">→</span>
          </button>
        </div>
      );
    }

    // Classic mode — match this question card with its answer card.
    return (
      <div
        key={card.key}
        className={`matching-card matching-card-face anim-flip relative flex min-h-[215px] flex-col justify-between p-4 ${
          isWrong
            ? "anim-shake border-flare/60 bg-flare/10"
            : "bg-glass border-glass-border"
        } ${GLASS_CARD}`}
      >
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Question
        </span>
        <p className="font-display text-[15px] font-semibold leading-snug text-foreground">
          {pair.question}
        </p>
        <span className="text-xs font-medium text-muted-foreground">
          Find the matching answer
        </span>
      </div>
    );
  };

  const quizPair = quizPairId ? pairById[quizPairId] : undefined;
  const quizIndex = quizPair
    ? deck.pairs.findIndex((p) => p.id === quizPair.id) + 1
    : 0;

  // The separate multiple-choice section replaces the board while open.
  if (quizPair) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => closeQuiz(true)}
            disabled={quizSolved}
            className="rounded-full border border-glass-border bg-glass-soft px-4 py-1.5 font-display text-xs font-bold text-muted-foreground backdrop-blur-md transition hover:bg-glass hover:text-foreground disabled:opacity-60"
          >
            ← Back to board
          </button>
          <span className="rounded-full border border-glass-border bg-glass px-3.5 py-1.5 font-display text-xs font-bold text-foreground backdrop-blur-md">
            Question {quizIndex} of {totalPairs}
          </span>
        </div>

        <div
          className={`anim-pop flex flex-col rounded-[28px] bg-panel p-7 shadow-[0_24px_70px_-24px_rgba(49,46,129,0.45)] backdrop-blur-2xl border sm:p-10 ${
            quizSolved ? "border-success/50" : "border-glass-border"
          }`}
        >
          <span className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            {deck.title} · {deck.level}
          </span>
          <h2 className="font-display text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            {quizPair.question}
          </h2>

          <div className="mt-8 grid gap-3">
            {(choicesByPair[quizPair.id] ?? []).map((choice, i) => {
              const isRight = quizSolved && choice === quizPair.answer;
              const isWrongPick = quizWrong === choice;
              return (
                <button
                  key={choice}
                  onClick={() => handleQuizChoice(quizPair, choice)}
                  disabled={quizSolved}
                  className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left font-display text-base font-semibold transition ${
                    isRight
                      ? "border-success/50 bg-success/15 text-success"
                      : isWrongPick
                        ? "anim-shake border-flare/60 bg-flare/10 text-flare-deep"
                        : "border-glass-border bg-glass-soft text-foreground hover:-translate-y-0.5 hover:bg-glass"
                  } disabled:cursor-default`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      isRight
                        ? "bg-success text-background"
                        : isWrongPick
                          ? "bg-flare text-background"
                          : "bg-primary/15 text-primary"
                    }`}
                  >
                    {isRight ? "✓" : String.fromCharCode(65 + i)}
                  </span>
                  {choice}
                </button>
              );
            })}
          </div>

          <p
            className={`mt-6 min-h-6 font-display text-sm font-semibold ${
              quizSolved
                ? "text-success"
                : quizWrong
                  ? "text-flare-deep"
                  : "text-transparent"
            }`}
            aria-live="polite"
          >
            {quizSolved
              ? "Correct! Locking in the pair…"
              : quizWrong
                ? "Not quite — -15 pts. Try again!"
                : "·"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="matching-game">
      <div className="matching-game-title">
        <p className="matching-game-eyebrow">
          A cute computer science challenge
        </p>
        <h1>
          Guess CS <span aria-hidden="true">🌸</span>
        </h1>
        <p>
          {mode === "classic"
            ? `Flip two cards and find all ${totalPairs} matching pairs! ✨`
            : `Answer all ${totalPairs} cute little questions! ✨`}
        </p>
      </div>

      <div className="matching-game-toolbar">
        <div className="matching-game-stat">
          <span aria-hidden="true">⭐</span>
          <span>Moves: {moves}</span>
        </div>
        <div className="matching-game-stat">
          <span aria-hidden="true">💖</span>
          <span>
            Matches: {matched.length} / {totalPairs}
          </span>
        </div>
        <div className="matching-game-actions">
          <button type="button" onClick={onRestart}>
            <span aria-hidden="true">🔄</span> Restart
          </button>
        </div>
      </div>

      <div className="matching-game-meta">
        <span>⏱ {fmtTime(seconds)}</span>
        <span>Score: {score.toLocaleString()}</span>
        {streak > 1 && <span>🔥 Streak ×{streak}</span>}
      </div>

      <div className="matching-card-grid">{cards.map(renderCard)}</div>

      <p className="matching-game-feedback" aria-live="polite">
        {feedback ??
          (mode === "classic"
            ? "Pick two cards! 💕"
            : "Flip a card to start! 💕")}
      </p>
    </section>
  );
}
