# Player answer acceptance

Gallery questions now carry explicit accepted short names from src/content/player-aliases.json. Surnames, common spellings and selected nicknames can be entered without typing the full displayed name. Existing accent, punctuation, whitespace and case normalization remains in use. Arbitrary misspellings are not accepted.

The generator compares normalized names across the full gallery. If an alias belongs to more than one player, it is recorded as ambiguous rather than accepted. Ronaldo is shared by Cristiano Ronaldo and Ronaldo Nazário. The typed flow asks for a more specific name; no answer, seen item, mistake or solved progress is written at this step. CR7 and R9 resolve the respective players. The optional round timer still runs, as it does while editing any answer.

References for nicknames: UEFA uses CR7 for Cristiano Ronaldo at https://www.uefa.com/uefachampionsleague/news/0253-0d81fbde63ad-f5b196790e3d-1000--cristiano-ronaldo-tous-ses-records-uefa/ . Ronaldo's R9 name is documented at https://en.wikipedia.org/wiki/Ronaldo_(Brazilian_footballer) . The remaining entries are shortened or alternate forms of the stored player names. These are answer acceptance rules, not independent editorial or commercial clearance.

Validation: TypeScript and 72 unit tests pass. The 28 relevant desktop/phone browser tests pass, covering typed surnames, saved-answer reload, ambiguous-name clarification, nickname resolution, complete visual rounds and existing game flows. The previous 0.4.0 APK and live deployment do not contain this follow-up patch; it is prepared for the next combined release.

Release update: this feature is now live on the main web URL in 0.4.1. Corrected native 0.4.1 jobs are tracked in NATIVE-BUILDS-0.4.1.md; completion is not yet claimed.
