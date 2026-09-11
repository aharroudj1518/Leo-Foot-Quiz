# Native progress release 0.4.1

Corrected source: a90237d4a964418f2f4e0a683ee9262cade0921d. Validation profile, commerce disabled, Android APK and iOS simulator archive. This includes the 50-player gallery and the combined typed-answer, daily-progress and career-total improvements.

## Corrected build jobs

- Android: 1cc3788f-50ee-42ad-a398-4a6009c4e769
  https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/1cc3788f-50ee-42ad-a398-4a6009c4e769
- iOS simulator: 20b4fd30-4148-4339-ae19-d9f82a6cf062
  https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/20b4fd30-4148-4339-ae19-d9f82a6cf062

Latest verified results: Android and iOS simulator are both FINISHED. Successful Android APK: https://expo.dev/artifacts/eas/J8p6lOFX6hgt25FN0u5jXYRp5gT89WfLgPdVxffjhd8.apk . Successful iOS simulator archive: https://expo.dev/artifacts/eas/rTs-9lUQRlwrAy0Asexh_Jm0T61G0yFW29Sl1CJe21U.tar.gz . Both download artifacts were returned by the exact EAS job queries. These builds predate commit 987855f and its sixteen-puzzle connection expansion.

## Failed first attempt

The earlier e975294 jobs 5d45b910-7665-4ee8-92e5-c7ceee82a747 (Android) and 230a0bf5-b571-4303-8be3-f13d82d88730 (iOS) were both verified ERRORED in the post-install phase. The Android log identified ERR_MODULE_NOT_FOUND for the new extensionless daily import. Commit a90237d fixes the plain Node import and adds a direct CLI regression test. Both prior jobs were terminal before the corrected submission.

## Verification and limits

TypeScript, the 81-test unit suite plus the new Node hook test, all 46 desktop/phone browser tests and Expo web export passed. The validation hook passes directly; production content approval still fails as expected because independent review is outstanding. The import correction produces the same web bundle hashes as the live e975294 deployment.

The public 0.4.1 site completed a daily round at 1/5, showed a one-day streak and recorded one completed round with 20% accuracy. It also clarified Ronaldo and accepted R9 in the saved portrait round.

Native compilation does not prove real-device acceptance. The iOS archive is for a Mac simulator, not iPhone/TestFlight. Cartoon delivery, store setup, independent content/rights approval, native acceptance and the iOS encryption declaration remain outstanding.


