# Leoqo / Leo Foot Quiz

An Expo 57 football quiz for iOS, Android and the web. Guest play, offline progress, family turns and learning from mistakes remain the foundation. Matchday briefings add short, sourced quizzes about dated football news.

## Run locally

Use **Node 24 LTS** and npm with the committed lockfile. Expo package versions were aligned with SDK 57; no new runtime dependencies were added.

```sh
npm ci
npm run check
npm run web
```

For a phone preview on the same network, use `npm run phone` with a compatible Expo Go version. Store purchases require a native development/store build; they do not work in the browser or Expo Go.

## What changed

- A prominent Matchday briefing with five questions on football stories from 2–4 October 2026. The included edition is dated 5 October and becomes an archive on 12 October. Sources and their original publication/update dates appear after answering.
- A briefing library, optional validated HTTPS editorial feed, local cache, and saved question snapshots. A feed update cannot change an already-started round.
- The same free Daily Five across entitlements, difficulties and topic choices; resumable daily play; a durable UTC streak; safe viewing of a completed daily result while another round remains saved.
- A deliberate choice before replacing an unfinished round, full answer review, and spoiler-free score sharing with persisted hint attribution.
- Verified all 160 core questions against primary sources, improved 77 source links and corrected misleading clues. Hardened save recovery, preserved verified ownership when store offerings fail, and tightened Android permission configuration.
- Original Leoqo launcher/store artwork, Android App Bundle build profiles, an internal-draft release workflow and automated phone-sized web captures.

The first briefing is bundled and playable offline. **A continuously operated publishing service is not connected.** [News publishing](docs/news-publishing.md) explains how to connect a reviewed feed. Freshness labels use the edition's original dates; the app never manufactures a new date for old content.

## Validation status

The [App checks run](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37449426923) succeeded for source `77e31ba3070dd39aa80db3e5f459bde6bb92b055`: TypeScript, **53 Vitest tests**, **95 offline tests**, the Expo web export, **34 browser tests** and **five phone-sized web captures**. This verifies the current helper integration; the separately built signed Android candidate below comes from source `089b8ed`.

The [public-page check](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37442034644) verified the [privacy policy](https://leo-foot-quiz.vercel.app/privacy.html), [support page](https://leo-foot-quiz.vercel.app/support.html) and their stylesheet at **09:18 UTC on 6 October 2026**: all returned HTTP 200 without login, with the expected MIME types and content matching the repository files.

The current Android candidate is **version code 7**, source `089b8ed12c397e18aed059b99173088fafa15c52`, EAS build [`9d9d1a37-3fe9-4d41-83a1-8bea6745cd74`](https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/9d9d1a37-3fe9-4d41-83a1-8bea6745cd74). It finished at **10:26:59 UTC on 6 October 2026**, with submission intentionally skipped. [Signed-bundle inspection](docs/google-play/release-evidence/v7/inspection-report.json) passed at **10:30:56 UTC**: target SDK 36, minimum SDK 24, non-debuggable, one launcher and the permission cleanup confirmed.

[Native v7 checks](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37450537693) passed on **API 32 and API 36**. Each verified a fresh launch, four reachable answers, answer reveal/Next, quiz persistence through force-stop/relaunch, Settings/Play navigation, the installed version code and launcher. Each recorded **five genuine 1080 × 1920 screenshots** and **0 captured app runtime/fatal error lines**. The permanent [API 32](docs/google-play/release-evidence/v7/api32/native-smoke-report.json) and [API 36](docs/google-play/release-evidence/v7/api36/native-smoke-report.json) reports bind these results to the inspected AAB. Both APKs used disposable test keys and unchanged app contents; this does not prove Play installation/signing, physical-phone behavior or billing.

The artifact and emulator evidence are ready for the next step: **internal-test upload**. Compare the certificate with Play's expected upload certificate and either configure EAS's submission key or upload the AAB manually. The earlier [v6 submission attempt](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37441864181) failed for that missing key; no Play upload was created. V7 submission was not attempted. Physical-phone and licence-tester billing checks remain. See the [release runbook](docs/google-play/release-runbook.md#submit-the-exact-completed-build) and [test checklist](docs/TESTING.md).

## Commercial direction

The recommended position is a short football-news habit with trustworthy explanations and welcoming family play. [The market review](docs/market-review.md) compares ten products and outlines retention, monetization, distribution and content costs. Keep core daily/news play free. Validate a varied, finite paid pack before introducing subscriptions.

The 160-question bank has recorded independent AI editorial review, bound to its exact SHA-256. The default `production` build keeps commerce disabled. `production-paid` supports native purchase testing. The production Android RevenueCat public SDK key is validated, but the current offering lacks Android product `leoqo_legends_lifetime`. Check the existing Play product, activate a **Buy** purchase option with price/regions, complete its RevenueCat mapping, and verify RevenueCat's Play service credentials; the public key does not prove those credentials work. Licence-tester purchase, cancellation, pending-payment and restore tests remain. The finite 40-question finals pack would benefit from more variety; no subscription is implemented.

See the [Android release runbook](docs/google-play/release-runbook.md), [store copy](docs/google-play/store-listing.md), [Data safety draft](docs/google-play/data-safety-draft.md) and [store graphics](docs/google-play/graphics/README.md). Support and privacy contact is **info@novaspheretechnology.co.uk**. Public release still needs the responsible legal/developer identity confirmed, accurate declarations for the intended family audience aged 10+, the Families/SDK review, device/payment results and Play's applicable testing requirements.

A GitHub push alone does not update an installed app. For phone testing, run `npm ci` then `npm run phone` on a computer and scan the QR code with an Expo Go version supporting SDK 57. Phone and computer must share Wi-Fi. For an installable Android APK, the existing EAS `preview` profile supports `npx eas-cli@latest build --platform android --profile preview` with access to the configured Expo project. The store-build workflow above remains separate from this preview; a public app-store release has not been validated.
