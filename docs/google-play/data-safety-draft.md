# Google Play Data safety and privacy draft

Prepared and primary sources checked **6 October 2026 (Europe/London)** against the current repository. This is a developer working draft, not a submitted declaration or a published privacy policy. Confirm the exact release binary, build environment, provider settings and all relevant active versions before making Console selections.

The current candidate is **v7**, source `089b8ed12c397e18aed059b99173088fafa15c52`, EAS build `9d9d1a37-3fe9-4d41-83a1-8bea6745cd74`, finished at **10:26:59 UTC on 6 October 2026** and inspected at 10:30:56 UTC. [Native verification](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37450537693) passed on API 32 and API 36: fresh startup, four reachable answers, reveal/Next, quiz persistence after force-stop/relaunch, Settings/Play navigation and the exact installed v7 launcher. Each API produced five genuine 1080 × 1920 captures and 0 captured app runtime/fatal error lines. The permanent [API 32](release-evidence/v7/api32/native-smoke-report.json) and [API 36](release-evidence/v7/api36/native-smoke-report.json) reports identify the same inspected AAB. Both APKs were signed with disposable test keys without changing app contents. Play installation/signing, physical-phone behavior, purchase/restore, traffic collection and remote deletion remain unverified.

V7 intentionally skipped submission. The earlier v6 attempt failed because EAS lacks the Play submission key; no upload exists. Compare the expected Play upload certificate and complete upload setup. Separately, [App checks](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37449426923) passed for helper-integration source `77e31ba3070dd39aa80db3e5f459bde6bb92b055`: 53 Vitest, 95 offline and 34 browser tests plus web export/five web captures. Capture release traffic before finalizing these declarations; the emulator smoke test does not establish collection behavior.

The [v7 manifest record](release-evidence/v7/inspection-report.json) confirms target SDK 36, minimum SDK 24, a non-debuggable app and one MainActivity launcher. `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` and `SYSTEM_ALERT_WINDOW` are absent. Billing remains; microphone, location, camera, advertising-ID and Ad Services permissions are absent. These manifest facts do not establish the absence of off-device SDK processing.

## What the app actually does

| Flow | Repository evidence | Destination |
| --- | --- | --- |
| Guest play | No Leoqo account creation or login; no name, email, date of birth or location prompt. | On device. |
| Progress | Answers, history, mistakes, streak dates, unfinished session, settings and question reports are serialized by `src/services/storage.ts`. Typed player answers can be retained with the round. | Android SQLite database `leoqo.db`, profile key `leoqo.profile.v1`. No progress server is implemented. |
| News content | Bundled JSON plus optional downloaded editions cached under `leoqo.news.v1`. | On device unless an adult chooses the optional refresh. |
| Question reports | The reason, question ID and timestamp are stored locally; reporting does not upload them. | Local until the user chooses export/share. |
| Export and score sharing | Normal export/share controls use the adult step. The fatal-recovery export is available without that step so local progress can be recovered. Both require a user action; no automatic recipient or upload endpoint is configured. | Destination chosen by the user through device/browser sharing or download; audit any later support workflow separately. |
| Sources | External reference URLs open in the browser after the adult step. | Independent source website, with its own privacy practices. No embedded news webview is implemented. |
| Ads / app analytics | No advertising or standalone app-analytics SDK integration appears in the current dependencies/code. | Verify native release traffic and transitive dependencies before making a zero-collection claim. |
| Billing | `src/services/billing.ts` dynamically configures RevenueCat only after an adult shop action and only when both commerce and editorial switches allow it. | RevenueCat and Google Play when enabled. The free `production` candidate blocks SDK configuration through this path; `production-paid` permits it when its checks pass. |
| Purchase support | After billing is already configured, the native shop/privacy UI reads the existing RevenueCat app-user ID. It can be selected/shared; shop/privacy email drafts may prefill it. No purchase is necessary. | Displayed on device; sent to support only when the user sends a message or chooses a sharing destination. Web/Expo Go and disabled shops have no Support ID. |
| Website hosting | The intended web app and public support/privacy site use Vercel. Static requests expose IP address and ordinary request/browser metadata; Vercel may derive approximate location. | Vercel; this is website-host processing, not a quiz-progress upload. Project logging and provider retention need verification. |
| Voluntary support | The app and published support page link to `info@novaspheretechnology.co.uk`. Reports are not sent automatically. | A user-sent email supplies the sender address, message, optional Support ID and attachments to the support mailbox. Assess the chosen support process separately from automatic app collection. |

