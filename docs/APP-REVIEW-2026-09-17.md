# App review and proposed redesign — 17 September 2026

Status: combined design approved and implemented on 17 September 2026. Existing uncommitted work was preserved. The baseline findings below describe the app before implementation; delivery results follow.

## Delivered changes

- Blue stadium shell, bold sans-serif typography, gold player/club frames, teal quiz screens, substantial answer controls and striped green lineup pitches. Applied across home, competitions, clubs, quizzes, album, results, learning, settings and supporting screens.
- All 114 club chapters now contain 10–16 active facts, with at least eight non-roster clues and at least three topics. Added 754 canonical facts across 96 club packs. The playable club catalogue contains 1,380 active question variants, representing 1,171 distinct facts.
- Retired 1,124 repetitive questions from new rounds. All 1,596 previous club definitions retain their original payloads in the bank, so existing sessions and mistake reviews still resolve. Retirement and topic metadata do not rewrite saved question meanings.
- Normal club rounds alternate topics and allow at most two roster clues, never adjacent. Full-bank fact tracking prevents duplicates across competitions; the Como stadium alias case has a concrete regression check. Unseen remnants remain short rather than being padded with repeats. Explicit review can still use retired questions, and daily selection stays independent of personal history.
- Updated obsolete browser expectations and added archived-save and long-name narrow-screen coverage.

### Final verification

- TypeScript and 146 unit tests across 25 files passed.
- Latest full browser run: 78/80 passed; the remaining two were a new test expecting the photo-only “NAILED IT” stamp on a shirt question. Corrected it to assert the accepted answer state. All four new browser tests then passed on desktop and phone. The combined result covers all 80 browser checks; there were no application changes between these runs.
- Web export and Android Hermes bundle export succeeded. Android output: `.expo/android-redesign`. This is a JavaScript/assets export, not a newly signed APK or physical-device acceptance.
- Inspected phone screenshots for home, quiz, clubs, player letters, lineup, album, learning and settings, plus desktop home. Browser checks cover 320-pixel width, large text, reduced motion, progress persistence, daily play, sound/timing settings, purchase entry, source clues and all existing modes.
- Separate content and app specification/code reviews found no remaining actionable issues. Content source sampling checked twelve facts from six clubs. New fact sources include 121 primary-source references and 633 researched encyclopedic references; every question retains its source. This is not independent editorial verification of all football facts.
- No production deployment, purchase transaction, commit or APK publication performed. Local changes remain available for review alongside the user's pre-existing changes.

## Scope and evidence

Reviewed the Expo 57 / React Native application, shared styling, navigation, quiz selection, content generators, bundled question bank, player album, club archive, lineup detective, daily challenge, collections, learning, settings, results and purchase entry points. Compared the running web build at a 390 × 844 phone viewport with all twelve supplied references. Ran TypeScript, unit tests, web export and the desktop/phone browser suite. This is not physical Android/iOS device acceptance or independent verification of every football fact.

The screenshots are visual references. Their text is not an instruction to add currencies, adverts, timers for lives, locks or other new mechanics.

## Principal findings

1. **The visual language does not match the references.** Cormorant serif faces are applied to all text, including tiny labels and letter tiles. Pale mint backgrounds, fine text and restrained panels make the current experience feel editorial rather than like a football game. The references favour bold sans-serif lettering, stadium backgrounds, saturated blue/teal, gold frames, large artwork and raised controls.
2. **Question variety is a content problem as well as a selection problem.** Of 1,873 playable questions, 1,596 belong to club chapters. 722 share the prompt “Who wears this shirt?”. Premier League chapters contain 575 player-list questions. Rephrasing those prompts alone would not solve the repetition.
3. **Cross-competition duplication bypasses seen tracking.** There are 70 exact prompt-and-answer duplicate groups in the playable bank. Club-history generation copies facts to different competition-specific IDs. Selection tracks IDs, so an already encountered fact can return under another club chapter.
4. **Club coverage varies dramatically.** Every Champions League chapter has three history and three shirt questions. Twenty-nine domestic chapters have fewer than three questions, while some other chapters contain nearly forty. Several three-question history packs also revolve around one match, rather than different aspects of the club.
5. **The club scheduler has only two buckets.** `interleaveClubStories` alternates history with everything else for a single club. Once history runs out, a long series of roster questions is still possible. It cannot balance grounds, identity, trophies, managers, records and player clues independently.
6. **Existing browser tests have stale expectations.** Barcelona, Milan, Juventus and Bundesliga checks expect the old shirt-image accessible name. The rendered clue now includes the club and colours. The mistake-review check still expects 70 portraits although the catalogue contains 86. These tests must be brought into line with meaningful current UI contracts.

## Content inventory

| Competition | Clubs | Questions | History | Shirt clues | “Listed” wording | Questions per club |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Champions League | 36 | 216 | 108 | 108 | 0 | 6 |
| Premier League | 20 | 608 | 15 | 0 | 575 | 24–37 |
| La Liga | 20 | 81 | 15 | 27 | 20 | 1–32 |
| Serie A | 20 | 111 | 16 | 55 | 20 | 2–33 |
| Bundesliga | 18 | 580 | 12 | 532 | 18 | 29–39 |

