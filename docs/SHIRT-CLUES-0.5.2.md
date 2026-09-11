# Shirt clue presentation 0.5.2

The Champions League shirt-number clue now shows an original unbranded jersey illustration with collar, sleeves, seams and a prominent number. Club and position remain explicit. It uses existing React Native primitives and Expo LinearGradient, with no new dependencies or remote images. The existing Reveal transition respects system reduced-motion settings. Screen readers receive the shirt number as an image label; decorative number text does not scale or duplicate the label.

The former number-only block is replaced in both quiz rounds and mistake review. Standard visual answer choices now form a reliable two-column grid even at 320 pixels. The previous 48% widths plus a 12-pixel gap exceeded the available width at that size. Flexible bases leave space for the gap. Large-text mode uses full-width answer choices for shirt, photo, badge, stadium and club-connection questions. The duplicate season caption above shirt clues is removed.

Validation: TypeScript and web export passed. Sixteen related desktop/phone browser tests passed, covering complete portrait rounds, badges, stadiums, connections, competition navigation, shirt-number accessibility, small-phone bounds, large text, scoring and reload persistence. Standard/large-text phone screenshots were inspected. This is browser verification, not physical-device acceptance.

The release includes the preceding 555-question Premier League expansion (1,802 questions total). Player cartoons, greater photographic breadth and commercial launch readiness remain incomplete. This original shirt drawing is not a substitute for player portraits or licensed official kits.

Deployment and native build status will be recorded once verified.
