# Fifty-player gallery — 11 September 2026

Version 0.4.0 doubles the gallery from 25 to 50 distinct player photographs. It adds 15 World stars, five Game changers and five Greats, bringing the chapters to 26 / 12 / 12. Total question count is 1,476, including 62 visual questions (50 portraits, six badge puzzles and six stadium clues). The separate club-connections mode has six puzzles. The 1,248 squad questions remain the majority of the bank.

Each new image was downloaded from Wikimedia's image service with its file page, creator, licence, image URL, retrieval date and SHA-256 recorded in assets/players/manifest.json. Source files are unmodified; the app uses layout sizing. Public-domain records link to the file page that explains the status. The Austria-specific CC BY-SA 3.0 licence was checked against https://creativecommons.org/licenses/by-sa/3.0/at/deed.en.

All 25 additions were visually inspected for visible faces and no answer-name captions. Accessible descriptions describe the actual image, and historical wording avoids current-team claims. Visual suitability is not independent editorial approval, likeness/trademark clearance, or store-release approval. Commercial flags remain false. These photos do not fulfil the separate cartoon requirement.

The importer now resumes missing roster entries without overwriting existing reviewed files and verifies their hashes before downloading anything. Re-running after this batch reports that all roster portraits are already imported. The visual content generator also creates the static native image map from the reviewed manifest.

Validation: TypeScript and 69 unit tests pass, including file integrity, attribution links, unique image hashes and same-chapter answer alternatives. All 38 desktop/phone browser tests pass, including loading every portrait across all three chapters, a complete typed-name round, reload persistence, visual mistake retries and narrow-screen layout. Expo web export succeeds. Native cloud build and production promotion evidence must be recorded separately; these browser checks do not prove native-device acceptance.
