# Serie A player expansion

AC Milan is the first Italian domestic club with player questions: 27 first-team player cards from its official 2026/27 roster, checked 11 September 2026. Serie A now has 67 questions and the full bank has 2,411. Other Italian clubs remain ground-only.

Source: https://www.acmilan.com/en/teams/men-first-team

`scripts/extract-milan-squad.mjs` parses the public page's shipped player-card data without executing its scripts. It retains names, shirt numbers and positions, requires four position groups and validates unique identifiers/numbers. The dated snapshot and raw HTML SHA are in `src/content/sources/serie-a-players-2026-27.json`. Player photos and biographies were not imported. Run the extractor against the saved HTML and then `node scripts/import-club-season.mjs` to regenerate questions.

Inter's official first-team route redirected to its teams page, which displayed "Page being updated". No Inter domestic roster was inferred from its separate Champions League registration list.

Validation: TypeScript, 103 unit tests, web export and five phone browser checks passed. The AC Milan test verifies the source-backed Mike Maignan shirt clue and correct-answer feedback. Independent editorial/commercial review remains unapproved. This expansion is on the preview branch, later than live source b978a67 and Android 0.5.4 source eb7adf1.
