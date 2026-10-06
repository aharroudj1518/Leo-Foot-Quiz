# Leoqo store graphics

Original Leoqo artwork generated on 6 October 2026, using the app's forest green, cream and gold palette. No player photos, club crests or competitor assets are included. Source renders are retained in the development workspace's `generated_images` folder; the committed exports are resized copies.

| File | Purpose | Export |
| --- | --- | --- |
| `store-icon.png` | Google Play listing icon | 512 × 512, 32-bit PNG, opaque |
| `feature-graphic.png` | Google Play feature graphic | 1024 × 500, 24-bit PNG, opaque |
| `../../../assets/icon.png` | App and Android adaptive foreground | 1024 × 1024, PNG |
| `../../../assets/favicon.png` | Web favicon | 64 × 64, PNG |

The adaptive icon uses the same mark against forest green; Expo's default blue icon is no longer referenced by the app configuration. Check the installed Android launcher mask before publication.

`npm run store:screenshots` captures real web UI at phone dimensions when the exported app is served at `http://127.0.0.1:8081`. These are web previews, not evidence of native Android testing. Inspect the generated manifest and compare the candidate on Android before choosing store screenshots. The release workflow retains the captures as an artifact.

[Google asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
