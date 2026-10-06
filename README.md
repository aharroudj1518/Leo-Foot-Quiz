# Leoqo / Leo Foot Quiz

An Expo 57 football quiz for iOS, Android and the web. Guest play, offline progress, family turns and learning from mistakes remain the foundation. Matchday briefings add short, sourced quizzes about dated football news.

## Run locally

Use **Node 24 LTS** and npm. The uploaded lockfile is preserved; no new runtime dependencies were added.

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
- Original Leoqo launcher/store artwork, signed Android AAB profiles, an internal-draft release workflow and automated phone-sized web captures.

The first briefing is bundled and playable offline. **A continuously operated publishing service is not connected.** [News publishing](docs/news-publishing.md) explains how to connect a reviewed feed. Freshness labels use the edition's original dates; the app never manufactures a new date for old content.

## Validation status

The Matchday build at commit `941f152` passed GitHub CI: TypeScript, **38 Vitest tests**, **39 offline tests**, the Expo web export and **22 browser tests**. The Android release changes add local checks, bringing the offline suite to **47 passing tests**. Check the latest [GitHub Actions results](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions) for the final release commit; local dependency downloads remain blocked by the workspace proxy.

Native Android installation and real Google Play purchase tests are still required. A passing web build is not a signed Android artifact or a published Play listing.

See [the test checklist](docs/TESTING.md). The added GitHub Actions workflow runs the full checks after these files are committed to an accessible repository; check its status in GitHub before relying on a build.

## Commercial direction

The recommended position is a short football-news habit with trustworthy explanations and welcoming family play. [The market review](docs/market-review.md) compares ten products and outlines retention, monetization, distribution and content costs. Keep core daily/news play free. Validate a varied, finite paid pack before introducing subscriptions.

The 160-question bank has recorded independent AI editorial review, bound to its exact SHA-256. The default `production` build keeps commerce disabled. `production-paid` enables an internal purchase-test candidate when the recorded content hash and production RevenueCat public SDK key pass checks. That candidate lets licensed testers validate purchase, cancellation, pending payment and restore before public paid release. The finite 40-question finals pack would benefit from more variety; no subscription is implemented.

See the [Android release runbook](docs/google-play/release-runbook.md), [store copy](docs/google-play/store-listing.md), [Data safety draft](docs/google-play/data-safety-draft.md) and [store graphics](docs/google-play/graphics/README.md). Public release still needs the owner's real support/privacy details, correct audience declarations, device/payment results and Play's applicable testing requirements.

A GitHub push alone does not update an installed app. For phone testing, run `npm ci` then `npm run phone` on a computer and scan the QR code with an Expo Go version supporting SDK 57. Phone and computer must share Wi-Fi. For an installable Android APK, the existing EAS `preview` profile supports `npx eas-cli@latest build --platform android --profile preview` with access to the configured Expo project. No native build or app-store release has been validated yet.
