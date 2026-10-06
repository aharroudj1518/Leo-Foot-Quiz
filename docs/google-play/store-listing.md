# Google Play listing draft

Prepared and primary sources checked **6 October 2026 (Europe/London)**. This is copy for the free `production` candidate, not evidence of Play approval or a published app. Its build switch disables the shop. The bank now has hash-bound independent AI editorial review; the separate `production-paid` candidate supports native purchase testing. See the [release runbook](release-runbook.md) for building and submitting the Android bundle and the [Data safety draft](data-safety-draft.md) for declarations.

## Fields to paste

### App name

```text
Leoqo Football Quiz
```

### Short description

```text
Football trivia, daily challenges and matchday stories for every generation
```

### Full description

```text
Make football knowledge part of your day with Leoqo Football Quiz. Play a quick round, learn the story behind an answer, or pass your phone to another fan.

YOUR DAILY FIVE
Take on five football questions each day and build a streak. Your results and progress stay on your device.

FIND YOUR LEVEL
Explore 120 free core questions about the world game, clubs, players and football rules. Choose Starter, Fan or Expert difficulty, play a mixed round or focus on a topic. Use a hint when you need a nudge, then read the answer explanation.

FOOTBALL STORIES YOU CAN PLAY
Matchday briefings turn dated football stories into short quizzes. Each edition shows its dates, with reference links for learning more. Older editions are marked as archive so you can see which period you are playing.

LEARN FROM EVERY ROUND
Review your results, revisit missed questions and see how you are doing across topics. Resume an unfinished round when you return.

SHARE THE PHONE
Two fans can take turns in a local pass-and-play round. No app account is needed.

PLAY AT YOUR OWN PACE
Take your time or switch on the optional timer. Adjust sound and larger text in Settings. Core questions and included briefings are available offline; opening source websites needs an internet connection and the adult step.

A TASTE OF THE LEGENDS
Try three questions from the Legends Pack, covering European Cup winners from 1956 to 1995. The full 40-question pack is planned as a separate purchase and is not available to buy in this release.

Leoqo is an independent football quiz. It is not endorsed by any player, club, FIFA or UEFA.
```

Validated character counts, including spaces and line breaks: name **19/30**, short description **75/80**, full description **1,602/4,000**. Recount after editing. [Google listing limits](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)

The listing describes bundled, dated editions. It does not promise a staffed daily editorial service, live match results or an automatically updating feed. Recheck the 120/40 counts and included content against the actual release artifact.

## When a paid build is actually ready

Replace only the Legends paragraph after the content approval, Families/data review, product configuration and native purchase tests are complete:

> Unlock the Legends Pack with a one-time in-app purchase: 40 questions about European Cup winners from 1956 to 1995. Try three sample questions before buying. The price appears in your local currency before you confirm your purchase.

This paragraph is conditional copy, **not for the current listing**. The three preview questions are part of the 40-question pack. Do not advertise a subscription, recurring new packs or cross-device progress: these are not implemented. Configure and test the actual one-time product before describing it as such.

## Store setup and owner details

| Field | Prepared value or remaining action |
| --- | --- |
| App identity | `com.leoqo.footballquiz`; match the existing Play app and signed AAB. |
| App or game / category | Game / Trivia is the proposed classification. Select only relevant tags offered by Console. |
| Price to install | Free for this candidate. A later optional pack is an in-app purchase. |
| Language | English. Choose the existing listing's default locale; this copy uses UK football terminology. The app currently supplies English text. |
| Support email | **info@novaspheretechnology.co.uk**, supplied by the owner. |
| Support website | [Public page prepared locally](../../public/support.html). Intended URL: `https://leo-foot-quiz.vercel.app/support.html`. Verify the deployed page before Console submission. Covers corrections, purchase help and privacy requests. |
| Privacy policy | [Public page prepared locally](../../public/privacy.html). Intended URL: `https://leo-foot-quiz.vercel.app/privacy.html`. Confirm the responsible operator and release/provider facts, then verify publication. See the [policy working draft](privacy-policy-draft.md) and Data safety draft. |
| Developer identity | Owner verifies the existing account's legal identity and public details in Console. Do not invent an address or commit identity documents, bank information or service-account keys. |
| Countries / distribution | Owner selects the actual launch countries and supported device types, after the children's-data and support review. |

Support contact requirements: [Google listing setup](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en). Monetization also requires the appropriate payments profile and account verification; public address requirements depend on the account and monetization status. Complete those with the owner's genuine details: [payments profile](https://support.google.com/googleplay/android-developer/answer/7161426?hl=en), [developer identity](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en).

## Required images and capture plan

Prepare these from approved original branding and the actual Android candidate:

