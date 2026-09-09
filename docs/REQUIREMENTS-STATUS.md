# Plan-to-code review

Update: visual edition 0.2.0 implements player-photo, reimagined-badge and stadium rounds, bringing the development bank to 174 questions. See [the visual redesign](VISUAL-REDESIGN.md) for current build IDs and acceptance. The detailed table below records the earlier foundation review.

9 September 2026. This maps the existing parent `REVIEW-SOLUTIONS.md` requirements to the current app. Passing unit or browser tests are not substitutes for native-device, editorial or purchase-sandbox acceptance.

| Requirement | Evidence and status | Remaining acceptance |
| --- | --- | --- |
| R01 Accurate questions | 160 development questions with URLs/explanations; editorial approval false. Added hash-bound review ledger, distinct reviewer/author and review-deadline validation. Partial. | Verify each fact/source and populate genuine independent reviews. |
| R02 Accepted names | `correctAnswer` uses normalized aliases; unit fixtures pass. Partial. | Full alias/content review and ambiguity handling. |
| R03 Usable hints | Free hints and skip controls exist. Partial. | Review every hint for usefulness and answer leakage; native traversal. |
| R04 Performance/crashes | Typecheck, unit suite, production web export and browser flows pass. Partial. | Physical iOS/Android crash/performance evidence and release telemetry. |
| R05 No blocked progression | Topics independent; no paid/life gate for free rounds. Partial. | Native traversal across every included pool and unavailable-content cases. |
| R06 Progress recovery | Transactional SQLite row updates, validated save hydration, duplicate-submission guards and browser restart tests. Partial. | Native process-kill tests, cloud backup/merge (unimplemented), update migration and device transfer. |
| R07 Intrusive ads | No ad SDK installed; browser free-play network test passes. Implemented for preview. | Native network inspection; reassess if rewarded ads are added. |
| R08 Offline | Bundled bank and native SQLite; local web export. Partial. | Airplane-mode first launch on physical phones; downloadable packs unimplemented. |
| R09 Repetition | Unseen pool prioritized; no padding with repeats. Exhaustion now prompts for revision or another topic; cancelling preserves progress. Browser acceptance passes. Partial. | Larger independently reviewed bank and native acceptance. |
| R10 Difficulty | Three pools and option validation. Partial. | Actual difficulty calibration, plausible distractor review. |
| R11 Language | English keyed UI strings; i18n tests. Partial. | Language review; no other supported language yet. |
| R12 Images/tiles | Current bank is text-only; no player images or tiles shipped. Added register validation for declared image clearance, platform coverage and expiry. Partial. | Actual clearance evidence, fallback rendering, accessible reveal/zoom and UI/store asset inventory before introducing visual packs. |
| R13 Accessibility | Text scaling enabled; narrow layout browser test passes. Partial. | 200% native text, contrast, VoiceOver/TalkBack, focus and touch targets. |
| R14 Clear object | Player/club prompts distinguish expected entity. Partial. | Representative-fan usability testing and complete wording review. |
| R15 Purchases | RevenueCat buy/restore, approval flag, verified entitlement checks; failed catalogue no longer hides ownership. Partial; disabled. | Store sandbox pending/refund/relaunch/offline reconciliation; stable entitlement recovery UX. |
| R16 Regions/leagues | Direct topic access exists. Partial. | Regional/women's coverage tags, editorial targets and league selection. |
| R17 Unlimited practice | No lives or waiting economy in engine. Implemented in current design. | Native 100-wrong-answer acceptance flow and content coverage. |
| R18 Replay | Completed pools replay; daily result view no longer overwrites practice. Partial. | Explicit new-versus-revision UX and paid-pack replay lifecycle. |
| R19 Live fairness | No online live mode. Deferred as planned expansion. | Server receipts, synchronized sets, disconnect/void/load evidence before release of live mode. |
| R20 Support/prizes | No cash-prize flows; reports stored locally and exportable. Partial. | Operational support address, ticket/triage process and visible submission status. |
| R21 Duplicate options | `validateBank` rejects normalized duplicates and multiple correct options; production content hook now invokes it. Implemented for current bank. | Enforce at future remote import boundaries and across future locales. |
| R22 Explanation | Every bundled item has explanation; browser rounds reveal it after answers/skips. Implemented for practice. | Native and editorial checks; competition disclosure rules if introduced. |

## Scope review

Parent PRODUCT-PLAN, ARCHITECTURE, ROADMAP, README and REVIEW-SOLUTIONS describe more than the current app. The mobile entrypoint, app component, UI, English catalog, quiz engine, SQLite/web repositories, billing, content generator, development bank structure, build configuration and test setup have been inspected. Dependency internals were inspected where relevant to permissions/build behavior, not audited exhaustively. Source URLs are not proof that all 160 football facts have independent verification.

The code does not implement accounts, admin publishing, cloud sync, remote reports, asset licensing, online duels or live events. Neither the original time estimates nor competitor feature lists establish those features as complete. Do not represent this preview as satisfying all public-v1 gates.

## Commercial scope

Use [the 20-app comparison](COMPETITORS-2026-09-09.md) and [launch review](LAUNCH-REVIEW-2026-09-09.md) for monetization and rights decisions. Pricing hypotheses are not configured products. No competitor revenue figure was verified, no image rights were acquired, and no commerce flag has been enabled.

## Native build evidence

EAS history returned one finished Android internal preview: `eb1ce9c2-7592-42cb-8c69-a33a9e42579b`, completed 8 September 2026, commit `11fc330076dd9535f328a16f69a35f569d0bbbb8`. It predates this review's changes. No iOS build appeared in the returned history. Local Android SDK/Java commands were unavailable on PATH.

Prepared EAS `validation` profile: Android APK and iOS simulator, commerce disabled. The user explicitly approved the remote upload/build on 9 September 2026. Android validation build 8c7589bc-3768-499a-af74-d22280e48d96 and iOS simulator build e8bc13fe-8cfd-482e-89dc-bf402c748c79 have been created. The iOS simulator build finished successfully at 10:10 UTC on 9 September; Android also finished successfully, with artifact upload confirmed at 10:16 UTC. An iOS simulator build would verify compilation, not signing, purchases or physical-device behavior.

## Current verification handoff

Final local evidence for this review pass: typecheck and 56 unit tests pass; web export and all 18 browser tests pass. Current-source native-platform Hermes bundle exports also pass: iOS 693 modules and Android 691 modules, including the replay UI. Current-source Android APK and iOS simulator binaries compiled successfully on EAS. Native device acceptance remains pending; see NATIVE-ACCEPTANCE.md for build links and checks.

The upload/build approval is resolved. Both validation builds finished successfully. Use the existing artifacts for native acceptance. Launch audience, countries/languages and imagery budget are also pending questions. Device acceptance, store purchase sandboxes and independent editorial review require the corresponding accounts, devices and reviewers. Current code and review artifacts are local and unpushed.
