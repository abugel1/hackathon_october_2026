import type { Deck } from "@/features/quizdeck/types";

export const csDeck: Deck = {
  id: "cs",
  title: "Computer Science",
  letter: "C",
  blurb:
    "Keyboards, mice, screens and bugs — the very basics of how computers work.",
  level: "Elementary",
  pairs: [
    {
      id: "cs1",
      question: "What part of the computer do you type on?",
      answer: "The keyboard",
      choices: ["The keyboard", "The mouse", "The screen", "The printer"],
    },
    {
      id: "cs2",
      question: "Which part shows you pictures and words?",
      answer: "The screen",
      choices: ["The screen", "The keyboard", "The headphones", "The mouse"],
    },
    {
      id: "cs3",
      question: "What do you use to point and click on things?",
      answer: "The mouse",
      choices: ["The mouse", "The keyboard", "The speaker", "The plug"],
    },
    {
      id: "cs4",
      question: "What is a small picture you click to open a game or app?",
      answer: "An icon",
      choices: ["An icon", "A bug", "A pixel", "A folder"],
    },
    {
      id: "cs5",
      question: "What do we call a mistake in a computer program?",
      answer: "A bug",
      choices: ["A bug", "An icon", "A mouse", "A click"],
    },
    {
      id: "cs6",
      question: "What should you do to your work so you don't lose it?",
      answer: "Save it",
      choices: ["Save it", "Erase it", "Hide it", "Shake it"],
    },
    {
      id: "cs7",
      question:
        "Which part is called the computer's brain because it does all the thinking?",
      answer: "The CPU",
      choices: ["The CPU", "The mouse", "The screen", "The keyboard"],
    },
    {
      id: "cs8",
      question:
        "What secret word keeps your computer account safe from others?",
      answer: "A password",
      choices: ["A password", "A screensaver", "A wallpaper", "A cursor"],
    },
    {
      id: "cs9",
      question:
        "When computers are connected so they can share things, what is it called?",
      answer: "A network",
      choices: ["A network", "A keyboard", "A printer", "A bookmark"],
    },
  ],
};
