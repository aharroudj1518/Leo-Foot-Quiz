# Web release 0.5.4 — 11 September 2026

Production deployment `F93d7B381fHsFcdQtXsNX8wT4B2q` was verified Ready at approximately 16:22 BST, assigned to https://leo-foot-quiz.vercel.app/.

Source: `b978a678d8deb324103109c59c13f098f9c2565e`.
Details: https://vercel.com/aharroudj-4056s-projects/leo-foot-quiz/F93d7B381fHsFcdQtXsNX8wT4B2q

Includes the competition stadium headers, horizontal competition navigation, season and club progress bars, unfinished-club filter, club replay fix and balanced mixed/daily question selection. Content totals remain 2,357 questions, 70 player photos, nine stadium photo questions and six reimagined badges.

Public acceptance: saved the existing quiz via Save & leave before reloading, opened Bundesliga, observed 18 clubs and 568 questions with the existing 1/568 solved progress, and switched Still to solve on. The live filter exposed its pressed state correctly. The rendered public screen was inspected. Prior checks cover completed-club filtering, competition-switch reset, all four domestic club spaces and saved answers; 103 unit tests and ten general phone flows passed for the mixed-round change, followed by three phone competition checks for the redesign.

Android job `81a88b97-f51d-4bfc-a295-583c673bb104` remains IN_QUEUE with no artifact at this check. It uses earlier source `eb7adf1`, so it includes Bundesliga and club replay but excludes the later mixed-variety and competition-screen changes. Do not claim website/native parity. Commerce, cartoon artwork and physical-device acceptance remain incomplete.
