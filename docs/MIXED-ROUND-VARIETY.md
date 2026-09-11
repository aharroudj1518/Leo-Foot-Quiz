# Mixed round variety

The current free Fan pool contains 2,241 questions, of which 2,096 are squad questions. Sampling directly from that pool made general play overwhelmingly squad trivia.

Mixed rounds now interleave available categories in a seeded order after applying difficulty, purchase eligibility and unseen-question filtering. A fresh Fan round covers all nine available categories within ten questions. The daily five covers five categories and remains identical across difficulty, seen history and purchase ownership for the same seed and content bank. Starter and Expert rounds retain their difficulty filters and rotate among the topics available at those levels.

Seen questions are never introduced solely to fill a missing category. A short unseen pool remains short; if all unseen questions belong to one category, that category is used. Explicit topic and club rounds, saved sessions and mistake revision retain their existing selection behavior. Already completed daily results remain stored; the new selection applies to newly created rounds.

Validation: 103 unit tests, TypeScript, web export and ten phone browser checks passed. New regression checks run thirty seeds against the real imbalanced catalogue, verify deterministic free daily variety, and verify that exhaustion cannot reintroduce seen questions.

This change is later than the source submitted for Android 0.5.4 (`eb7adf1`) and is not included in that existing job. Do not restart that build merely to include this change.