| Asset | Google requirement / proposed delivery |
| --- | --- |
| Store icon | 512 × 512, 32-bit PNG, at most 1,024 KB. This is separate from Android's adaptive launcher assets. |
| Feature graphic | 1,024 × 500, JPEG or 24-bit PNG without transparency. |
| Screenshots | Minimum two; JPEG or 24-bit PNG without transparency, 320–3,840 pixels per side, longer side at most twice the shorter. Up to eight per supported device type. |
| Recommended phone set | Six genuine portrait captures at 1,080 × 1,920. At least three 9:16 gameplay screenshots meet Google's game recommendation guidance. |
| Other devices | Capture the actual layout for any tablet/other device listing; follow the device-specific Console requirements. |

Requirements versus recommendation guidance: [Google preview assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en). Do not claim rankings, awards or player/club endorsements. No fake store badges or invented gameplay.

Suggested phone shots, in order:

1. Home: Daily Five and the available play modes.
2. A real question with four answers.
3. Answer feedback showing the explanation and source.
4. A Matchday edition with its date and accurate current/archive status.
5. Two-player pass-and-play during a round.
6. Learning screen after a real test session, showing missed-question review.

Use deterministic test progress and remove tester-identifying content. Do not show the full paid pack unlocked in free-build screenshots. The [store icon and feature graphic](graphics/README.md) are supplied. Five phone-shaped web previews are available from the screenshot workflow artifact and the local `leoqo-store-previews` folder. They show the browser build; verification against genuine captures from the signed Android candidate is still needed before store submission.

## App content and review notes

Complete every declaration surfaced in this app's Console dashboard; the app's current state supports these draft positions:

| Declaration | Current evidence / action |
| --- | --- |
| Ads | No advertising in the current app; no ad SDK is installed. Verify the release dependencies. |
| App access | Guest play has no login. Document the adult step for restricted actions using the instructions below. |
| Content rating | Complete Google's IARC questionnaire using the actual question bank, news content, external links and purchasing behavior. Do not invent an age rating. |
| Target audience | The app explicitly says ages 10–75 and beyond. Assess 9–12, 13–15, 16–17 and 18+ against actual design and suitability. This includes children and triggers Families review; an 18+-only declaration would contradict the product. |
| Data safety | Use the scenario matching the submitted build and other active versions; free, news-enabled and commerce-enabled builds differ. |
| News declaration | Answer the displayed questions against the actual dated-news quiz feature. Game category alone is not a reason to skip this form. |
| Permissions / other forms | Inspect the final native manifest, then complete applicable forms. Configuration intent alone does not prove which permissions the AAB includes. |

[Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en), [target audience settings](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en). The specific Families issue is documented in the [Data safety draft](data-safety-draft.md#children-and-the-adult-step).

Suggested app-access instructions for the **current free candidate**:

> No Leoqo login is required. Core rounds, Daily Five, the included Matchday edition and the three-question Legends preview can be reviewed without a purchase. Source links, sharing, news refresh where configured, purchases and deletion use an adult step: reverse the three digits currently displayed, tick the adult checkbox, then continue. The digits change; there is no fixed access code. Backgrounding the app clears the adult-step state. The full Legends Pack shop is intentionally disabled in this candidate.

For a paid candidate, replace the last sentence and provide Play's required access to its restricted features. Do not submit a paid-feature review with these free-build instructions unchanged.

## Publication prerequisites still to verify

- **Artifact:** signed Android App Bundle, correct package/signing identity, increasing version code, real-device tests and resolved pre-launch report findings. As of this check, new phone apps and updates must target Android 16 / API 36 under the rule effective 31 August 2026. Inspect the built manifest. [Target API policy](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
- **Account:** if this is a personal account created after 13 November 2023, a closed test needs at least 12 testers continuously opted in for 14 days before applying for production access. Internal testing alone does not satisfy this; approval is not automatic. Confirm the owner's actual account status. [Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- **Store materials:** icon/feature graphic and five web phone previews are supplied; signed-Android capture verification remains. The support email is supplied and public support/privacy pages are prepared locally. Confirm the responsible operator, deploy and verify the URLs, and finish accurate Console declarations.
- **Product/content:** the core 160-question bank has recorded independent AI factual review for its exact hash. Review new or edited editions and confirm audience suitability; this does not establish Google approval.
- **Paid release:** finish the Families/SDK assessment and Data safety changes, configure the one-time product and entitlement, then test purchase, cancellation, pending payment and restore on Google Play. An existing RevenueCat account does not establish these results.

Expo's current documentation allows a first EAS submission to create an internal release after the Play app and service-account setup; a mandatory manual first upload is no longer a universal prerequisite. A draft upload still requires Console setup and a deliberate rollout before testers can install it. [Expo Android submission](https://docs.expo.dev/submit/android/), [project release runbook](release-runbook.md).
