# European club season — 0.5.0

The owner requested replacement of the World Cup archive with Champions League 2026/27 teams, plus distinct Premier League, La Liga, Serie A and Bundesliga spaces.

## Delivered catalogue

| Space | Clubs | Questions | Content |
| --- | ---: | ---: | --- |
| Champions League | 36 | 856 | Selected UEFA List A players: identify a shirt, name a player's number, identify a squad member |
| Premier League | 20 | 38 | Clubs, grounds and ground locations |
| La Liga | 20 | 39 | Clubs, grounds and ground locations |
| Serie A | 20 | 40 | Clubs, grounds and ground locations |
| Bundesliga | 18 | 36 | Clubs, grounds and ground locations |

There are 1,009 club-season questions and 1,247 total app questions. The previous 1,248 World Cup squad questions no longer appear in the playable bank. Historical World Cup trivia in other categories remains; the owner asked to replace the archive, not erase all football history. Domestic spaces are explicitly labeled Clubs & grounds, not complete player squads. Their full rosters remain expansion work.

## Sources and provenance

UEFA's 2026/27 league-phase club list was inspected, then each of its 36 squad pages. The two English pages for Inter and Lens repeatedly timed out; their French UEFA squad pages supplied the records. Names, shirt numbers, nationality codes and positional groups were extracted. List B players, age, appearances, scores, photographs and article prose were excluded. Wrapped player labels were normalized before parsing. Each team retains its exact source URL. This is a dated factual snapshot, not a real-time roster feed.

Domestic club membership, grounds and locations were extracted from the four season tables on Wikipedia. Three Bundesliga stadium names were corrected against the official Bundesliga club list (Hoffenheim, Mönchengladbach, Elversberg). Wikipedia contributors' source URLs are retained per club; Wikipedia text is offered under CC BY-SA 4.0. Original question wording is generated from the selected factual fields. Source access does not constitute commercial database/rights clearance. Independent editorial and commercial approval remain false.

Input snapshots: `src/content/sources/champions-league-2026-27.json` and `domestic-clubs-2026-27.json`. Import metadata records their SHA-256 values and scope. `node scripts/import-club-season.mjs` validates and deterministically regenerates the bank and chapters. The old `import-squads.mjs` forwards to this importer so it cannot accidentally restore the World Cup archive.

## User experience

The five competition spaces now lead the home page. A stadium-backed Champions League card opens the club browser; four domestic cards open their own spaces directly. The browser has competition selection, accent-insensitive club search, alphabetical clubs, real counts and solved progress. Club monograms are original navigation marks, not official badges. The existing San Siro image remains covered by its existing artwork-credit entry.

Club rounds are scoped by stable question IDs. Switching competition does not reset progress. Retired World Cup sessions are dropped by existing hydration, while career totals and completed history remain. Tests cover this migration and ensure alternate names for San Siro cannot appear as wrong answers.

## Release status

TypeScript, the 84-test unit suite plus two new alias/migration checks, the plain-Node build-hook regression, Expo web export and all 48 desktop/phone browser tests passed. Phone captures were visually inspected. The previous successful Android 0.4.1 APK does not include this replacement. No store purchases, ads or commercial release are enabled by this update.

Production deployment APKsupgNMwUSRrCZ3MtnLgb96vVR is Ready at https://leo-foot-quiz.vercel.app/ from source 42a6d76dddb6cab35ae65feb427e5d033b6e145c. Public browser verification on 11 September confirmed all five home spaces, the 36-club/856-question Champions League catalogue, and a working Arsenal round with correct-answer feedback. See NATIVE-BUILDS-0.5.0.md for native status.

