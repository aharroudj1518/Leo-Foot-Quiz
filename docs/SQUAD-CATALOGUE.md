# Sourced squad catalogue

Imported 1,248 player records across 48 national squads from OpenFootball's
2026 World Cup archive, pinned to revision
`516d3825c3bd23fdc298c4014e84bde78f2d4965`. The original bytes, SHA-256 manifest
and CC0 licence are retained under `src/content/sources`.

`node scripts/import-squads.mjs` reproducibly creates one question per player:
identify a player from country, shirt number and listed club, or identify the
player's tournament club. IDs derive from country and normalized player name,
not file order. Existing non-squad questions remain intact. The main content
generator also preserves this catalogue. Total development bank: 1,428 questions.

The app provides country search, 48 chapters, solved counts and rounds that
exhaust unseen questions before offering replay. These are historical roster
questions, not current-club claims. No player images were added by this import.

Structural checks reject duplicate names/shirt numbers within teams, malformed
entries and invalid answer options. They do not establish factual accuracy.
Independent editorial approval remains false. Source positions and birth dates
were excluded from question generation; these unused fields require their own
checks before future use. The imported source is a community dataset, not FIFA
certification or an image/likeness licence.

Next: independently reconcile squad records with official tournament lists,
resolve corrections with per-item evidence, acquire coherent player artwork,
and extend question formats and women's-football coverage. The numeric total
alone does not satisfy the competitive-quality goal.