SQLite storage is not an encryption-at-rest guarantee. Review Android backup/restore configuration in the final manifest: local application storage may participate in platform-managed backups. The app does not implement cloud progress sync.

Google defines collection around off-device transmission, including SDKs; local-only processing is outside that definition. Transfers to qualifying service providers and expected user-initiated sharing have specific sharing exceptions, which do not erase collection obligations. Pseudonymous identifiers still need assessment. The form is required for closed/open/production distribution; exclusively internal testing is exempt. [Google Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)

## Scenario A: current free candidate, optional news endpoint unset

Conditions: `EXPO_PUBLIC_COMMERCE_READY=false`, `EXPO_PUBLIC_NEWS_FEED_URL` unset, and no additional production services introduced. Editorial approval alone does not configure billing; the commerce switch still prevents it in the free profile.

The production EAS preflight on **6 October 2026 at 09:03 UTC** found the news-feed URL unset. No automated news publisher is connected. Recheck the actual release environment when building; this does not imply that a later build cannot enable it.

**Draft outcome:** “No” to required user-data collection/sharing is a candidate answer **only after** a clean-install native traffic and dependency check confirms this configuration. Repository review finds local play data, intentional system sharing and browser links; it cannot establish the behavior of every native dependency or remote build setting. Keep the network-capture result and manifest with the release record.

Do not declare local quiz answers, local progress or local reports as server-collected solely because they are stored in SQLite. Likewise, do not assert that all 160 core-bank questions are free: 40 are the disabled Legends Pack, with a three-question preview.

No account-creation feature is present. Answer account questions accordingly. “Delete my local progress” resets the profile; it does **not** erase the downloaded news cache, RevenueCat customer records or Google purchase history, and it does not refund a purchase. Do not describe that button as deleting all remotely held data.

## Scenario B: RevenueCat commerce enabled

