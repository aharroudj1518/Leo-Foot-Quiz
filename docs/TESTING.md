# Test status and acceptance checklist

Status recorded 5 October 2026. The uploaded source ZIP at commit `128313cf8406ba9bce88b2440ec019093610a814` is the baseline. This records local checks before remote CI.

## Completed here

| Check | Result |
| --- | --- |
| `npm run test:offline` on Node 24 | 39 passing tests; zero failures or skips |
| `npm run content:check` | One valid five-question edition; publication/expiry and provenance schema checked |
| Parse all 21 `.ts` / `.tsx` files with the available Babel TypeScript/JSX parser | Passed; syntax check only, not TypeScript type checking |
| Champion/European Cup source-year checks | All 65 corrected season links match their final year |
| Manual source research | Five news answers checked against linked official evidence; Chelsea used official dated video metadata, not a watched video |

The offline suite exercises daily fairness, save migration/recovery, duplicate submissions, snapshots, streak persistence beyond 100 rounds, hint persistence, feed chronology and archive boundaries, schema errors, source dates, immutable IDs, HTTPS requests, size limits, timeouts and score-sharing dates. Fetch tests use controlled responses, not a deployed content service.

## Still required

The environment proxy prevented npm dependency installation. **TypeScript type checking, Vitest, Expo bundling, browser E2E and native-device testing have not run.** Syntax parsing and core tests do not establish that the full app renders or that real store purchases work.

On a machine with package access:

```sh
npm ci
npm run check
npm run build:web
npx playwright install chromium
npm run test:e2e
```

The browser suite includes the six existing flows and five new Matchday/daily/persistence scenarios, on desktop and phone viewports. The new GitHub Actions workflow runs the same full checks and installs browser OS dependencies. It has not been executed in this workspace.

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
