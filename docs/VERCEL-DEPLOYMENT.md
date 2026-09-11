# Expo web deployment

The public deployment checked on 9 September 2026 returned the raw 307-byte
`index.ts` entry point with Content-Type `video/mp2t`. It was serving source,
not an Expo web export.

The root `vercel.json` now selects `npm run build:web` and serves only `dist`.
Vercel checks existing static files before the SPA fallback rewrite, so JavaScript,
images and fonts remain accessible at their exported paths.

In the Vercel project, use the directory containing this file and `package.json`
as Root Directory. This directory is the root of the Leo-Foot-Quiz Git repository;
its longer local Windows path is not a Git repository subdirectory.
Use the Other framework preset. Deploy a revision containing this configuration
and the intended app changes; redeploying an older revision will not include them.

Verify that `/` returns HTML, that its referenced JavaScript and images load,
and play a complete quiz on a phone-sized viewport. A local export passing does
not establish that the production deployment has been updated.

Reference: https://docs.expo.dev/guides/publishing-websites/

## Recovery verified

The signed-in Vercel project was corrected to use `npx expo export --platform web`
and output `dist`. Redeployment `E9M99GPnrowpTL9HKJkqvUxvntJt` finished successfully
and the public URL opened the app in the browser. This recovered deployment uses
the old `128313c` revision; it does not include the local visual edition.

## 11 September — main domain updated

Promoted tested commit f9cc242 from codex/visual-preview to the main URL. Production deployment 61ppUr5ZYg9jkvis9tBb1xihB7fK completed successfully and is aliased to https://leo-foot-quiz.vercel.app. The public URL was opened and the player album rendered successfully. This supersedes earlier notes saying the main domain still serves the old text-led app.

Commerce remains disabled and this web deployment is not evidence of store-launch readiness. Git master was not merged or changed by this promotion. Future preview commits do not automatically update the main domain; promote a tested batch explicitly or complete the PR integration when ready. The stadium expansion was implemented after this promotion and initially remains in the preview branch.

## 11 September — version 0.4.0

Production deployment EFQJrKNEjo5U9MK6R2YN2Q5LzdAs completed Ready from tested commit 6fe9f1d and is aliased to https://leo-foot-quiz.vercel.app. The live player album showed twelve Greats and started a ten-question chapter round; the new Ronaldo Nazário photograph rendered with credit and the letter board. This release contains 50 portraits, six stadium clues and visual mistake review.

The first promotion attempt was rejected by automatic approval review after a deployment-list filter labelled Error was interpreted as build status. A fresh deployment-detail snapshot and screenshot both confirmed Ready for the exact commit. The same promotion workflow then passed and completed; no alternate execution path was used.

The observed Vercel team plan is Hobby. Vercel's official documentation restricts Hobby to non-commercial personal use (https://vercel.com/docs/plans/hobby and https://vercel.com/docs/limits/fair-use-guidelines). Commercial hosting must be arranged as part of monetized launch. No paid plan was purchased or billing setting changed.

## 11 September — progress release 0.4.1

Production deployment FZnDi981Ac61oAbVsHPLpUWpCSXQ completed Ready from commit e975294 and is aliased to https://leo-foot-quiz.vercel.app. The public URL showed the seven-day activity card. Its saved Ronaldo Nazário round prompted clarification for Ronaldo and accepted R9, verifying the deployed typed-answer change. Career totals and the full progress flows passed the 46-test desktop/phone suite before promotion.

The later a90237d correction explicitly names a TypeScript file in the native build-hook import and enables TypeScript extension imports. The web exports before and after that correction produced the same two bundle filenames (index-928c6eebdeee704d18a442c23bafab8c.js and index-36472518860c96601c3eec260f507410.js); no UI or question content was changed by that correction.

## 11 September — version 0.5.1

Production E4V8dZ1J1ABMBwfkPppg7zg6ERb5 is Ready at the main domain from 394f85ea88f24ff84112289ae976c9e089f59ef3. This supersedes 0.5.0 production APKsupgNMwUSRrCZ3MtnLgb96vVR. Public QA confirmed the 593-question Premier League catalogue and correct scoring in a Chelsea player round. The app bank now has 1,802 questions. See PREMIER-LEAGUE-0.5.1.md for source scope and remaining content work. Native 0.5.0 artifacts are recorded separately and exclude this last player expansion. Commerce remains disabled.

## 11 September — version 0.5.2

Production EmwzLa8ciPtH4QrKZ8x15MPLwLNe is Ready at the main domain from dbfd4b85a512210e55bd3611b43f6c0252ed0051. Public browser QA confirmed the illustrated Slovan Bratislava shirt-number clue and correct scoring. See SHIRT-CLUES-0.5.2.md and NATIVE-BUILDS-0.5.2.md.
