# Bundesliga player expansion — 11 September 2026

Official club directory and all 18 club pages were fetched for the 2026/27 season. The extractor captured 532 listed players with names, shirt numbers, position groups and player-page links. Each club snapshot includes its source URL and raw HTML SHA-256. Full source responses are local in `.expo/bundesliga-import`; only factual records are committed, not photos or page prose.

The import rejects a mismatched club directory, missing position groups, implausible squad sizes, duplicate identities and invalid shirt numbers. Quiz generation also checks unique numbers within each club. All expected clubs must pass before replacing the combined snapshot. The data is a dated club-page snapshot, not a guarantee of complete registration lists; independent editorial and commercial review remain pending.

Each listed player adds one shirt-number question to their club chapter. Answers use the exact source display names and same-club alternatives. Bundesliga now has 568 questions including 36 ground/location questions. The full app bank totals 2,357 questions. Previously earned question IDs are retained.

Run `node scripts/import-bundesliga-squads.mjs`, then `node scripts/import-club-season.mjs` to refresh the declared season after reviewing source changes. Update season guards and membership deliberately for future seasons.

TypeScript and 99 unit tests passed after generation. The expansion is separate from the already-submitted 0.5.3 native jobs; do not imply those APK/simulator artifacts include these questions.
