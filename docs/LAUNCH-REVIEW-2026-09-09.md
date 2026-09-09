# Launch review — 9 September 2026

Status: initial audit and first fixes; not release approval. Local repository origin matches the supplied GitHub repository. After retrying network access, remote HEAD and local HEAD both matched `128313cf8406ba9bce88b2440ec019093610a814`; current edits are local and unpushed.

## Commercial direction

Keep the shared Expo/React Native iOS and Android app. Differentiate through short daily challenges, career clues, accurate explanations, forgiving answer matching, reliable offline progress and friendly competition. A large question count alone is not a defensible advantage.

Use a free core with optional paid themed packs as the first commercial experiment. Suggested UK price hypotheses: £2.99 for a substantial themed pack, £6.99 for a multi-pack starter bundle. These are proposals, not configured prices or validated willingness to pay. The existing 40-question Legends pack needs a value test before charging. Store-localized prices must remain authoritative.

Next, evaluate optional rewarded ads for an extra clue or cosmetic reward while retaining free basic hints and skips. Avoid forced ads during questions and any paid competitive advantage. An ad-free purchase only makes sense after ads exist. Defer a subscription until recurring fresh content, retention and production capacity justify it; do not sell a recurring fee for a static bank.

The current audience copy explicitly includes children aged 10. Resolve target audience, countries and age-appropriate advertising/consent design before adding an ad SDK. The current adult arithmetic step is not evidence of age verification or store compliance.

Measure first-round completion, second-round starts, D1/D7 retention, pack preview-to-purchase conversion, revenue per active user, refunds and content-production cost. Establish a privacy-reviewed measurement implementation before collecting production events. Monetization experiments should preserve retention and free-round completion.

Illustration only: 10,000 monthly active users × 2% monthly pack buyers × £2.99 = £598 gross customer spend. Separately, 1,000 daily active users × 0.5 delivered rewarded impressions/day × 30 days × £5 eCPM / 1,000 = £75 estimated ad revenue. All inputs are assumptions; neither is a forecast. Store fees, taxes, refunds, acquisition, content and operations still affect profitability. Track cohort lifetime value against acquisition cost before scaling paid acquisition.

## Competitor evidence checked this session

Public listings do not disclose app revenue. Downloads, ratings, product prices and chart position cannot establish the highest earner. Obtain comparable country/platform/time-window estimates or publisher financial evidence before ranking revenue. Estimates may exclude advertising income.

| Competitor | Verified observation | Decision |
| --- | --- | --- |
| PrizePool, Football Quiz! Ultimate Trivia | 5M+ Google Play installs; ads and IAP; hints, coins, offline play and daily rewards. Visible reviews include complaints about ads. | Highest-scale verified benchmark in this initial pass; imitate content breadth and return reasons, test ad tolerance. |
| BOLD CAT, Football Quiz - Soccer Trivia | Listing retrieved; detailed monetization extraction still pending. | Keep in next comparison pass; do not infer earnings. |
| Javier Fernandez, Guess the Football Team 2026 | UK listing offers Retro Football at £4.99 and £2.99; nationality-lineup format and premium historical content. 1M+ downloads appears in developer description, not an Apple-certified download counter. | Evidence for themed paid content and a visual format that does not require portraits. Product duration must be verified separately. |
| ARE Apps, Who's the Player? | Listing retrieved; detailed product extraction pending. | Review hint products and friction next. |

Sources, accessed 9 September 2026:
- https://play.google.com/store/apps/details?id=com.football.quiz.trivia
- https://play.google.com/store/apps/details?id=com.boldcat.football
- https://apps.apple.com/gb/app/guess-the-football-team-2026/id1660188840
- https://apps.apple.com/gb/app/whos-the-player-football-quiz/id659336346

The original research covers 11 video-linked apps. The [20-app comparison](COMPETITORS-2026-09-09.md) now addresses every requested identity: 17 have a retrieved storefront; three remain explicit retrieval gaps. Revenue remains unverified for all.

