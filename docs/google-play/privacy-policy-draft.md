# Leoqo Football Quiz privacy policy — UNPUBLISHED DRAFT

Prepared **6 October 2026** from the current repository. This is an owner-editable draft, **not a published policy or a statement that release requirements have been met**. Do not submit this file's repository URL as the finished public policy or publish it with unresolved fields.

## Owner information to complete before publication

| Item | Required owner decision |
| --- | --- |
| Operator | Public legal/developer name responsible for Leoqo: **TO COMPLETE** |
| Privacy and support contact | Monitored public email/contact route: **TO COMPLETE** |
| Public policy address | Stable, publicly accessible policy URL: **TO COMPLETE** |
| Effective date | Date this completed policy takes effect: **TO COMPLETE** |
| Audience | Confirm target ages/countries and any applicable children's arrangements. The app currently mentions ages 10+, but the release audience is unconfirmed. |
| Hosting and retention | Confirm news/web host, logging, processing locations, retention/deletion periods, and any RevenueCat dashboard integrations. None is established by the repository. |

The app's adult confirmation step is **not verified age assurance or parental consent**. Do not add a claim that parental consent has been obtained. Final audience choices must be reflected in the policy, app wording and store declarations.

---

## Draft policy text

**Operator:** TO COMPLETE. **Privacy contact:** TO COMPLETE. **Effective date:** TO COMPLETE.

This policy explains how Leoqo Football Quiz handles information when you play, check for new briefings, open the shop, or choose to share information.

### Playing and saving progress

You can play without creating a Leoqo account. The app does not ask you to provide your name, email address, date of birth or location.

Your device stores quiz answers, scores, questions seen, mistakes to practise, hint use, an unfinished round, recent completed rounds, daily-completion dates, settings, and question reports. A report contains the question identifier, the reason you select, and its date. Saved rounds can include a copy of their questions so they remain usable after content changes.

This information supports resuming a round, learning from mistakes, showing results and calculating your daily streak. Mobile builds use local app storage; the web version uses your browser's local storage. Ordinary quiz play does not upload your progress or question reports. The app retains up to 100 completed rounds; separate daily-completion records can remain longer.

The current app has no advertisements or general-purpose advertising/analytics integration. Optional purchase services still process the information described below.

### Optional football briefings

Included and saved briefings can be played offline. If online editions are enabled, choosing **Check for new editions** requests content from the configured host after the adult confirmation step. There is no automatic news polling in the current app.

The host receives standard connection information, including your IP address and request details needed to deliver the response. Your quiz progress, answers and local reports are not included in that request. Downloaded briefings are cached on the device.

**Owner completion:** identify the actual host and explain its request-log purposes, retention and deletion arrangements. The repository does not establish whether logs are retained or for how long. If no online feed is offered, say so in the published version.

### Shop and purchases

Where enabled in an Android or iPhone store build, the shop uses RevenueCat and the relevant app store to display products, verify purchases and restore access to the Legends Pack.

RevenueCat is initialized when you open the enabled shop after the adult step. Processing can begin **before you buy anything**. Because Leoqo does not supply a personal account ID, the purchase SDK creates a random app-user identifier and stores it on the device. This identifier can distinguish a purchase customer; it is not a promise that all purchase information is anonymous.

RevenueCat and the store process purchase history, transaction/receipt or purchase-token information, product and entitlement status, and relevant app/device information to operate purchasing and restoration. Leoqo does not send your quiz answers or question reports to RevenueCat. Payment credentials are handled by Apple or Google; Leoqo does not receive your card number.

See [RevenueCat's privacy policy](https://www.revenuecat.com/privacy), [Google's privacy policy](https://policies.google.com/privacy), and [Apple's privacy policy](https://www.apple.com/legal/privacy/). Purchase records may remain with those services after you delete local progress. **Owner completion:** confirm applicable retention, processing locations and the support process for locating and handling requests about these records.

### Sharing, exports and external websites

Sharing is optional. A shared score contains the round label/date where applicable, score and hint-use summary; it does not contain the correct answers. A progress export includes your saved answers, including typed responses, settings and round records; a reports export includes reasons and timestamps. Exports create a file or open the device share interface. The web version may use browser sharing, copy a score to your clipboard, or download a file. Information is sent to another app or recipient through the sharing action you choose.

Source links open an external website after the adult step. That website receives its own connection information and applies its own privacy practices. Leoqo does not control information you subsequently provide to it. A hosted web preview also sends ordinary website requests to its web host; **the owner must identify that host and its logging practices if this policy covers the preview**.

### Your controls and deletion

Use **Settings → Export progress** or **Export reports** to obtain the local information. Use **Settings → Privacy → Delete my local progress** to reset rounds, daily records, settings and local reports in the app.

This reset **does not delete cached briefings, exported/shared copies, RevenueCat records, or store purchase records**. It does not cancel or refund a purchase. Device/browser controls can clear the app's local storage; backups and copies kept elsewhere have their own deletion controls.

For questions or requests concerning remote information, contact **TO COMPLETE: monitored privacy contact**. Store payment/account requests may also need to be made directly to Apple or Google. **Owner completion:** establish the remote-request workflow before publishing; the current app has no remote deletion button and does not display its RevenueCat identifier.

### Audience and policy updates

**Owner completion:** insert the confirmed audience and any relevant children's information-handling arrangements without claiming an age check or consent mechanism the app does not implement.

Changes to the app's data handling will be reflected in the completed policy and its effective date.

---

## Internal evidence notes — remove from the public policy

Reviewed: `App.tsx`; `src/core/quiz.ts`; `src/core/sharing.ts`; `src/services/storage.ts`, `storage.web.ts`, `news.ts`, `billing.ts`; `src/i18n.ts`; `app.json`; `package.json`. No provider dashboard, host logs or production network trace was inspected for this draft. [RevenueCat confirms the default random identifier behavior](https://www.revenuecat.com/docs/customers/identifying-customers). Recheck the shipped build, provider configuration and store data-safety answers when completing this draft. No compliance certification is asserted.