“Listed” counts include ground-table wording and are not exclusively player questions. Shirt prompts repeat the mechanic but have different visual clues; the 70 duplicate groups additionally share their answers. Neither number alone measures semantic duplication exhaustively.

## Screen-by-screen direction

| Area | Current gap | Proposed change; retained behaviour |
| --- | --- | --- |
| App shell and home | Pale page, small serif labels, long stack of competing entry points | Stadium-blue shell, bold Leoqo identity, compact progress display, strong illustrated mode tiles; retain all existing entry points |
| Competition selection | Teal hero and plain league cards | Gold-edged competition artwork with prominent club selection; retain five competitions |
| Club archive | Long white rows and thin progress tracks | Crest-led level-style rows with substantial progress bars and completed states; retain search, league switching and unfinished filter |
| Club/history quiz | Small crest header and vertically stacked answer controls | Large central club/trophy panel, teal backdrop and two-column answers when space permits; retain source, explanation, hint, skip and save/leave |
| Player quiz | Rectangular photo with small serif letter tiles | Gold-framed player card, chunky white letter tiles, blue slots and clear action buttons; retain names, aliases, typed answers, multiple choice and text alternatives |
| Badge and stadium quiz | Uses the same understated presentation | Larger clue artwork and substantial answer tiles; retain original crest/photo assets and credits |
| Club connections | Flat text board | Match the blue/gold card style while keeping all career clues and existing scoring |
| Player album | Small rectangular photos | Collectible-card presentation for the existing three chapters; retain earned names and completion |
| Lineup detective | Flat teal pitch with a halfway line and circle | Alternating green pitch stripes, complete pitch markings, circular flags, teal controls and clearer reveal labels; retain all 36 puzzles, hints, pagination, answer aliases and sharing |
| Daily and collections | Small labels and thin tracks | Visible gold progress tracks and completed states using real saved data; retain the five-question daily and UTC reset |
| Results and learning | Functional but visually restrained | Gold result treatment, larger score and readable history/review panels; retain mistakes, replay, career totals and family scores |
| Settings, privacy, shop, adult step, credits | Separate utility-looking pages | Consistent shell and readable panels; preserve settings, purchase availability, restoration, export and existing adult checks |

## Design alternatives

**Recommended: combined reference style.** Blue stadium and gold cards for home, albums, club selection and results; teal for quiz surfaces; green pitches for lineup puzzles. This gives each mode an appropriate presentation while using shared type, buttons, spacing and navigation.

**Alternative: blue and gold throughout.** The most cohesive arcade look, but a looser match to the teal question and lineup references.

**Alternative: teal and green throughout.** Closest to the lineup examples and simpler to implement, but less like the collectible-player-card references.

## Proposed content amendment

- Replace repetitive roster membership items with a curated mix of club identity, stadiums, major honours, memorable matches, managers, records and players. Verify new facts against official club, competition or governing-body sources and keep dated wording for changing facts.
- Target at least ten distinct facts for each playable club chapter. Expand thin chapters before describing them as full-length rounds. Avoid filling the bank with trivial rewordings of the same event.
- Introduce topic and canonical-fact metadata. Competition-specific presentation may remain, but one fact should not be treated as new merely because its ID changes.
- Target at most two roster/shirt clues in a normal ten-question club round, without consecutive questions of that type. Prefer unseen facts and balanced topics. If fewer suitable unseen facts remain, offer a shorter round or explicit replay rather than silently padding with duplicates.
- Keep archived question definitions available for saved sessions and mistake review. Do not reassign an old ID to a different fact. Preserve solved progress and resume behaviour during the content transition.
- Update content generators as well as JSON outputs so later imports cannot restore the repetitive bank.
- Keep daily selection deterministic across player history, settings and purchases. Explicit mistake review must still surface the requested question.

## Implementation and validation contract

Use the existing Expo/React Native stack and bundled assets. Change shared tokens and typography first, then mode-specific artwork and layout. Keep readable contrast, reduced-motion handling, large-text support, touch targets and narrow-screen wrapping. Use green plus a check for correct answers and red plus an error marker for wrong answers.

Preserve practice, daily, family play, difficulties, hints, skipping, optional timing/sound, text clues, typed-name tolerance, letter controls, album chapters, collections, club search/filtering, lineup progress, saved rounds, mistake review, source reporting, exports, purchase flows and credits. Reference currencies, life limits, reward adverts and locks are not part of this redesign.

Acceptance requires type checks and unit tests; targeted content tests for semantic duplicates, topic balance, stable daily selection and legacy saves; browser coverage for all existing flows on phone and desktop; visual inspection at narrow and normal phone widths with large text; and a fresh native build/device check before claiming Android/iOS readiness.

## Baseline verification

- TypeScript: passed.
- Unit tests: 134 passed across 23 files.
- Web export: passed; Expo reported forcing its process to exit after writing the export.
- Desktop and phone browser suite: 66 passed, 10 failed in 2.5 minutes. The failures are the four stale shirt-label expectations and the stale portrait-count expectation described above, each repeated on desktop and phone. Their later assertions were not reached, so those flows are not fully verified by this run.
- Review captures: `.expo/review-home-settled.png`, `.expo/review-clubs.png`, `.expo/review-quiz.png`, `.expo/review-player.png`, `.expo/review-lineup.png`.
