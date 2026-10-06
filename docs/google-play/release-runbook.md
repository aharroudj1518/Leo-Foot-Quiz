# Leoqo Android release runbook

This project uses the existing Leoqo accounts. Release candidates are signed Android App Bundles (AABs), submitted to a **draft on Google Play's internal testing track** when submission is requested. A draft must be rolled out to internal testers in Play Console before it can be installed from their opt-in link. Choose the build profile deliberately: `production` keeps purchases off; `production-paid` enables native purchase testing when its content and credential checks pass.

## Existing project identity

| Setting | Repository value |
| --- | --- |
| Android application ID | `com.leoqo.footballquiz` |
| Expo owner | `amoharroudj` |
| Expo project | `leoqo-football-quiz` |
| EAS project ID | `99891114-dac6-4d4c-973c-3a246db2a7b1` |
| Free build profile | `production` |
| Paid test build profile | `production-paid` |
| Submit profile | `play-internal` |
| Submit destination | Internal testing, draft |

Use the existing Android upload key in EAS. Before building an update, compare its upload certificate with the certificate in Play Console's app-signing settings; do not replace the key to solve an authentication error. [Google Play signing guide](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)

The code targets Expo SDK 57, React Native 0.86 and React 19.2.3. Use Node 24 LTS for repository checks. SDK 57 supports Android 7 and later and targets API 36. [Versioned Expo 57 reference](https://docs.expo.dev/versions/v57.0.0/)

## Connect the existing credentials to the runner

Credentials already configured in dashboards are not automatically available to a GitHub Actions job or this development workspace. Reuse the existing setup:

1. In Expo account settings, create a named access token for the account with access to this project if a suitable CI token does not already exist. [Expo access tokens](https://docs.expo.dev/accounts/programmatic-access/)
2. In the GitHub repository, open **Settings → Secrets and variables → Actions** and store that token as the repository secret **`EXPO_TOKEN`**. Do not put it in a workflow input, source file, issue, or chat. [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
3. In the [existing Expo project](https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz), confirm **Credentials → Android → com.leoqo.footballquiz** contains its signing credentials and its Google Service Account key for submission. If present, reuse them. If the service-account key exists only in RevenueCat, it still needs to be configured for EAS Submit. Use Expo's credential dashboard or `eas credentials --platform android`; upload the JSON there, never to this repository. Confirm its Play Console permissions include releases to testing tracks for this app. [EAS Android submission setup](https://docs.expo.dev/submit/android/)

No Google service-account JSON secret is required in GitHub when EAS already manages the submission credential. The repository's submit profile deliberately has no local `serviceAccountKeyPath`.

If non-interactive EAS reports missing signing setup, run the build once from an authenticated local terminal to resolve its prompts. Existing remote credentials should be reused. A CI token authenticates to Expo; it does not replace Android signing credentials or Google Play submission permissions. [Expo CI setup](https://docs.expo.dev/build/building-on-ci/)

## Verify and build

From the exact checkout intended for release:

```sh
npm ci
npm run check
node scripts/check-release.mjs
npm run build:web
```

The default release check validates local identity, signed store/AAB settings, version increments, the internal draft destination and the disabled shop. For the paid candidate also run `node scripts/check-release.mjs --build-profile production-paid --paid`. Static checks do not verify remote credentials, current Play version codes, policy declarations or native behavior.

EAS manages `versionCode` remotely and increments it for production builds. Compare the remote counter with the highest code previously uploaded to Play. If initialization is required, use `eas build:version:set --platform android --profile production` and initialize it with the last uploaded code; the next production build increments it. Do not reset an already correct remote counter. [Expo version management](https://docs.expo.dev/build-reference/app-versions/)

Use **Actions → Android release** (`.github/workflows/android-release.yml`) for repeatable builds. Select `production` for free testing or `production-paid` for native purchase testing; the workflow defaults to the paid candidate. Leave optional submission off for a build-only run. The workflow also supports an explicit `[android-release]` commit-message trigger on `codex/play-release`, which builds the paid candidate and submits an internal draft. Ordinary commits do not invoke that path. Its source commit and completed EAS build ID are recorded in the workflow result. Manual GitHub workflows must exist on the default branch before the **Run workflow** control becomes available; select the intended branch when running. [GitHub manual workflows](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)

Alternatively, after authenticating the EAS CLI locally:

```sh
npx eas-cli@latest build --platform android --profile production --wait
```

Use `--profile production-paid` for the paid candidate after its release checks pass. The workflow checks the Android public SDK key and current RevenueCat product mapping using the production EAS environment before starting a cloud build. The separate **Android payment environment** workflow performs that check without creating a build or making a purchase.

If Google Play requires the first binary upload before a one-time product can be created, use the workflow's explicit **bootstrap** option or an `[android-bootstrap]` commit on `codex/play-release`. This creates the same signed internal candidate while allowing a missing offering/product mapping to be reported as a warning. It still requires a valid Android public SDK key, reviewed content and all normal checks; malformed responses and credential failures are not bypassed. The shop stays unavailable until its real store product is configured. Bootstrap does not establish that billing works or promote a public release. RevenueCat offering changes are fetched at runtime, so adding the intended product after the upload does not by itself require another build.

Check the finished build's source commit, Android application ID, version code and `.aab` artifact in EAS. The `preview` profile produces a directly installable APK and is a separate route; it is not the Play release artifact. [Expo Android submission](https://docs.expo.dev/submit/android/)

## Submit the exact completed build

**Current candidate — 6 October 2026:** source `089b8ed12c397e18aed059b99173088fafa15c52`, [EAS build `9d9d1a37-3fe9-4d41-83a1-8bea6745cd74`](https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/9d9d1a37-3fe9-4d41-83a1-8bea6745cd74), version code **7**. Its [build finished at 10:26:59 UTC](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37447579548/job/112216607394), with submission intentionally skipped. [Inspection passed at 10:30:56 UTC](release-evidence/v7/inspection-report.json): target SDK 36, minimum SDK 24, non-debuggable and one MainActivity launcher. The record stores the exact AAB hash/size and signature. The certificate matches v6; comparison with Play's expected upload certificate is still outstanding.

[Both native runs](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37450537693) passed against that same inspected AAB: [API 32](release-evidence/v7/api32/native-smoke-report.json) completed **10:36:44.216 UTC** and [API 36](release-evidence/v7/api36/native-smoke-report.json) **10:37:33.784 UTC**. Each verified fresh startup, four reachable answer choices, reveal/Next, saved-quiz resume after force-stop/relaunch, Settings/Play navigation and the exact installed v7 launcher. Each supplied five genuine 1080 × 1920 screenshots and 0 captured app runtime/fatal error lines. The APKs used disposable test keys and unchanged app contents; Play installation/signing, physical-phone behavior, licensing and purchase/restore are not established.

The manifest confirms removal of `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` and `SYSTEM_ALERT_WINDOW`; billing remains, with no microphone, location, camera, advertising-ID or Ad Services permissions. Separately, [App checks](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37449426923) passed for helper-integration source `77e31ba3070dd39aa80db3e5f459bde6bb92b055`: 53 Vitest, 95 offline and 34 browser tests, web export and five web captures. The v7 artifact/inspection/emulator evidence is ready for internal-test upload after the certificate and credential steps.

The earlier [v6 submission attempt](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37441864181) failed with **“Google Service Account Keys cannot be set up in --non-interactive mode.”** EAS still lacks the Play submission key and no Play upload was created. This was a submission-credential failure; v7's build-only run did not attempt submission.

For the selected completed artifact, either download its AAB from Expo and upload it to this app's **Internal testing** release screen, keeping the release in draft, or configure the Google Play service-account key directly in EAS using the instructions above and submit its exact build ID. Do not send the key in chat or commit it. A rebuild is unnecessary solely to fix the submission credential; the permission-cleanup build is a separate source change.

When optional submission is selected in the workflow, submit only the build completed by that same run. For a manual submission, replace `BUILD_ID_FROM_THIS_RUN` below with its recorded EAS build ID:

```sh
npx eas-cli@latest submit --platform android --profile play-internal --id BUILD_ID_FROM_THIS_RUN --wait
```

Use the exact ID instead of `--latest`, which could select another person's newer build. A queued build or submission is not a successful result; check the final status. [EAS CLI reference](https://docs.expo.dev/eas/cli/)

Current Expo documentation supports first-time EAS submission after the existing Play app and service-account prerequisites are met. A manual first upload is an alternative, not a universal requirement. Our explicit `releaseStatus: draft` keeps the uploaded candidate in draft for review. For a manual upload, download the finished AAB and create the release under this app's **Internal testing** track. [First-time submission](https://docs.expo.dev/submit/android/)

## Install from Google Play on a phone

In Play Console, open **Leoqo → Test and release → Testing → Internal testing**. Review the draft release, add release notes, resolve any displayed blockers, and roll it out to internal testing. Under **Testers**, select the list containing the phone's Google account, save it, and copy the opt-in link. Open that link using the same account on the Android phone, accept the invitation, then install or update through Google Play. Availability can take time after rollout. [Google internal testing instructions](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)

On that build, exercise Matchday questions and sources, daily completion, interrupted-round resume, saved progress after restarting, hints, score sharing and answer review. See the [acceptance checklist](../TESTING.md). Record the app version, version code, phone model, Android version and reproduction steps with any issue.

## RevenueCat and the shop

The existing app contract is:

| Contract | Required value |
| --- | --- |
| RevenueCat entitlement | `legends` |
| Product in the current offering | `leoqo_legends_lifetime` |
| Android SDK key variable | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` |
| Build commerce switch | `EXPO_PUBLIC_COMMERCE_READY` |
| Content approval field | `src/content/editorial-status.json` → `independentEditorialApproval` |

The production Android public SDK key is validated and a current RevenueCat offering exists, but that offering does not include Android product `leoqo_legends_lifetime`. This does not establish whether the one-time product already exists in Play Console; check the existing product before creating another. No automated news publisher is connected, and the production feed URL is unset.

The `production` profile sets the commerce switch to `false` and supports free play and previews. The `production-paid` profile inherits the same signed AAB configuration and sets it to `true`. Paid builds also require recorded editorial approval; the release checks must pass for the exact content being built. Account setup does not override that check. Record actual editorial review rather than changing an approval field merely to make a build pass.

In Google Play, find or create the one-time product **`leoqo_legends_lifetime`**. Configure an **active Buy purchase option**, with the intended price and available regions, for this permanent unlock. A **Rent** option grants time-limited access and does not match this product. Product availability must also fit the app's distribution regions. [Google one-time products](https://support.google.com/googleplay/android-developer/answer/16430488?hl=en)

Import/add that Play product in RevenueCat as **Non-consumable**, attach it to entitlement **`legends`**, and map it to a package in the current offering. Keep the lifetime unlock non-consumable; do not substitute a subscription. [RevenueCat Google Play product setup](https://www.revenuecat.com/docs/getting-started/entitlements/android-products)

Verify the Google Play service-account credential status and permissions in RevenueCat's app settings. This remains pending: the validated `goog_` public SDK key and an offering response do not prove RevenueCat can validate Play purchases. RevenueCat's Play credentials and EAS's submission credentials serve separate integrations; check each where it is configured. [RevenueCat Play service credentials](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials)

Configure only RevenueCat's **Android public SDK key** in the production EAS environment. A RevenueCat secret REST key (`sk_...`) belongs on a server and must never appear in `EXPO_PUBLIC_*`. [RevenueCat keys](https://www.revenuecat.com/docs/projects/authentication) Values with the `EXPO_PUBLIC_` prefix are embedded in the app and can be read by users, regardless of dashboard visibility settings. [Expo environment variables](https://docs.expo.dev/eas/environment-variables/)

After content approval and a deliberate commerce-enabled candidate, run `node scripts/check-release.mjs --build-profile production-paid --paid` as well as the normal app checks. Validate the existing offering/product/entitlement mapping in RevenueCat and rebuild with the public SDK key. The cloud post-install check validates that the corresponding platform public key is supplied without logging it. These checks do not establish that purchases work.

For native purchase tests, add the testing account to Play Console's **License testing** list as well as the app's internal testers. Internal testers can otherwise be charged for in-app purchases. [Google testing requirements](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en) Test successful purchase, cancellation, pending purchase, restore, restart after ownership, and an offerings outage for an existing owner; confirm sandbox transactions in RevenueCat. [RevenueCat Android sandbox testing](https://www.revenuecat.com/docs/test-and-launch/sandbox/google-play-store)

Production promotion is a later Play Console operation after device testing and accurate store listing, privacy, content-rating, target-audience and data-safety declarations are complete. The internal-draft workflow does not promote the app to the public production track.

## Capture listing screenshot previews

`scripts/capture-store-screenshots.mjs` uses the actual exported web app in Chromium at a 360 × 640 phone viewport and 3× pixel density. It creates five 1080 × 1920 PNGs: home, a Matchday question, its explanation/source, the Daily Five result, and answer review. Run it against an existing local static server after exporting the app and installing Playwright Chromium:

```sh
node scripts/capture-store-screenshots.mjs
```

The default URL is `http://127.0.0.1:8081`; `SCREENSHOT_BASE_URL` can select a different running preview. Output goes to `store-screenshots/`, alongside a manifest with the real capture time and source commit when run in CI. The script completes sample rounds by reading answers from their saved question snapshots and selecting the visible answer buttons. It never replaces the clock, edits stored progress, invents a news edition, or unlocks a paid pack. An expired edition remains an archive on the home screen.

These are **web phone previews**. Separately, the [v7 native run](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37450537693) supplies ten genuine 1080 × 1920 captures: five each from API 32 and API 36 test-signed emulator installs of the inspected AAB. Five [PNG24 listing exports](graphics/native-v7/manifest.json) are ready; their RGB pixels match the original API 36 captures. Neither set provides Play purchase-flow, physical-phone or listing-approval evidence.
