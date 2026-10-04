# hackathon_october_2026

QuizDeck is a computer science card-matching game for elementary learners, built
with React and TanStack Start.

## Getting started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

## Scripts

- `npm run build` builds the app for production.
- `npm run preview` previews the production build.
- `npm run lint` runs ESLint.
- `npm test` runs the test suite.

## Project structure

- `src/features/quizdeck/components/` contains the game screens and board.
- `src/features/quizdeck/data/` contains the quiz deck content.
- `src/features/quizdeck/types.ts` contains shared game and deck types.
- `src/routes/` contains the TanStack file-based routes.
- `src/lib/` contains app-wide utilities and error handling.
- `public/` contains static files served as-is.
- Root-level files contain project and tool configuration.
