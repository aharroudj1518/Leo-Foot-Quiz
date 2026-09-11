# Purchase setup needed for real transaction testing

The purchase code and a playable three-question pack preview are implemented, but revenue is not enabled. These identifiers are already used by the app; store records must match them rather than creating different IDs:

| Record | Expected value |
| --- | --- |
| Android package | com.leoqo.footballquiz |
| iOS bundle | com.leoqo.footballquiz |
| Product | leoqo_legends_lifetime |
| Product promise | One-time Legends Pack access; currently 40 European Cup questions |
| RevenueCat entitlement | legends |
| Offering | Current offering with the above product attached |
| iOS public SDK key variable | EXPO_PUBLIC_REVENUECAT_IOS_KEY |
| Android public SDK key variable | EXPO_PUBLIC_REVENUECAT_ANDROID_KEY |

Public SDK keys belong in the build environment. Secret RevenueCat REST keys and store signing/service credentials must not be placed in EXPO_PUBLIC variables or committed to the repository. Store-localized product prices remain authoritative; no live price has been configured or verified here.

On 11 September the owner was asked which Google Play, App Store Connect and RevenueCat app records are ready. No answer was available while this handoff was written. Record existence, account connection, product activation and sandbox testers are therefore unverified, not assumed absent. No private store-console inspection or account mutation was performed in this pass.

Once the records and an authorized testing route are available, verify on both platforms: successful purchase and restore, cancellation, approval-required/pending payment, foreground grant, process-death recovery, offline launch, refunded entitlement and store-account switching. Record the build ID, platform, product and observed outcome without payment details. Current simulator compilation and mocked SDK tests do not satisfy this acceptance.

Commerce remains false in EAS profiles and the independent editorial gate remains closed. Content/imagery approval, privacy/support operations and device acceptance are still needed before launch. The existing price/pack-value hypotheses are documented in LAUNCH-REVIEW-2026-09-09.md; this handoff does not approve prices or promise revenue.
