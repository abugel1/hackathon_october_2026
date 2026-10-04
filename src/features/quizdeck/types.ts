export type Pair = {
  id: string;
  question: string;
  answer: string;
  choices: string[];
};

export type Deck = {
  id: string;
  title: string;
  letter: string;
  blurb: string;
  level: string;
  pairs: Pair[];
};

export type GameMode = "classic" | "quiz";
export type Difficulty = "easy" | "medium" | "hard";

export type GameResult = {
  score: number;
  moves: number;
  seconds: number;
  pairs: number;
};
