# Google Play Data safety and privacy draft

Prepared and primary sources checked **6 October 2026 (Europe/London)** against the current repository. This is a developer working draft, not a submitted declaration or a published privacy policy. Confirm the exact release binary, build environment, provider settings and all relevant active versions before making Console selections.

## What the app actually does

| Flow | Repository evidence | Destination |
| --- | --- | --- |
| Guest play | No Leoqo account creation or login; no name, email, date of birth or location prompt. | On device. |
| Progress | Answers, history, mistakes, streak dates, unfinished session, settings and question reports are serialized by `src/services/storage.ts`. Typed player answers can be retained with the round. | Android SQLite database `leoqo.db`, profile key `leoqo.profile.v1`. No progress server is implemented. |
| News content | Bundled JSON plus optional downloaded editions cached under `leoqo.news.v1`. | On device unless an adult chooses the optional refresh. |
| Question reports | The reason, question ID and timestamp are stored locally; reporting does not upload them. | Local until the user chooses export/share. |
| Export and score sharing | `App.tsx` invokes the operating system share sheet after the adult step. No automatic recipient or upload endpoint. | Destination chosen by the user; audit any later support workflow separately. |
| Sources | External reference URLs open in the browser after the adult step. | Independent source website, with its own privacy practices. No embedded news webview is implemented. |
| Ads / app analytics | No advertising or standalone app-analytics SDK integration appears in the current dependencies/code. | Verify native release traffic and transitive dependencies before making a zero-collection claim. |
| Billing | `src/services/billing.ts` dynamically configures RevenueCat only after an adult shop action and only when both commerce and editorial switches allow it. | RevenueCat and Google Play when enabled. The free `production` candidate blocks SDK configuration through this path; `production-paid` permits it when its checks pass. |

SQLite storage is not an encryption-at-rest guarantee. Review Android backup/restore configuration in the final manifest: local application storage may participate in platform-managed backups. The app does not implement cloud progress sync.

Google defines collection around off-device transmission, including SDKs; local-only processing is outside that definition. Transfers to qualifying service providers and expected user-initiated sharing have specific sharing exceptions, which do not erase collection obligations. Pseudonymous identifiers still need assessment. The form is required for closed/open/production distribution; exclusively internal testing is exempt. [Google Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)

## Scenario A: current free candidate, optional news endpoint unset

Conditions: `EXPO_PUBLIC_COMMERCE_READY=false`, `EXPO_PUBLIC_NEWS_FEED_URL` unset, and no additional production services introduced. Editorial approval alone does not configure billing; the commerce switch still prevents it in the free profile.

**Draft outcome:** “No” to required user-data collection/sharing is a candidate answer **only after** a clean-install native traffic and dependency check confirms this configuration. Repository review finds local play data, intentional system sharing and browser links; it cannot establish the behavior of every native dependency or remote build setting. Keep the network-capture result and manifest with the release record.

Do not declare local quiz answers, local progress or local reports as server-collected solely because they are stored in SQLite. Likewise, do not assert that all 160 core-bank questions are free: 40 are the disabled Legends Pack, with a three-question preview.

No account-creation feature is present. Answer account questions accordingly. “Delete my local progress” resets the profile; it does **not** erase the downloaded news cache, RevenueCat customer records or Google purchase history, and it does not refund a purchase. Do not describe that button as deleting all remotely held data.

## Scenario B: RevenueCat commerce enabled

This scenario applies as soon as the enabled app configures the purchase SDK, including shop/restore use, not only after someone pays. The current code passes a public API key to `Purchases.configure()` without a custom user ID or customer attributes. RevenueCat assigns an anonymous App User ID; “anonymous” here is a product identifier, not a guarantee of irreversible anonymization. [RevenueCat customer identification](https://www.revenuecat.com/docs/customers/identifying-customers)

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
| Legal developer identity and public support/privacy email | Match the Play listing and provide a real route for questions, corrections and data requests. Do not invent an address. |
| Public policy URL and effective date | A repository working draft or local screen is not the published URL. |
| Support website / deletion-request route | Describe how the owner receives and fulfills requests. No remote deletion workflow is currently implemented or tested. |
| Launch countries and audience decision | Determine the applicable children's privacy review and accurate Console targeting. |
| RevenueCat account settings, recipients and retention | Explain actual purchase processing and any legally required retention. SDK availability alone is insufficient evidence. |
| News host/CDN and retention, if enabled | Complete scenario C before publishing a remote-feed build. |
| Support messages and exports received by the owner | Explain how voluntarily submitted email, diagnostics or question reports will be handled outside the app, without pretending the app automatically uploads them. |

The policy should distinguish local progress deletion from provider-held purchase data, include browser-link and intentional-sharing behavior, and describe the features enabled in the release. Do not promise that all data is encrypted at rest, never leaves the phone, is never used for analytics, or can all be deleted by the local-reset button.

## Evidence to attach to the release record

- Commit, app version/version code, AAB checksum, enabled build-variable names and their non-secret feature states.
- Final native manifest and SDK/dependency inventory; especially permissions for advertising ID, microphone and location. Current Expo audio configuration disables microphone recording, but the binary must confirm the outcome.
- Native network-capture results for the scenarios above, including an offline run and deliberately failed news/purchase requests.
- RevenueCat/hosting settings review, completed identifier mapping and any processor/retention decisions.
- Published policy/support URLs, final Console answers, genuine content-rating result and audience rationale.
- Tested local reset and, when claimed, an actual remote deletion-request process.

Use this alongside the [store listing draft](store-listing.md), [release runbook](release-runbook.md) and [app acceptance checks](../TESTING.md). Revisit the declaration whenever commerce, remote news, ads, accounts, analytics or support integrations change.
