# Native validation

Version 0.3.0 validation is being built from commit cb9f3fd. It includes the 1,448-question catalogue, 25-photo gallery, player album chapters, lion emblem, letter board, image framing fixes and ownership lifecycle changes. See NATIVE-BUILDS-0.3.0.md for the latest build handles and status. Older artifacts below are historical.

For the newer visual edition 0.2.0, use the build IDs and evidence in [VISUAL-REDESIGN.md](VISUAL-REDESIGN.md). The 0.1.0 builds below are historical foundation-validation artifacts and do not include the new visual modes.

These are private validation builds with commerce disabled. Record device model, OS, build ID, observed result and evidence for each check. A successful cloud compilation is not a pass for the checks below.

## Build evidence

- [iOS simulator build](https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/e8bc13fe-8cfd-482e-89dc-bf402c748c79): compiled successfully, completed 9 September at 10:10 UTC. Requires a Mac with an iOS simulator; this artifact cannot be installed on an iPhone.
- [Android APK build](https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/8c7589bc-3768-499a-af74-d22280e48d96): compiled successfully on 9 September; build logs confirm successful artifact upload at 10:16 UTC. Available for Android device testing.

Both uploads include the reviewed local changes, including save recovery, fair daily selection, explicit revision choice, Android back handling and the audio permission fix. They precede the documentation-only rules source check. The Git commit shown in EAS alone does not describe these uncommitted changes.

## Device checks

All checks below are pending native execution.

| Scenario | Expected result |
| --- | --- |
| Fresh install, airplane mode before first launch | Free practice starts and shows questions, explanations and results without login or network access. |
| Answer several questions, close process, reopen | Continue your round restores completed answers and position without double-counting results. |
| Background a round, then resume | Progress survives; timer behavior is recorded for review. The current foreground timer is not a competitive synchronized clock. |
| Complete daily, start practice, return to today's daily result | Viewing the result preserves the active practice save. |
| Cross UTC midnight, including while backgrounded | Home offers the new daily set. Existing practice survives. Device-clock behavior is personal practice only, not anti-cheat. |
| Exhaust a small topic/difficulty pool | Revision choice appears; cancelling preserves the previous save; accepting starts the chosen revision round. |
| Android system Back from topic/settings/result/round | App returns home consistently and saved round can resume. Back at home follows system behavior. |
| Turn sound off, restart; play with sound on | Setting persists; no microphone or recording permission prompt appears. Test silent mode and audio interruption behavior. |
| Large text and screen reader | At 200% text size, questions, choices and navigation remain readable and operable. VoiceOver/TalkBack labels and focus order make the answer/result transition understandable. |
| Report question, export reports | Message clearly says local storage; export contains the report. No claim that support received it. |
| Export and reset local progress | Export is readable; reset removes local progress only after the intended confirmation. Record platform share-sheet behavior. |
| Install update over existing app | Progress and settings survive migration. Do not uninstall first; use a second build with the same identifier and signing credentials. |
| Open all three player album chapters offline | World stars has 11 players; Game changers and The greats each have 7. Each round stays in the selected chapter. Photos, letters and credits render without downloading content. |
| Earn a player name, force-close, reopen album | Name remains revealed, chapter progress increases once, and a later wrong answer does not erase it. |
| Answer the longest gallery names with large text | Letter slots, undo, shuffle and submit fit the screen and work with TalkBack/VoiceOver. |
| Open paid pack preview and adult gate | Free preview works, full paid content remains locked, and no real-money transaction is offered in these builds. |

## Separate store acceptance

Purchases need store-connected test builds and configured sandbox products. Validation builds cannot establish purchase readiness while commerce is disabled. Test purchase, cancellation, pending payment, restore after reinstall, refund/revocation, customer-info failure, catalogue failure, offline relaunch and store-account changes. Verify entitlement access without trusting a local flag. Current cross-platform purchase identity is not implemented; do not promise a purchase transfers between Apple and Google accounts.

An iPhone/TestFlight build additionally needs Apple signing and distribution configuration. Complete the encryption declaration and store privacy disclosures against the final dependencies and data flows. Do not infer these attestations from simulator success.

## Public release gates

Independent content approval and the asset inventory remain incomplete. `npm run check:release` intentionally rejects the current development bank. Resolve the two rules-wording findings in `RULES-SOURCE-CHECK.md`, canonical source links, content coverage, operating support and target audience/country decisions before a public release. No native device or store sandbox results have been recorded by this document.