This scenario applies as soon as the enabled app configures the purchase SDK, including shop/restore use, not only after someone pays. The current code passes a public API key to `Purchases.configure()` without a custom user ID or customer attributes. RevenueCat assigns an anonymous App User ID; “anonymous” here is a product identifier, not a guarantee of irreversible anonymization. [RevenueCat customer identification](https://www.revenuecat.com/docs/customers/identifying-customers)

The production Android public SDK key is validated and a current RevenueCat offering exists, but it does not include the Android `leoqo_legends_lifetime` mapping. That does not establish whether the product exists in Play Console, or demonstrate a purchase. RevenueCat's Google Play service-credential health is still unverified; a valid public SDK key does not validate its provider credentials. Scenario B still applies when the enabled shop configures the SDK before a product can be bought.

| Console question / data type | Working answer for an enabled build |
| --- | --- |
| Collects required user data? | **Yes.** Purchase-history collection applies. |
| Financial info → Purchase history | Collected; not ephemeral. Purposes: **App functionality** and **Analytics**, following RevenueCat's guidance. |
| Collection required or optional? | RevenueCat's standard guide says **required**. This app delays configuration until shop access, but has no switch to turn SDK collection off after configuration. Keep the required answer unless an implemented, verified alternative meets Google's optional-collection definition. |
| Shared? | Assess the actual processor contract and RevenueCat integrations. “Not shared” requires that the service-provider exception applies and no independent third-party integrations receive it. We have not inspected the owner's dashboard. |
| Encrypted in transit? | RevenueCat documents encryption in transit. Verify every other enabled endpoint before answering this for the whole app. |
| User IDs / Device or other IDs | **Classification requires verification.** Inspect the SDK's anonymous App User ID, purchase tokens and actual request fields against Google's definitions. No custom account ID, contact attributes or advertising-ID integration is configured in this source. Do not infer “no identifiers” from “no login.” |
| Name / email / phone | No app form or RevenueCat attribute calls collect these in the source reviewed. Reassess if customer attributes, support forms or integrations are added. |
| Card / bank details | The app does not request them. Google Play's payment interface handles payment credentials; purchase history still needs the separate disclosure above. |
| Location / app activity / diagnostics | No such app collection is established by this review. Check the native SDK version and provider settings; IP-based location derivation or a later analytics integration changes the answer. |
| Data deletion request | Do not select “Yes” based only on the local-reset button. Supply and test a support mechanism that can locate and delete the relevant RevenueCat customer data, with disclosed retention exceptions. |

The support route is now concrete: email `info@novaspheretechnology.co.uk`, with the **Support ID** from **Settings → Purchases & restore** after the adult step, if available. The owner can use it to locate the associated RevenueCat customer record, including records for people who opened the shop without paying. Displaying an ID and offering email do not establish that deletion has been exercised. Document identity checks, provider-specific steps and retained transaction records; do not promise refunds or store-record deletion through this route.

Provider baseline: [RevenueCat's Google Play Data safety guide](https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety). Its advertising identifier guidance is conditional on integrations. Our unresolved identifier classification is a conservative review item, not a claim that this code reads an advertising ID.

The app's phrase “no advertising or analytics SDKs running during free play” must be rechecked for a monetized release: RevenueCat's disclosed purposes include analytics, and the module remains configured after the adult shop is opened. Backgrounding clears the UI's adult-step state but does not deconfigure RevenueCat. A child subsequently holding the same phone is part of the assessment below.

## Scenario C: optional news refresh enabled

`src/services/news.ts` sends a manual HTTPS GET to the configured content host after the adult step. It omits fetch credentials, passes no account token or explicit device identifier, and sends no quiz progress. The request still exposes ordinary connection metadata such as the IP address to the host and possibly its CDN/security providers.

Before release with a feed URL, record:

- The real hostname, hosting/CDN providers, processing agreements and who can access logs.
- Actual request fields and any host-issued identifiers/cookies, logging defaults, retention and deletion behavior.
- Whether IP data is retained, used for approximate location, linked to other records, or passed to independent third parties.
- The resulting Google data-type/purpose mapping, required/optional choice, sharing status and privacy text.

IP transit alone does not prove that approximate location is derived. Conversely, an HTTPS-only client does not prove that the provider keeps no logs. Do not mark processing ephemeral without evidence of the full hosting path's retention behavior. Apply this scenario together with B if both features are enabled.

## Children and the adult step

The app itself markets **ages 10 to 75 and beyond** and offers family pass-and-play. Its intended audience includes children. Candidate Console bands are **9–12, 13–15, 16–17 and 18+**, subject to reviewing actual suitability for every selected group. Changing the Console answer to “18+ only” would not make the existing product adult-only. [Google target-audience guidance](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en)

The reverse-three-digits challenge and adult checkbox are parental friction, **not a neutral age screen or verified parental consent**. No age is collected. There is no verified record distinguishing child and adult SDK sessions.

Google Families requirements apply when children are a target audience, including to monetization. Mixed-audience apps must restrict child-inappropriate SDK/API collection and prohibited identifiers for children and unknown-age users. An SDK not approved for child-directed use needs an appropriate neutral age screen or an implementation that prevents collection from children. Ad-SDK certification concerns advertising; it is not evidence that a billing SDK is suitable for children. [Families policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)

For this app, the unresolved release work is specific:

1. Establish the installed RevenueCat version's suitability, data fields and processing behavior for the intended ages and launch countries. Capture startup, adult shop, purchase/restore, background/resume and return-to-child-play traffic.
2. Resolve the shared-phone lifecycle: the SDK remains configured after the adult step. Document a child-appropriate implementation and its evidence before enabling commerce. A checkbox alone does not establish that children cannot cause collection.
3. Review external source destinations, share/export access, shop wording and each news edition for the youngest target group. News about injuries, abuse or other sensitive events needs age-suitability judgment even when the underlying reporting is factual.
4. Assess applicable children's privacy obligations in the chosen markets before making parental-consent or compliance claims. Do not label the current gate as COPPA/GDPR certification or as Google's approval.

The free build can be tested while this work proceeds. This document does **not** authorize changing the editorial approval flag or opening the shop.

## Privacy policy material the owner must complete

Google requires a public, accessible, non-geofenced privacy-policy URL and privacy text or a link in the app. The policy must identify the app/developer, provide a privacy contact, explain data practices and recipients, security, retention and deletion. It must not be an editable document or PDF. [Google User Data / Privacy Policy requirements](https://support.google.com/googleplay/android-developer/answer/18258653?hl=en)

| Missing owner/service fact | Why it is needed |
| --- | --- |
| Legal developer identity | Owner confirmation is pending; match the Play listing. The public support/privacy email is supplied: `info@novaspheretechnology.co.uk`. Do not infer a legal entity from its domain. |
| Public policy URL and date | [Published policy](https://leo-foot-quiz.vercel.app/privacy.html), reviewed 6 October 2026 and verified live at 09:18 UTC that day. Confirm the responsible operator and final provider/release declarations. See the [policy working notes](privacy-policy-draft.md). |
| Support website / deletion-request route | [Published support page](https://leo-foot-quiz.vercel.app/support.html), verified on the same run, with the supplied email and Support ID instructions. Locating and deleting a remote customer/host record has not been tested. |
| Launch countries and audience choices | The current product offers family play for ages 10+; the owner has not yet confirmed launch countries and Console audience choices. Review suitable age bands and the applicable children's requirements. |
| RevenueCat account settings, recipients and retention | Explain actual purchase processing and any legally required retention. SDK availability alone is insufficient evidence. |
| News host/CDN and retention, if enabled | Complete scenario C before publishing a remote-feed build. |
| Support messages and exports received by the owner | Explain how voluntarily submitted email, diagnostics or question reports will be handled outside the app, without pretending the app automatically uploads them. |

The [public-page check on 6 October at 09:18 UTC](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37442034644) verified both HTML pages and their stylesheet: HTTP 200 without credentials or redirects, expected MIME types and content matching the repository files after trimming surrounding whitespace. This proves retrieval from the runner, not worldwide availability, provider-policy compliance or Google approval.

The Vercel-hosted pages disclose standard website metadata separately from local quiz storage. The [Vercel Privacy Notice](https://vercel.com/legal/privacy-notice) explains platform processing and context-dependent retention. Its [log-drain documentation](https://vercel.com/docs/drains/reference/logs) describes optional capabilities, not proof that this project enables them. Do not use a runtime-log plan limit as a promise about all provider-held data or infer native background collection from a browser visit.

The policy should distinguish local progress deletion from provider-held purchase data, include browser-link and intentional-sharing behavior, and describe the features enabled in the release. Do not promise that all data is encrypted at rest, never leaves the phone, is never used for analytics, or can all be deleted by the local-reset button.

## Evidence to attach to the release record

- Commit, app version/version code, AAB checksum, enabled build-variable names and their non-secret feature states.
- The [inspected v7 manifest and signature record](release-evidence/v7/inspection-report.json), plus the SDK/dependency inventory and comparison with Play's expected upload certificate. Re-inspect any later artifact.
- Native network-capture results for the scenarios above, including an offline run and deliberately failed news/purchase requests.
- RevenueCat/hosting settings review, completed identifier mapping and any processor/retention decisions.
- Published policy/support URLs, final Console answers, genuine content-rating result and audience rationale.
- Tested local reset and, when claimed, an actual remote deletion-request process.

Use this alongside the [store listing draft](store-listing.md), [release runbook](release-runbook.md) and [app acceptance checks](../TESTING.md). Revisit the declaration whenever commerce, remote news, ads, accounts, analytics or support integrations change.
