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
- Corrected 65 Champions League/European Cup season links, hardened save recovery, preserved verified ownership when store offerings fail, and removed unnecessary recording permissions.

The first briefing is bundled and playable offline. **A continuously operated publishing service is not connected.** [News publishing](docs/news-publishing.md) explains how to connect a reviewed feed. Freshness labels use the edition's original dates; the app never manufactures a new date for old content.

## Validation status

Completed in the development workspace: **39 dependency-free tests**, bundled news validation, syntax parsing of all TypeScript/TSX files, and season-link checks. Full TypeScript checking, the Vitest suite, Expo build, browser tests and native purchase tests **have not run**: npm package downloads were blocked by the environment proxy. This is source ready for those checks, not a certified release build.

See [the test checklist](docs/TESTING.md). The added GitHub Actions workflow runs the full checks after these files are committed to an accessible repository; check its status in GitHub before relying on a build.

## Commercial direction

The recommended position is a short football-news habit with trustworthy explanations and welcoming family play. [The market review](docs/market-review.md) compares ten products and outlines retention, monetization, distribution and content costs. Keep core daily/news play free. Validate a varied, finite paid pack before introducing subscriptions.

Commerce remains disabled. Do not change `independentEditorialApproval` or enable `EXPO_PUBLIC_COMMERCE_READY` until the sold content and real native purchase/cancel/restore flows have been reviewed. The existing 40-question paid pack still needs more variety and independent editorial approval.

A GitHub push alone does not update an installed app. For phone testing, run `npm ci` then `npm run phone` on a computer and scan the QR code with an Expo Go version supporting SDK 57. Phone and computer must share Wi-Fi. For an installable Android APK, the existing EAS `preview` profile supports `npx eas-cli@latest build --platform android --profile preview` with access to the configured Expo project. No native build or app-store release has been validated yet.
