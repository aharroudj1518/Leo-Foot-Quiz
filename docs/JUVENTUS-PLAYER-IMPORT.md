# Juventus player questions — 11 September 2026

Added 28 player shirt clues from the current Juventus first-team page: https://www.juventus.com/en/teams/first-team-men/squad/. The displayed names, numbers and position groups were checked against the retrieved HTML and web rendering. The club's 6 September 2026 match list provides season context: https://jacademy.juventus.com/en/news/articles/squad-list-juventus-milan-06-09-26. The general squad page has no explicit season selector; this is a dated current-page snapshot, not a complete Serie A registration list. Match-day selections are not treated as the full roster.

The extractor stores the source URL, retrieval date and raw HTML SHA-256, validates four position groups, player count and unique profile IDs/shirt numbers, and merges Juventus into the existing Serie A snapshot. Milan remains intact. No club photographs or article prose were imported. Independent editorial and rights approval remain false.

Reproduction: retrieve the public page to .expo/juventus-squad.html, run node scripts/extract-juventus-squad.mjs .expo/juventus-squad.html src/content/sources/serie-a-players-2026-27.json, then node scripts/import-club-season.mjs. The older Milan extractor creates a fresh league file; if rebuilding it, re-run the Juventus extractor afterward.

Results: Juventus 30 questions, Serie A 95 questions, full bank 2,455 questions. Comparing question objects by ID against the previous commit found exactly 28 additions and zero changes or removals. TypeScript, 106 unit tests, web export and six phone-browser club/competition tests passed, including the Juventus shirt clue, source and answer feedback.

This content is prepared after Android 0.5.5 source 21343dc and web production source 391e245. Those releases do not contain it yet. Eighteen Serie A clubs still have ground questions only.
