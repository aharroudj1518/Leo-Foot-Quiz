# Finish and monetize Leoqo

Objective: finish and monetize the Android/iOS app. This remains active; a preview APK, passing tests, or a configured shop alone does not satisfy it.

## Evidence checked 11 September 2026

- Android 0.5.6 / versionCode 2 finished on EAS, build `e968e741-b60a-4069-8f39-0c36964c09d0`. The downloadable APK includes Cormorant, the triadic palette and 36 lineup puzzles. It predates the purchase-recovery changes below.
- Current content metadata counts 2,455 questions. The existing paid Legends pack contains 40 European Cup/Champions League winner questions. Store product/price availability is unverified.
- `npm run check:release` reports 2,658 issues. Independent question review and declared-asset clearance remain incomplete. Do not bypass this gate or invent reviewer records.
- TypeScript and 116 unit tests pass after durable purchase recovery was added. This is mocked SDK evidence, not a real store purchase test.
- Owner authorization covers continuing session work without routine approvals. Missing account access and factual evidence still need to be obtained, not inferred from authorization.

## Work completed in this goal pass

Checkout intent is saved before invoking the native store. An uncertain checkout reopens in restore-required state; a known approval-pending payment remains pending across restarts and empty restores. A confirmed store entitlement clears recovery. Storage read/write failures prevent a new checkout, and a recovery marker never grants paid access. Recovery lives outside quiz progress so a profile reset/export cannot erase or manufacture ownership.

## Remaining delivery requirements

| Requirement | Evidence still needed / next action |
| --- | --- |
| Functional Android and iOS release | Exercise the native acceptance journeys on physical devices, including fonts/offline first launch, process death, update install, large text and screen readers. Build final native artifacts after fixes. |
| Real paid pack | Confirm owner access to Google Play Console, RevenueCat and App Store Connect. Configure `leoqo_legends_lifetime`, `legends` entitlement, current offering and platform public SDK keys. Validate price and actual product contents. |
| Reliable payment lifecycle | Real sandbox purchase, cancellation, approval-pending, process death, offline recovery, restore/reinstall, refund and store-account-switch checks. Durable recovery code does not replace these checks. |
| Content users can pay for | Review facts, hints, aliases and difficulty; assess the value of 40 repeated winner-format questions; improve the pack where needed. Record genuine independent review of final content hashes. Preserve the broader planned content/coverage targets. |
| Asset readiness | Complete the existing portrait/mark assessments and inventory UI artwork, fonts, flags, sound and store screenshots. The lineup source and UI assets must also be covered, not just declared question images. |
| Support and privacy operations | Establish the actual support destination, public privacy/support pages and report triage. Verify disclosures against the shipped integrations and selected audience/countries. |
| Planned app completion | Reconcile implemented journeys against PRODUCT-PLAN, ROADMAP and REVIEW-SOLUTIONS. Accounts, backup/sync, publishing/report services and planned feature phases must remain visible until delivered or explicitly reprioritized by the owner. |
| Store launch and revenue | Submit compliant final builds/listings once evidence is ready; verify product activation and purchase delivery. Configure actual measurement before claiming monetization results. No revenue is currently verified. |

Next: obtain store-account readiness while continuing content/asset review and remaining implementation. The account question is pending; no passwords or secret keys were requested.

## Update — 12 September 2026

- Google Play personal-account registration has started with developer name Amo Harroudj and the owner-selected UK payments profile. The selected public email is verified through the Google Account. The developer account is now created. Google Play Console confirms identity documents were uploaded and are under review. Create app and phone verification are disabled until identity approval; registration payment details were not inspected.
- Fixed Legends sessions so an owner can play all 40 questions at any selected practice difficulty. Ordinary practice still respects difficulty; ownership and the three-question preview remain enforced.
- Checkout now validates the exact lifetime product and rejects subscription or consumable listings before invoking a purchase. Store ownership remains independent of catalogue availability.
- TypeScript and all 130 unit tests passed, including pack traversal/access and mismatched product configuration tests. These tests use a mocked billing SDK and do not establish store readiness.
- The downloadable 0.5.6 APK predates these fixes and durable purchase recovery. A final replacement native build and real-device/store validation remain required.


