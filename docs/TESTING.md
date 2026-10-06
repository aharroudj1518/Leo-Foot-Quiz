# Test status and acceptance checklist

Status updated 6 October 2026. The [latest completed repository checks](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37449426923) passed TypeScript type checking, 53 Vitest tests, 95 offline tests, 34 browser tests, the Expo web export and five web phone captures. The original uploaded ZIP is the historical baseline, not the current verification result.

The [v7 native emulator check](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37450537693) passed fresh startup, four reachable answer choices, answer reveal/Next, saved quiz resume after force-stop/relaunch and Settings/Play navigation on both API 32 and API 36. Each test captured five actual screenshots and found zero app runtime/fatal error lines in its collected logs. The test-signed APKs were generated from the exact inspected signed AAB; these results do not prove Google Play installation/signing, physical-phone behavior or billing.

The signed v7 candidate also [passed artifact inspection](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37450178570): target SDK 36, verified signature, correct launcher and billing permission, with unused storage/overlay permissions absent. See the [release runbook](google-play/release-runbook.md) for its exact build ID and upload steps. The [inspection report](google-play/release-evidence/v7/inspection-report.json) and [API 32](google-play/release-evidence/v7/api32/native-smoke-report.json) / [API 36](google-play/release-evidence/v7/api36/native-smoke-report.json) reports retain the evidence beyond CI artifact retention.

## Historical local checks on 5 October

| Check | Result |
| --- | --- |
| `npm run test:offline` on Node 24 | 39 passing tests; zero failures or skips |
| `npm run content:check` | One valid five-question edition; publication/expiry and provenance schema checked |
| Parse all 21 `.ts` / `.tsx` files with the available Babel TypeScript/JSX parser | Passed; syntax check only, not TypeScript type checking |
| Champion/European Cup source-year checks | All 65 corrected season links match their final year |
| Manual source research | Five news answers checked against linked official evidence; Chelsea used official dated video metadata, not a watched video |

The offline suite exercises daily fairness, save migration/recovery, duplicate submissions, snapshots, streak persistence beyond 100 rounds, hint persistence, feed chronology and archive boundaries, schema errors, source dates, immutable IDs, HTTPS requests, size limits, timeouts and score-sharing dates. Fetch tests use controlled responses, not a deployed content service.

## Repeatable checks and remaining device acceptance

The original local proxy prevented dependency installation, so the full checks were subsequently run successfully in GitHub Actions. Native free gameplay was checked on the v7 API 32 and API 36 emulators as described above. Physical-phone acceptance and actual Google Play licence-tester purchases and restoration remain to be completed; browser and emulator results do not establish those outcomes.

On a machine with package access:

```sh
npm ci
npm run check
npm run build:web
npx playwright install chromium
npm run test:e2e
```

The browser suite covers quiz, Matchday, daily play, persistence, navigation and support flows on desktop and phone viewports. GitHub Actions runs the full checks and installs browser OS dependencies. Fetch tests use controlled responses; no automated production news publisher is connected.

## Manual acceptance

1. **Matchday:** open the included briefing, answer all five, inspect explanations/source dates, and use “Review what I learned” to review all five answers, including correct ones.
2. **Resume:** answer one news question, close/reload, resume, and confirm the answer reveal and next-question position survive.
3. **Daily:** begin Daily Five, leave midway, and use its own button to continue. Finish it, start a separate classic round, then view today's result. The separate round must remain saved.
4. **Replacement:** start another topic while a round is unfinished. Verify both “Continue saved round” and “Start the new round” do what they say.
5. **Streak:** complete daily sets on consecutive UTC days. Reopening results must not add completion dates; ordinary practice must not erase the streak.
6. **Hints and sharing:** request a hint, reload, answer correctly and share. That answer should remain yellow/assisted. A past daily result must share its own date. Web uses the share sheet or clipboard when available; a text download is the fallback.
7. **Freshness:** test immediately before publication and at expiry with a controlled clock. Future editions are hidden; expired editions remain clearly marked archive.
8. **Updates:** configure a real test HTTPS feed with CORS. Test a new edition, invalid JSON, changed existing IDs, timeout, offline mode and storage failure. A failed update must preserve previously playable content and any active round.
9. **Accessibility:** use a 320 px screen, larger text, screen reader and keyboard. Check news labels, answer options, source links and all replacement choices without horizontal scrolling.
10. **Store builds:** use Apple/Google sandbox purchases in actual native builds. Exercise successful purchase, cancellation, pending confirmation, restore and a verified owner whose offerings fetch fails. Keep paid release disabled until these checks and content approval pass.

The commercial pilot should separately measure whether users finish, return and share, and whether a paid pack covers editorial and acquisition costs. No analytics SDK or invented commercial metrics were added.
