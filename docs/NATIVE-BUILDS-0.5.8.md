# Android validation 0.5.8

12 September 2026. The application and web export are ready; no EAS build was submitted and no 0.5.8 APK exists yet.

Automatic approval review rejected the EAS upload because it would export private application source and assets to Expo’s build service, and requested explicit authorization for that destination. The rejected command was eas build --platform android --profile validation --non-interactive --no-wait. No build ID was returned. Do not claim an upload or completed APK.

Local checks found no Java, Gradle, Android SDK or adb installation in PATH or the standard installation paths, and no native Android project directory. A local APK build is not currently available.

The reviewed payload is version 0.5.8 in package.json, package-lock.json and app.json, targeting the existing Leoqo EAS project 99891114-dac6-4d4c-973c-3a246db2a7b1, owner amoharroudj. Validation profile: internal Android APK, remote signing credentials, auto-incremented Android version code, commerce disabled.

134 unit tests, TypeScript, web export and 20 relevant desktop/phone browser checks passed. See CLUB-HISTORY-0.5.8.md. The previous 0.5.7 APK predates the club-history/crest/kit update and must not be offered as containing these changes.
