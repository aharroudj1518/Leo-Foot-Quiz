# Stadium redesign and club variety implementation plan

> For agentic workers: use superpowers:subagent-driven-development to implement and review the independent tasks below.

**Goal:** Match the approved blue/gold, teal and green-pitch references while retaining all existing functions and improving club-question variety.

**Architecture:** Keep the Expo app and shared UI tokens; add a reusable stadium backdrop and bold platform sans typography. Preserve legacy question IDs in the bank, with topic/fact metadata and a balanced selector separating content availability from normal-round selection.

**Tech stack:** Expo 57, React Native, TypeScript, local JSON, Vitest and Playwright.

## Tasks

- [x] Visual system: `src/ui.tsx`, `src/Typography.tsx`, new `src/StadiumBackdrop.tsx`, `App.tsx`. Use blue shell, teal question panel, gold progress, substantial answer tiles, readable sans-serif text, persistent utility navigation and existing controls. Keep large-text layout single-column. Verify with `npm run typecheck` and phone screenshots.
- [x] Mode presentation: `src/VisualExperience.tsx`, `src/PlayerAlbum.tsx`, `src/SquadArchive.tsx`, `src/LineupDetective.tsx`, `src/LetterBoard.tsx`, `src/DailyChallenge.tsx`, `src/CollectionProgress.tsx`, `src/ClubConnections.tsx`, `src/ShirtClue.tsx`, `src/MistakeReview.tsx`. Apply card frames, green pitch stripes/markings, bigger flags, raised controls, readable feedback. Retain every existing handler, accessibility label and credits.
- [x] Content: `scripts/import-club-season.mjs`, new sourced club facts, generated question and chapter JSON, `tests/squads.test.ts`. Expand clubs with genuinely distinct club facts; retain old definitions for saves; tag question topics and fact IDs; make imports reproducible. Check each option set contains exactly one accepted answer and every chapter has diverse coverage.
- [x] Selection: `src/core/quiz.ts`, `App.tsx` call sites and dedicated variety tests. Canonical facts suppress duplicate encounters across competitions. Balance club topics and cap roster questions without padding shorter unseen rounds. Keep explicit revision and daily determinism. Test duplicate IDs/facts, repeated topics, exhaustion and hydration.
- [x] Regression: correct old image-name expectations in `e2e/barcelona.spec.ts` and `e2e/bundesliga.spec.ts`, derive portrait count in `e2e/review.spec.ts`. Run `npm run check`, `npm run build:web`, `npm run test:e2e -- --workers=2 --reporter=line`; inspect phone/desktop screenshots and fix actual layout failures.
- [x] Delivery: record changes and validation in the review document, show the local preview and screenshots. Do not claim native-device acceptance without a device run.

## Working constraints

The workspace already contains extensive uncommitted user work. Modify it in place, preserve unrelated edits, and do not commit mixed existing work. User approved the combined style and implementation on 17 September 2026. No further design gate is needed. Currency, lives, adverts and new locked modes are not part of this task.
