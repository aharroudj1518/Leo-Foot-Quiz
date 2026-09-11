# Android validation 0.5.4

Submitted once on 11 September 2026 with the existing validation profile and remote Android keystore.

- Job: https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/81a88b97-f51d-4bfc-a295-583c673bb104
- Verified appVersion: 0.5.4
- Verified source: eb7adf145c45db970e855e30129ed501520e5f66
- Status after submission: IN_QUEUE; no artifact yet. Poll this job rather than submitting another after a timeout.

Includes 2,357 questions, all 18 Bundesliga clubs with 532 player questions and 36 ground questions, 70 player photographs, nine stadium photo questions, varied stadium/badge distractors, SQLite setup recovery and the club replay fix. No new cartoon artwork is included. Commerce remains disabled.

Before packaging, TypeScript, all 100 unit tests, web export and the phone browser Bundesliga flow passed. The latter restores an answered shirt clue and checks that the next round contains ten unseen questions from the same club. These checks do not establish physical Android acceptance or actual payment behavior.

The downloadable fallback remains Android 0.5.3: https://expo.dev/artifacts/eas/7X4pf31n7DgCHXBn_xLSpVN2hIFY-m4f_Mp44WUO2Ns.apk. It predates this release's Bundesliga, additional stadium and replay changes. No 0.5.4 iOS build was submitted; native iPhone signing and distribution remain unresolved.
