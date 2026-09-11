# Testing on an actual iPhone

The `validation` profile produces a Mac simulator archive. It cannot be installed on an iPhone. The `device-validation` profile inherits internal distribution, Node 22.20.0 and disabled commerce, but sets `ios.simulator` to false. It is an ad hoc device build, not a TestFlight submission or public release.

Before building, confirm an active paid Apple Developer membership and access to its signing team. Register the testing iPhone with `eas device:create`; the owner must open the resulting registration link on that device. Then run `eas build --platform ios --profile device-validation` interactively so EAS can include the selected device in the provisioning profile. Do not collect Apple passwords or two-factor codes in chat; authentication belongs in the secure account flow.

Only phones included in the signing profile can install the resulting IPA. Registering another phone requires a refreshed profile and rebuild or re-sign. Do not assume a simulator build, an Android APK, or a successful compile proves iPhone installation. Verify launch, portrait loading, a complete quiz, save/relaunch, audio and large text on the actual phone.

No device was registered and no signing credentials were created while preparing this configuration. Owner membership information is pending. For TestFlight, App Store Connect and the applicable store submission, content and encryption requirements remain separate; this profile does not satisfy them.

Reference checked 11 September 2026: https://docs.expo.dev/build/internal-distribution/