## Artwork and rights

Inspected `Assets - Examples/Cartoon.png`: a competitor screenshot with recognizable player portraits, club crests and a league mark. It is inspiration, not a reusable asset or licensing evidence. Commissioning or generating cartoons does not automatically clear player likeness rights, underlying reference-photo copyright, club marks or endorsement issues. Applicable rights depend on the intended countries and use.

First release: original text and career clues, original generic pitch/shirt/trophy artwork, nationality and position diagrams. Avoid identifiable portraits and official badges pending clearance. If portraits are essential, obtain commercial illustration rights and assess player likeness and reference-image rights separately. A disclaimer alone is not clearance.

For each future image, record asset ID, creator, source, license/evidence, permitted territories/platforms/commercial uses, reference-photo rights, likeness/mark assessment, attribution, expiry, reviewer and text fallback. Unapproved/expired imagery must fail publication or use the text fallback. Current question schema has no asset support, so implement this gate before visual packs.

Sources:
- https://www.gov.uk/government/publications/copyright-notice-digital-images-photographs-and-the-internet/copyright-notice-digital-images-photographs-and-the-internet
- https://www.wipo.int/en/web/ipday/2019/understanding_sports_image_rights
- https://www.wipo.int/en/web/sports/branding

## Observed implementation and gaps

| Area | Actual status / next work |
| --- | --- |
| Platform | Expo 57, React Native 0.86, iOS/Android identifiers and EAS profiles exist. Signed builds and physical-device acceptance not verified. |
| Content | 160 development questions; independentEditorialApproval=false. Existing 1,000-question launch target remains unmet. Source URLs alone are not editorial verification. |
| Core | Multiple choice, player typed answers, hints/skips, daily and local family play, saved progress and mistake review exist. |
| Save recovery | Native SQLite and web localStorage. Added nested history/session validation, including answer order and completion invariants. Invalid profile history enters export/recovery rather than crashing after load. Fixed SQLite open failures caching a rejected promise and preventing in-process retry. |
| Daily | Fixed purchased content changing the shared daily set and viewing a completed daily result overwriting unfinished practice. Date rollover/background timing still needs further testing. |
| Billing | RevenueCat integration and restore exist, commerce disabled. Entitlements live in UI state. Fixed offer-fetch failure hiding an existing verified entitlement. Audit offline access, relaunch reconciliation, refund and pending flows before enabling commerce. |
| Privacy | No free-play advertising/analytics SDK initialization seen. Reports remain local and have no operational triage destination. Audience says ages 10+, which needs explicit release treatment. |
| Native configuration | Removed unnecessary microphone and background-audio capabilities. Generated Expo config verified; native store binaries not built in this pass. |
| Backend | No implemented accounts, cloud recovery, editorial publishing service or online competition observed in the current app. These remain planned. |
| Plan accuracy | Corrected parent README, architecture and roadmap to reflect the implemented app and remaining target architecture. Those parent files are outside the mobile Git repository. |

## First changes and evidence

- `app.json`: audio plugin explicitly disables microphone recording and background recording/playback; removes explicit Android microphone/foreground-service permissions.
- `src/core/quiz.ts`: daily sessions exclude premium questions regardless of purchase status.
- `tests/daily-fairness.test.ts`: checks daily equality across 31 seeds and preserved paid practice access.
- `src/services/storage.ts`: retry database initialization after transient failure without resetting progress.
- `src/services/billing.ts`: preserve verified ownership when catalogue retrieval fails.
- `npm run check`: TypeScript passed and all 39 tests passed, up from the 33-test baseline. Added database retry/concurrency and billing outage regression coverage. `git diff --check` passed.
- `expo config --type introspect`: no iOS microphone description/background audio mode; no generated Android microphone or audio foreground-service permission. This is configuration evidence, not a merged release-APK inspection.

