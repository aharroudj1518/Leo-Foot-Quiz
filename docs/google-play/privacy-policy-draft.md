# Leoqo Football Quiz privacy policy — UNPUBLISHED RELEASE DRAFT

Updated **6 October 2026** from the repository and provider documentation. The owner supplied **info@novaspheretechnology.co.uk**. Public-facing files are prepared at [privacy.html](../../public/privacy.html), [support.html](../../public/support.html) and [legal.css](../../public/legal.css). **No publication or deployment is recorded here. The intended URLs have not been verified live.**

## Known details and remaining owner inputs

| Item | Prepared value or remaining action |
| --- | --- |
| Product | Leoqo Football Quiz. No legal entity is inferred from the email domain. |
| Public contact | [info@novaspheretechnology.co.uk](mailto:info@novaspheretechnology.co.uk), supplied by the owner for support and privacy requests. |
| Intended policy URL | `https://leo-foot-quiz.vercel.app/privacy.html`; verify the deployed page before Console submission. |
| Intended support URL | `https://leo-foot-quiz.vercel.app/support.html`; covers corrections, purchases and information requests. |
| Operator | Owner confirmation of the responsible legal/developer name is pending. Match the Play listing and final policy. |
| Audience | Family product for ages 10+. Confirm launch countries and appropriate Console bands; do not describe it as adult-only. |
| Website hosting | Vercel. Static visits expose connection metadata. Project log configuration, integrations and retention have not been inspected. |
| Remote news | The production EAS check on 6 October 2026 at 09:03 UTC found the news-feed URL unset. The candidate uses bundled/saved editions. The policy also explains conditional manual updates; identify the actual host before enabling them. Do not assume it is Vercel. |
| Date | The HTML review date is a preparation date, not proof of a published effective date. |

The HTML contains usable product text and the supplied contact, without placeholder operators or invented retention promises. The product policy and support route can be reviewed at the prepared URLs after deployment. Confirm the responsible operator, actual release configuration and provider practices before submitting the final store declarations; publication of the product text does not establish that those declarations are complete. The adult challenge is a feature safeguard, **not verified age assurance, parental identity or parental consent**. The copy makes no compliance certification.

## What the prepared policy covers

- **Local play:** no Leoqo login or identity/location prompt. Answers, scores, mistakes, hints, settings, question reports and saved rounds remain in mobile local storage or browser storage during ordinary play. Completed-round history is limited to 100; daily records can remain longer. Storage is not an encryption guarantee and may participate in platform backups.
- **Briefings:** included and cached editions work offline and show their dates. Where configured, an adult can manually request new editions over HTTPS. The host receives connection information but the request does not include quiz progress or reports. There is no automatic polling. Provider log retention needs configuration evidence.
- **Purchases:** the enabled native shop initializes RevenueCat after the adult step, **before payment**. The SDK can remain configured after leaving the shop. A random app-user ID, purchase/receipt/token, entitlement and relevant app/device information support purchase operations and purchase-related analytics. The random ID is not an anonymization promise. Store payment credentials are not received by Leoqo. No quiz answers or reports are sent to RevenueCat by this code.
- **Support ID:** the enabled native shop displays RevenueCat's existing app-user ID after configuration. It can be selected/shared through **Settings → Purchases & restore**, without buying anything. Shop/privacy email actions may prefill it in a draft; sending is the user's choice. It helps locate a customer record, including for someone who opened the shop but never purchased. No ID is exposed in web/Expo Go or a disabled shop.
- **Website:** Vercel handles IP address, requested URL, time and browser information for delivery/security, and may derive approximate location. The pages add no analytics script. Provider policy capabilities are not a claim of observed project traffic or configured log drains. Retention is not assigned a fabricated number of days; processing may occur outside the visitor's country under provider policies.
- **Sharing and links:** optional scores, report exports and progress exports use browser/device sharing or downloads. Progress exports include typed answers. Source websites have independent practices. Exports are readable copies; no progress-import feature is implemented.
- **Email support:** the supplied mailbox receives sender address, message and voluntarily attached details for the request and follow-up. The policy offers a review/deletion request without inventing a mailbox deletion schedule, response deadline or automatic report upload. Children are directed to a parent/carer.
- **Deletion:** **Settings → Privacy & about Leoqo → Delete my local progress** resets profile data. It does not delete cached news, backups, shared/exported copies, RevenueCat records or store purchases, and does not cancel/refund a purchase. Device controls and the email request route are explained separately. Remote record location and deletion must be exercised before claiming a tested process; there is no remote deletion button or Leoqo login to close.

## Expo export and hosting checks

The repository uses Expo SDK 57. Its [versioned documentation](https://docs.expo.dev/versions/v57.0.0/) and [Metro configuration reference](https://docs.expo.dev/versions/v57.0.0/config/metro/) were checked before code changes. Expo's [static-files documentation](https://docs.expo.dev/guides/customizing-metro/#static-files) says root `public/` files are served during development and copied to `dist/` on export. No Router conversion is needed. No `public/index.html` was added, so the generated app entry remains available.

After `npm run build:web`, confirm `dist/privacy.html`, `dist/support.html` and `dist/legal.css`. After separately authorized deployment, check both URLs without login, HTTP success, correct titles, usable email links and CSS. Confirm hosting rewrites do not return the app shell for either HTML URL. Only then paste the verified URLs into Play Console.

## Evidence and limits

Reviewed `App.tsx`, `src/i18n.ts`, `src/core/sharing.ts`, and the storage, web storage, news and billing services, plus `app.json` and `package.json`. Provider dashboards, production network captures and remote deletion were not inspected or tested for this draft.

Primary references: [RevenueCat identifiers](https://www.revenuecat.com/docs/customers/identifying-customers), [RevenueCat Data safety guidance](https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety), [RevenueCat privacy](https://www.revenuecat.com/privacy), [Google privacy](https://policies.google.com/privacy), [Apple privacy](https://www.apple.com/legal/privacy/), [Vercel Privacy Notice](https://vercel.com/legal/privacy-notice), [Vercel CDN](https://vercel.com/docs/how-vercel-cdn-works) and [optional log drains](https://vercel.com/docs/drains/reference/logs). Optional drain documentation does not establish that this project enables drains. Runtime-log plan limits are not a universal retention rule for Vercel's platform data.

Use the [Data safety draft](data-safety-draft.md) for release-specific declarations. The prepared pages do not establish Play approval, provider compliance or completed publication.
