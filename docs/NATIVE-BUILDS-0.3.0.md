# Version 0.3.0 native validation

Source commit: cb9f3fd (codex/visual-preview). Build profile: validation. Payments disabled. Both build requests were accepted by EAS; cloud compilation status must be checked before distributing an artifact.

- Android APK: e49a9a51-9b3b-4aa9-b57b-00ef668dc669
  https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/e49a9a51-9b3b-4aa9-b57b-00ef668dc669
- iOS simulator: 3fc8df00-0907-49df-9a50-cf89cdc0f1bb
  https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/3fc8df00-0907-49df-9a50-cf89cdc0f1bb

Validation before submission: TypeScript checking, 67 unit tests and 32 desktop/phone browser tests passed. Expo web export passed. No native-device playthrough is claimed. This iOS artifact is for a Mac simulator, not an iPhone/TestFlight installation.

EAS warned that ios.infoPlist.ITSAppUsesNonExemptEncryption is not configured. Review the final encryption usage and App Store requirements before making this declaration. This warning does not establish a failed simulator compilation.

The build includes 1,448 questions, 25 player photographs, three player album chapters, 48 squad chapters, the letter board, saved collection progress, lion emblem, portrait sizing corrections and native ownership-update handling. Cartoons, content/rights approval, wider visual content, store setup and native acceptance remain pending. The old 0.2.0 APK does not include this full set of improvements.