Second pass: TypeScript and 50 unit tests pass. Production web export succeeded. Added a browser regression for viewing a completed daily without replacing an active practice save. All 14 browser cases passed (desktop and phone-sized Chromium), and the runner exited successfully. Its temporary Python server required manual shutdown during Windows cleanup; replace that fixture server before relying on unattended CI. Browser emulation is not native iOS/Android acceptance.

## Further source-review findings

- `App.tsx`: large component combines navigation, timing, persistence and commerce. No native Android back handling; timer uses foreground interval ticks and resets when resumed. Daily date is computed during render and needs explicit midnight/foreground refresh. These need native lifecycle tests and focused follow-up changes.
- `src/ui.tsx`: system text scaling remains enabled, but several compact fixed-width controls and small labels need 200% scaling and screen-reader verification. Existing browser narrow-screen test is useful but insufficient for native accessibility.
- `src/i18n.ts`: English keyed strings exist; other languages and native language review do not. Do not list additional store languages yet.
- `scripts/build-content.py` and `src/content`: generator makes 160 development questions and resets editorial approval. Many questions use repetitive winner/year templates, and historical source links are constructed rather than independently checked. Difficulty assignments are editorial heuristics, not calibrated measurements. Current Legends offer is 40 European finals rather than broad legendary-player content.
- `src/services/billing.ts`: no cross-platform identity or refund listener in the app; ownership is queried through adult shop entry. A failed customer-info request is distinct from the now-fixed failed catalogue request and still needs reconciliation UX.
- `e2e/app.spec.ts`: validates web saves, settings, gated purchase preview and no remote free-play requests, with two Chromium viewport profiles. It does not test StoreKit, Play Billing, native SQLite, VoiceOver or TalkBack.
- EAS profiles, identifiers, SDK package versions and entrypoint exist. Signed native artifacts, store metadata and support/privacy operations require verification before release.

## Next implementation sequence

Fifth-pass evidence: explicit exhausted-topic revision choice implemented; cancelling does not replace saved progress. Typecheck, 56 unit tests, web export and all 18 browser tests pass. Review and initial readiness changes are complete for this local pass; the user approved remote builds on 9 September and current-source Android APK and iOS simulator compilation have both succeeded. Device and purchase acceptance remain pending. No production-readiness claim is made.

Fourth-pass evidence: added `check:release`, a per-question content-hash/reviewer/date ledger and declared-image clearance register. Production EAS invokes the check after install; build profiles pin Node 22.20.0 for native TypeScript loading. The current bank correctly fails with 161 missing-approval findings. Development hook passes, typecheck passes and all 56 unit tests pass. This does not fabricate editorial or legal sign-off. See [content release workflow](CONTENT-RELEASE.md).

Third-pass evidence: local Hermes bundle exports succeeded for Android (690 modules) and iOS (693 modules) in `.expo/native-validation`. These are JavaScript/native-platform bundle checks, not native binary compilation. Typecheck and 50 unit tests pass; 16 browser tests pass with automatic fixture-server cleanup in 12.6 seconds. Daily rollover and Android back navigation were implemented; the midnight browser regression passes. Native back behavior still needs device acceptance. See [the 22-requirement status review](REQUIREMENTS-STATUS.md) for the full plan mapping and current remote-build evidence.

1. Finish source/test review, fix save hydration/retry and billing reconciliation issues with focused regression tests.
2. Reconcile parent plans and complete the 20-app monetization comparison with explicit unavailable revenue data.
3. Add content and asset publication validation; independently review the initial bank and decide beta versus public content requirements.
4. Test signed iOS/Android builds: offline first run, process kill, update migration, Android back, audio, large text, VoiceOver/TalkBack and purchase sandboxes.
5. Configure final store products and operating support, privacy URLs and disclosures; enable commerce only after the content and purchase gates pass.
6. Add reviewed content and validate retention before expanding to ads, accounts and asynchronous friend duels.

No release, revenue ranking, legal clearance or full-code audit is claimed by this initial report.
