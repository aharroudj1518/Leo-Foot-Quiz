# Durable daily progress and activity card

Daily completions no longer depend solely on the last 100 ordinary rounds. Finishing a round preserves the unique completed UTC dates and the latest complete daily result before recent history is trimmed. Viewing that result does not replace an unfinished practice session.

Older saves migrate completed daily rounds still present in their history or saved session. Dates already lost by older history trimming cannot be reconstructed and are not invented. A malformed daily date or saved result is rejected instead of silently resetting progress. Stored dates are deduplicated; finishing the same day again never adds another day.

The home card shows the last seven UTC dates, completed marks, today's outline when unfinished, the daily reset time and the current consecutive-day streak. An unfinished today keeps yesterday's streak available until the day ends. Missing a full day resets the current streak; future dates do not extend today's streak. A completion streak records participation, not a perfect score, and provides no monetary reward.

The saved data adds one compact date per completed day and one retained daily result. It does not retain an unlimited full session history or send anything to a server.

Validation: TypeScript and all 77 unit tests pass. Regression coverage completes a daily round followed by 100 practice rounds, reloads the save and verifies the original result and streak. It also covers migration, duplicate days, missed days, month boundaries and invalid leap dates. All 26 relevant phone/desktop browser checks pass, including the new three-day activity strip, result reopening beside an unfinished practice round and UTC-midnight rollover. The 360px card screenshot was visually reviewed. Expo web export succeeds.

This patch follows the typed-answer update on the preview branch. The main website and downloadable native packages remain at the previously tested 0.4.0 source until the next combined release is published.

Release update: this feature is now live on the main web URL in 0.4.1. Corrected native 0.4.1 jobs are tracked in NATIVE-BUILDS-0.4.1.md; completion is not yet claimed.
