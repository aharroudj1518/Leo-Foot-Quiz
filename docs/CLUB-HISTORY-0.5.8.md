# Club history and authentic identities — 0.5.8

12 September 2026

Champions League club rounds now contain three independently worded, source-linked history questions and three selected current-player shirt clues per club. The previous mass-produced nationality/list-membership questions were removed. Each of the 36 clubs starts with a history question and alternates history with player clues; the six-question collection finishes without padding it with repeat questions. Normal unseen-question and explicit replay rules remain in place.

There are 108 new historical questions across the Champions League clubs. Stories also appear in matching domestic chapters, with four additional Milan questions: 166 history entries across the catalogue, 1,596 competition questions and 1,873 questions overall. Topics include memorable finals, legendary scorers, managers, trophy milestones, club origins and former players. Every answer includes an explanation and its reference link. Original question wording and source URLs are maintained in scripts/build-club-stories.mjs; regeneration is build-club-stories, import-club-season, then add-visual-content.

All 114 club entries have locally bundled real crests. Champions League marks come directly from UEFA, with the other club marks sourced from the football-logos repository. Import mappings and PNG SHA-256 values are recorded in assets/crests/manifest.json. Crests appear in the club list, history header, numbered-shirt clue, six badge puzzles and solved lineup result. All load offline. The previous code-drawn badge designs and their descriptions were replaced.

Shirts now illustrate each club’s traditional home identity: colours, stripes, hoops, halves, contrasting sleeves, a sash, a centre panel or a cross. These are club-colour illustrations, not manufacturer-exact 2026/27 replicas, including when the question names a goalkeeper. Every catalogue club has an explicit kit mapping. The Milan number 96 example now shows red-and-black stripes and the real Milan crest.

Cormorant fonts and the teal/magenta/yellow palette are retained. Purchase availability remains disabled for this Android validation build. Existing production review records were not represented as approved.

Validation: TypeScript and 134 unit tests passed. Twenty distinct desktop/phone browser checks passed, including narrow-screen standard/large-text shirts, Milan’s number 96, actual crest loading, history-first rounds, saved answers, lineup recovery and the full portrait round. Earlier test-only failures were resolved by replacing stale 70-portrait selectors with the actual catalogue count and selecting an available two-digit shirt fixture. Screenshots are retained under .expo/milan-club-shirt-*.png, .expo/club-history-*.png and .expo/real-crest-*.png.
