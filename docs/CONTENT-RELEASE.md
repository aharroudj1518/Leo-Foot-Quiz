# Content and image release workflow

`npm run check:release` checks the question bank, editorial approval, a per-question review ledger and declared image clearance. The production EAS profile invokes it through `eas-build-post-install`; other existing profiles remain development/validation builds. Run this command explicitly for any other public distribution path. This is a content check, not complete store release approval.

The current result is intentionally failing: none of the 174 questions has independent sign-off. Do not fill the ledger with invented reviewers or approvals to make it pass.

## Question review

1. An editor verifies the exact cited source, factual scope/date, original wording, accepted aliases, options, explanation, difficulty and hint. Fix vague or broken links.
2. A different reviewer confirms that exact final question. Record the real author and reviewer identities, `status: approved`, `verifiedAt` and `reviewBy` in `src/content/review-ledger.json`, under `questions[questionId]`.
3. Record `contentSha256` from the exported `contentHash(question)` function in `scripts/release-content.mjs`. It uses canonical JSON and SHA-256; editing a reviewed question requires a new review hash. Never regenerate hashes automatically for already-approved records.
4. Set the bank-level `independentEditorialApproval` flag only after actual editorial completion. Keep the question count accurate.
5. Run `npm run check:release`. Resolve all issues before using the production profile. Re-check before each public release; review dates can expire without code changes.

The original roadmap's 1,000-question target and regional/women's coverage goals remain separate editorial acceptance requirements. This validator does not claim to enforce factual truth, legal permission, coverage or content quantity by itself.

## Images

Version 0.2.0 adds 14 visual questions to the original 160 text questions. Every visual question declares an asset ID; the current assets remain marked review-required. See VISUAL-REDESIGN.md and the in-app credits for provenance. `Assets - Examples/Cartoon.png` is a competitor screenshot, not a cleared asset. Do not import or trace its players, badges or league marks into the app.

For future visual questions, declare `assetIds` on each question and register those IDs in `src/content/asset-register.json`. Required fields are `id`, `status`, `creator`, `reviewer`, `licenseEvidence`, `territories`, `commercialUse`, `platforms` (both `ios` and `android`), `likenessAndMarksAssessment`, `referenceImageAssessment` and `expiresAt`. These must describe actual evidence; a filled string is not legal clearance. Match territories against the selected launch countries during the release review. Recheck perpetual licenses periodically by choosing a review date for `expiresAt`.

Original generic shirts, pitch diagrams, flags/position clues and fictional mascots can support the visual style without copying a footballer's portrait. Commissioned cartoons of identifiable players still need a jurisdiction-appropriate likeness/mark assessment and suitable rights in reference imagery. Keep a complete text-clue alternative.

The register currently covers declared question images only. App icons, UI artwork, sound and store screenshots also require an asset inventory before launch. Future image rendering/import must use this register; the checker cannot detect undeclared imagery hidden in arbitrary UI code.

## Technical requirements

Use Node 22.18+ for the script's native TypeScript loading (local verification used Node 22.20). No secrets or remote requests are involved. `tests/release-content.test.mjs` covers changed content, self-review, invalid/expired dates, missing images and platform/commercial clearance. Existing game-bank tests validate options and answer shape.

Expo hook reference: https://docs.expo.dev/build-reference/npm-hooks/
