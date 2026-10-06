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
- Verified all 160 core questions against primary sources, improved 77 source links and corrected misleading clues. Hardened save recovery, preserved verified ownership when store offerings fail, and removed unnecessary recording permissions.
- Original Leoqo launcher/store artwork, Android App Bundle build profiles, an internal-draft release workflow and automated phone-sized web captures.

The first briefing is bundled and playable offline. **A continuously operated publishing service is not connected.** [News publishing](docs/news-publishing.md) explains how to connect a reviewed feed. Freshness labels use the edition's original dates; the app never manufactures a new date for old content.

## Validation status

As of **6 October 2026 at 09:28 UTC**, [GitHub CI run 37443001397](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37443001397) passed TypeScript, **53 Vitest tests**, **58 offline tests**, the Expo web export, **34 browser tests** and all **five phone-sized web captures**. These counts describe that run; check later [GitHub Actions results](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions) for subsequent changes.

The [public-page check](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37442034644) verified the [privacy policy](https://leo-foot-quiz.vercel.app/privacy.html), [support page](https://leo-foot-quiz.vercel.app/support.html) and their stylesheet at **09:18 UTC on 6 October 2026**: all returned HTTP 200 without login, with the expected MIME types and content matching the repository files.

EAS build [`5f7931d6-c2a6-4a73-9397-12899c5d23a4`](https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/5f7931d6-c2a6-4a73-9397-12899c5d23a4) **FINISHED at 09:32:24 UTC on 6 October 2026**, producing the signed Android App Bundle from source `faeb0a4e6328d11166478dc34ad7c09650daa58c`, version code **6**. The [GitHub release workflow](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37441864181) failed only at submission: Expo has no Google Play service-account key configured, and **no Play upload was created**. Download the finished AAB from Expo for manual internal-track upload, or configure the key directly in EAS and submit this exact existing build; a rebuild is not needed for that credential issue. See the [release runbook](docs/google-play/release-runbook.md#submit-the-exact-completed-build).

Native artifact inspection and emulator/phone smoke checks do not yet have results. Native installation, licence-tester billing and real Google Play purchase/restore checks remain. See [the test checklist](docs/TESTING.md).

## Commercial direction

The recommended position is a short football-news habit with trustworthy explanations and welcoming family play. [The market review](docs/market-review.md) compares ten products and outlines retention, monetization, distribution and content costs. Keep core daily/news play free. Validate a varied, finite paid pack before introducing subscriptions.

The 160-question bank has recorded independent AI editorial review, bound to its exact SHA-256. The default `production` build keeps commerce disabled. `production-paid` supports native purchase testing. The production Android RevenueCat public SDK key has been validated, and a current offering exists, but it does not yet include Android product `leoqo_legends_lifetime`. Complete that mapping and licence-tester purchase, cancellation, pending-payment and restore checks before public paid release. The finite 40-question finals pack would benefit from more variety; no subscription is implemented.

See the [Android release runbook](docs/google-play/release-runbook.md), [store copy](docs/google-play/store-listing.md), [Data safety draft](docs/google-play/data-safety-draft.md) and [store graphics](docs/google-play/graphics/README.md). Support and privacy contact is **info@novaspheretechnology.co.uk**. Public release still needs the responsible legal/developer identity confirmed, accurate declarations for the intended family audience aged 10+, the Families/SDK review, device/payment results and Play's applicable testing requirements.

A GitHub push alone does not update an installed app. For phone testing, run `npm ci` then `npm run phone` on a computer and scan the QR code with an Expo Go version supporting SDK 57. Phone and computer must share Wi-Fi. For an installable Android APK, the existing EAS `preview` profile supports `npx eas-cli@latest build --platform android --profile preview` with access to the configured Expo project. The store-build workflow above remains separate from this preview; a public app-store release has not been validated.
