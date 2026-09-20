# Progress release 0.4.1

This release combines three tested follow-ups to the fifty-player 0.4.0 gallery:

- Familiar typed player names and explicit clarification for shared surnames, without consuming an attempt.
- Durable daily completion dates and the latest daily result, plus a seven-day activity card and consecutive-day streak.
- Durable recorded round, answer and correct-answer totals, so the learning screen no longer stops at 100 rounds or computes overall accuracy solely from the recent-history window. Topic form is explicitly labelled as based on recent completed rounds.

Totals update on completed rounds, not unfinished questions. Repeating the completion transition cannot add another round. If a known session ID is replaced, the existing result is adjusted rather than counted twice. Older saves derive totals from their retained completed sessions; results already discarded by older versions cannot be recovered or estimated. Malformed totals are rejected without silently erasing progress.

The question and image counts remain 1,476 questions, 50 player photos, six stadium clues and six badge puzzles. Cartoons, commercial/editorial clearance, store products and real device acceptance remain outstanding. Commerce stays disabled.

Validation includes a 125-round regression that preserves 125 recorded rounds and 20% accuracy after the oldest 25 correct rounds leave recent history. Daily retention, typed answers and the full existing game flows are also tested. Native and web release jobs must be recorded from their actual completion status; this document alone is not build evidence.

## Native build-hook correction

The first Android 0.4.1 job (5d45b910-7665-4ee8-92e5-c7ceee82a747) failed in POST_INSTALL_HOOK because plain Node could not resolve the extensionless ./daily import from quiz.ts. The iOS job (230a0bf5-b571-4303-8be3-f13d82d88730) also reached a terminal post-install error. Both failures were verified before retrying.

The core import now explicitly names daily.ts, with TypeScript's allowImportingTsExtensions enabled under Expo's noEmit configuration. The validation hook passes directly in Node 22.20.0. A child-process regression test runs that exact hook outside Vitest's bundler resolver. The full 81-test unit suite plus the new hook test pass; TypeScript and Expo web export pass. The production content gate still executes and rejects the unapproved catalogue, so the fix does not bypass release review.
