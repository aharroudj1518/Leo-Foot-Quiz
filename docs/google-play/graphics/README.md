# Leoqo store graphics

Leoqo icon and feature artwork was generated on 6 October 2026, using the app's forest green, cream and gold palette. No player photos, club crests or competitor assets are included. Source artwork renders are retained in the development workspace's `generated_images` folder; their committed exports are resized copies.

| File | Purpose | Export |
| --- | --- | --- |
| `store-icon.png` | Google Play listing icon | 512 × 512, 32-bit PNG, opaque |
| `feature-graphic.png` | Google Play feature graphic | 1024 × 500, 24-bit PNG, opaque |
| `../../../assets/icon.png` | App and Android adaptive foreground | 1024 × 1024, PNG |
| `../../../assets/favicon.png` | Web favicon | 64 × 64, PNG |

The adaptive icon uses the same mark against forest green; Expo's default blue icon is no longer referenced by the app configuration. Check the installed Android launcher mask before publication.

The following screenshots are genuine native Android API 36 emulator captures from version 7, build `9d9d1a37-3fe9-4d41-83a1-8bea6745cd74`, source `089b8ed12c397e18aed059b99173088fafa15c52`, in [successful native test run 37450537693](https://github.com/aharroudj1518/Leo-Foot-Quiz/actions/runs/37450537693). Each export is 1080 × 1920, 24-bit RGB PNG. Only the PNG encoding changed: every original alpha value was confirmed opaque and every exported RGB pixel is identical. Nothing was resized, cropped, retouched or overlaid, including the actual capture time and app content. The original RGBA captures remain in the development workspace.

| Native screenshot | Captured screen |
| --- | --- |
| [01-native-home.png](native-v7/01-native-home.png) | Fresh home and Matchday briefing |
| [02-native-question.png](native-v7/02-native-question.png) | First free quiz question |
| [03-native-answer-reveal.png](native-v7/03-native-answer-reveal.png) | Answer reveal after a normal selection |
| [04-native-resumed-question.png](native-v7/04-native-resumed-question.png) | Saved question after app restart |
| [05-native-settings.png](native-v7/05-native-settings.png) | Settings reached through free navigation |

The [export manifest](native-v7/manifest.json) records capture timestamps, source and export hashes, byte sizes and pixel checks. The [API 36 report](../release-evidence/v7/api36/native-smoke-report.json) and [API 32 report](../release-evidence/v7/api32/native-smoke-report.json) document the tested free flows. The screenshots came from an APK generated from the inspected signed AAB and signed with a disposable emulator test key. They do not establish physical-phone behavior, Play-installed billing, purchases, restoration, licensing or Play listing approval. Choose the final listing screenshots after reviewing these captures.

`npm run store:screenshots` captures real web UI at phone dimensions when the exported app is served at `http://127.0.0.1:8081`. These are web previews, not evidence of native Android testing. Inspect the generated manifest and compare the candidate on Android before choosing store screenshots. The release workflow retains the captures as an artifact.

[Google asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
