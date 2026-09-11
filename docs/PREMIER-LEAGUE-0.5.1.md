# Premier League player expansion

Adds 555 selected players across all 20 Premier League clubs. Together with the existing 38 grounds/location questions, this competition has 593 questions. The whole app has 1,802 questions. La Liga, Serie A and Bundesliga still have club/ground questions only.

The official Fantasy Premier League public catalogue supplies names, club membership and positional groups: https://fantasy.premierleague.com/api/bootstrap-static/. Retrieved 11 September 2026. Its first gameweek is in August 2026 and all 20 clubs match the existing season catalogue. Entries marked unavailable are excluded; injured/doubtful players remain. This selection includes young players but is not a complete registration list.

The separate official senior registration article was inspected first. An attempted name-token match across unrelated clubs proved unsafe (for example the single name Gabriel), so that approach was discarded before any playable content was generated or committed. The final snapshot uses the FPL record's own full name, or its own display name for names over 30 characters; no cross-player name inference is used.

Only factual name, stable player code, club and position fields are retained. No headshots, prices, performance statistics or article prose are copied. Raw response hash and source URL are recorded in the snapshot. Source access is not commercial rights clearance; independent editorial approval and commerce remain disabled.

Reproduction: download the public API response, run `node scripts/extract-premier-league.mjs path/to/bootstrap-static.json`, then `node scripts/import-club-season.mjs`. Inspect the resulting diff before release. The extractor rejects an unexpected season, mismatched clubs, empty/duplicate player names or clubs with fewer than 18 selected players.

Each new question identifies a club player among players in the same positional group. Teammates cannot be incorrect options. Stable IDs retain solved progress on future imports. Tests cover all club rosters, distractors, unseen rounds and existing season migration. All 87 unit tests, TypeScript, the web export and four desktop/phone competition flow tests passed. The first browser run used the previous static export and failed on outdated counts; rebuilding the export fixed the test environment. The compact club browser was visually inspected on a phone capture.

Version 0.5.1 is live at https://leo-foot-quiz.vercel.app/ from source 394f85ea88f24ff84112289ae976c9e089f59ef3. Production E4V8dZ1J1ABMBwfkPppg7zg6ERb5 completed Ready and the main alias was verified. Public browser QA confirmed the 593-question Premier League catalogue and a Chelsea player round with correct scoring. Native 0.5.1 has not been submitted. Android 0.5.0 completed successfully but does not contain these 555 additional questions.
