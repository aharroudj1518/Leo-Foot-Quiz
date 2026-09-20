# La Liga player expansion

Barcelona is the first domestic Spanish club with player questions: 27 official first-team player cards, captured 11 September 2026, plus its existing ground questions. La Liga now has 66 questions; the whole bank has 2,384. Other Spanish clubs remain ground-only. This is a selected club-page snapshot, not a complete league registration list.

Source: https://www.fcbarcelona.com/en/football/first-team/players

The raw HTML was downloaded to ignored `.expo/barcelona-squad.html`. `scripts/extract-barcelona-squad.mjs` extracts displayed names, numbers, positions and profile URLs, validates card counts/unique IDs/shirt numbers, and saves a dated source SHA in `src/content/sources/la-liga-players-2026-27.json`. No player photographs or article prose were imported. Regenerate with the extractor followed by `node scripts/import-club-season.mjs`.

The La Liga Real Madrid squad page was checked both as raw HTML/Next data and in a rendered browser. It identifies season 2026/27 but returned no player rows. Its publicly shipped script loads squad data separately; no subscription key was extracted or used. Prefer official club pages with visible player cards for the next imports. Real Madrid's own page displays a provisional roster and no goalkeeper rows in the observed text, so it was not imported in this pass.

Validation: TypeScript, 103 unit tests, web export and four phone browser tests passed. The Barcelona test compares the generated shirt number/source to the snapshot and answers Joan García's question. Independent editorial and commercial review remain unapproved. This expansion is later than the live website source b978a67 and queued Android source eb7adf1.
