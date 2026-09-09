# Visual edition 0.2.0

## Corrected goal

The requested product is a visual football guessing game for Android and iOS: recognise players, identify clubs from badges, recognise stadiums, and enjoy responsive animation. Reliability work alone did not deliver that goal. The 0.2.0 changes make visual gameplay the first experience on opening the app.

## Implemented

- Replaced the opening text hero with a stadium-backed player spotlight, portrait cards and visual category tiles.
- Added 14 playable visual questions: five player photographs, six original club-badge puzzles and three stadium views. These are introductory sets at all selected difficulty levels; classic trivia retains its difficulty filtering. Total development bank: 174 questions.
- Added player gallery, badge and stadium modes to round creation, save hydration, Explore and history labels. Existing guest saves remain compatible.
- Added spring entrance transitions, pressed-card feedback, answer stamps and a result confetti animation. System reduced-motion preference disables the animated entrances and confetti.
- Added a two-column visual answer grid and a text-clue alternative. Image load failure falls back to text. Standard multiple-choice, hints, skips, typed player answers and save/resume remain available.
- Bundled artwork locally for offline play, with in-app photograph attribution, original-source and licence links. Added every question asset to the release-review register without inventing release clearance.
- Opened an interactive phone viewport at `http://127.0.0.1:8082/simulator`. This runs the actual Expo web build; it is explicitly labelled as a browser preview, not native emulation.

The visible version is 0.2.0. The earlier 0.1.0 APK does not contain this redesign and cannot update itself into it. Install the new build when it completes.

## Artwork provenance

Player photographs: Messi, Ronaldo, Mbappé, Salah and Haaland. Original files and licence/author metadata were retrieved from Wikimedia Commons; see `assets/visual/credits.json`. Downloaded player files are unchanged. Stadium photographs use Commons-generated resized thumbnails. Layout cropping is disclosed in credits. The relevant CC BY / CC BY-SA licence links remain accessible in the app. These copyright licences do not establish every likeness, trademark or commercial-publication permission.

Six badges are original code-drawn puzzles based on colours and visual clues. They are described as reimagined badges, not official club crests. Do not market this version as containing licensed official club logos.

The built-in image-generation service rejected a named-player cartoon request with a public-figure moderation response. No attempt was made to evade that restriction. The actual player mode uses the attributed photographs instead.

Wembley illustration: built-in image generation; no reference image supplied. Saved as `assets/visual/wembley.png`. It is an illustrative interpretation rather than a photograph or architectural survey.

Final generation prompt:

> Original premium mobile football game environment art, a dramatic night football stadium from pitch level at the corner flag, vivid emerald grass, crisp white field lines, enormous luminous roof arch curving high across the dark teal sky, packed stands suggested with tiny warm lights, cinematic stadium floodlights, stylised hand-painted 3D game illustration with gorgeous depth, landscape 3:2 composition, no people in foreground, no text, no logos, no sponsors, no watermark. Clearly show the huge single arch of London's Wembley architecture. This is a guess-the-stadium quiz illustration.

## Validation

TypeScript and 59 unit tests pass. All 24 browser cases pass on desktop/phone Chromium, including image loading, a complete correct player round, text alternatives, badge/stadium save-and-reload, reduced motion and narrow layout. Manually played a player question and inspected the badge layout in the visible in-app preview; refined the hero title and answer layout from that inspection.

Native builds of this edition were submitted under the previously approved Expo project:

- Android: `85a90d9c-dcc6-4d33-8227-0d7b2d129f05`
- iOS simulator: `8cde8dc3-6b1c-4c90-87f0-7b1e64d3249d`

The corrected iOS simulator build finished successfully at 10:59 UTC on 9 September, with appVersion 0.2.0. The Android build also finished successfully at 11:11 UTC, with appVersion 0.2.0. Preliminary builds were canceled after identifying visible stadium signage; these replacement builds include the close-up-before-answer fix. These IDs supersede the earlier readiness-only 0.1.0 builds for visual review.

## Local native emulator

No Android SDK/emulator or Java runtime was installed in the checked locations. Hardware checks show virtualization enabled and an active Windows hypervisor. Official Google command-line tools and a portable Microsoft OpenJDK 21 runtime were downloaded into the ignored `.expo/android-runtime` directory; Google's published SDK download SHA-256 was verified. No system PATH changes were made.

The SDK installer skipped emulator/platform-tools/system-image installation because its Android SDK licence had not been accepted. The user has been asked to approve that licence specifically. Do not describe the browser preview as native acceptance or accept the pending licence based on elapsed time.

## Next visual milestones

1. Complete native viewing and playthrough of this edition, including Android Back, offline restart, animation smoothness and large text.
2. Expand each visual category with independently reviewed material and a consistent rights-cleared illustration/photograph pipeline. Five portraits are a starter gallery, not competitor-scale content.
3. Add visual collection progress and reviewed themed sets with sufficient value for a purchase; validate repeat play before enabling monetization.
4. Add career-path reveals, more varied badge mechanics and stadium detail/zoom rounds after testing comprehension and accessibility.

Commerce remains disabled. Independent editorial approval, final asset clearance and purchase sandboxes remain public-release gates. Do not claim the entire competitor feature set is complete.
