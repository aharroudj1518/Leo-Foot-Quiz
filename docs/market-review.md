# Leo Foot Quiz: market review and commercial direction

Research checked **5 October 2026**. This is a benchmark of relevant football quiz products and substitutes, not an exhaustive ranking of every app. Product facts below come from official sites or developer-maintained store listings; marketing claims have not been independently audited. No download, revenue or market-share estimates are assumed. This research did not include installing competitors' native apps or completing purchases.

## Recommended position

**“Follow the football. Prove what you know. Learn something every day.”**

Build a short, welcoming football habit around a sourced news quiz, clear explanations and friendly competition. Make the promise concrete: readers can see the event date, check the answer's source and tell when an edition is no longer current. Preserve the existing guest experience, optional timer and pass-the-phone family play.

News questions alone are not a unique selling point: Football IQ already advertises a topical quiz. The opportunity is the quality and consistency of the entire experience, especially for fans who enjoy football without memorising obscure player careers. Validate this positioning with users rather than advertising it as an industry first.

## Competitor evidence

| Product | Verified offer | Lesson for Leo |
| --- | --- | --- |
| [Who Are Ya? / PlayFootball.Games](https://playfootball.games/en-us/who-are-ya/) | Daily mystery player; eight guesses; blurred or hidden image; league variants, previous puzzles, streaks and score sharing. | A single obvious daily activity is easier to understand and share than a catalogue of modes. Define a comparable daily challenge clearly. |
| [Futbol11](https://futbol11.com/) and its [Grid](https://futbol11.com/futbol11-grid) | Multiple football puzzle formats; daily grids; four difficulty levels; optional 90-, 60- or 40-second timers; browser-saved statistics. | Difficulty and an untimed option are baseline expectations. Leo should keep both. Avoid trying to match the entire mode catalogue immediately. |
| [Football Grid / Daily Football Games](https://dailyfootballgames.com/games/football-grid/) | A 3×3 career-intersection puzzle; midnight UTC reset; league filters; guest play; account-based streaks and leaderboard. The site states every cell has at least five valid answers. | Publish answer rules and validate playable content before release. Club or competition preferences are useful future personalisation. |
| [Immaculate Footy / Sports Reference](https://www.sports-reference.com/immaculate-footy) | Indexed official rules describe nine total guesses and rarity scoring based on answer obscurity. Direct page access returned 403 during this review. | Multiple valid answers add replay depth. Defer rarity scoring until Leo has real aggregate data; do not invent “top 1%” comparisons. |
| [Football Quiz: Trivia game / BOLD CAT](https://apps.apple.com/us/app/football-quiz-trivia-game/id1533521575) | Store listing advertises 500+ questions, several modes, offline/online play, duels and elimination tournaments. The US listing shows a $2.99 ad-removal purchase and coin purchases. | Static questions face a large free supply. Explanations, polish and a reason to return matter more than increasing the counter. |
| [GetIn! FootballQuiz](https://apps.apple.com/gb/app/getin-footballquiz/id6475053785) | Developer describes solo, daily, asynchronous and same-room multiplayer formats, mini-leagues and saved question history. Weekly question-volume claims are marketing claims, not audited here. | Friends can become the retention loop. Start with easy result sharing, then test private leagues before building complex live multiplayer. |
| [Football IQ](https://www.football-iq.app/) | Site offers browser games including career paths, transfers and a topical quiz. Its Pro offer includes an archive and app-exclusive modes. | Fresh football content and archive monetisation already exist. Leo needs stronger execution and a defined audience, not a “first news quiz” claim. |
| [FourFourTwo Friday Football Quiz](https://www.fourfourtwo.com/quiz/friday-football-quiz-021026) | A recurring 20-question format, with a newsletter and membership features including badges and leaderboards. | Editorial cadence and distribution are part of the product. A recognisable weekly edition can become a recurring event. |
| [Guardian: On the ball](https://www.theguardian.com/gnm-press-office/2025/oct/01/game-on-the-guardian-launches-new-daily-football-quiz-in-expansion-of-puzzles-hub) | A daily footballer guessing game in the Guardian app. | Publishers also compete for fans' daily attention. |
| [Sporcle](https://support.sporcle.com/hc/en-us/articles/33897795822989-Understanding-different-quiz-types-and-formats) | Official documentation lists typed, clickable, grid, multiple-choice, ordering and image-based quiz formats. | Add format variety only where it improves the underlying football challenge. |

Public reviews visible on the BOLD CAT and GetIn! listings include complaints about frequent advertising. Those individual reviews are qualitative signals, not a representative survey. They support testing an uninterrupted first round; they do not establish competitors' current ad frequency.

## What the uploaded app already has

The baseline source contains 160 questions: 48 World, 37 Clubs, 20 Players, 15 Rules and 40 Legends. It already provides explanations and source links, three difficulties, optional timing, local progress, missed-question revision, a daily mode, family turns and a Legends preview. These are valuable foundations.

The baseline has no news ingestion service. `src/content/editorial-status.json` labels the bank as a development bank and records no independent editorial approval. `src/services/billing.ts` deliberately blocks commerce until editorial approval and commerce configuration are present. The 40-question Legends pack should remain a transparent, finite purchase; it does not by itself justify an ongoing subscription.

Code inspection establishes these features exist, not that every flow or factual answer has been independently validated. Implementation and test results should be tracked separately from this research document.

## Priorities

1. **Ship a believable current-football experience.** Give news its own entry point and dated editions. A short editorial round should contain original questions, plausible distractors, explanations and direct source links. Display the actual coverage date and expiry status. When content is old or unavailable, present a dated archive or evergreen practice; never relabel old content as today's news.
2. **Make the daily habit fair and reliable.** Use a stable edition identity, preserve it across devices/builds where supported, and prevent accidental duplicate rewards. Explain whether difficulty changes the questions. Share the edition and difficulty with the score so friends compare like with like. Keep reading time outside any optional answer timer.
3. **Use learning as a retention feature.** After a round, show what the player learned and offer review of mistakes. Keep hints useful and separate assisted performance from unassisted competitive scores.
4. **Prove willingness to pay for a concrete pack.** Preview several questions, show the exact pack size and charge once. Use store-provided local prices, tested restoration and verified entitlements. Do not charge for access until the content and purchase path are ready.
5. **Then test social and club identity.** Personalised club/competition rounds and private weekly leagues are promising hypotheses. Keep the global daily challenge identical within its advertised cohort. Build online ranking only with server-side answer validation and abuse controls.

Avoid spending the next development cycle on cash prizes, many cloned puzzle modes, aggressive interstitial ads or a subscription with no funded editorial service behind it. Each adds operating cost or complexity before the core habit is proven.

## News sourcing and publication

Use a small editorial pipeline: source discovery → fact verification → original question drafting → second-person review → schema checks → scheduled publication → correction/expiry. AI can assist drafting but should not decide unverified current events are true. Record the event date separately from the article publication date; use explicitly dated wording for changing managers, transfers and records. Confirm results after the event has finished and transfers after official confirmation.

Every published news question should retain its ID, edition, source URL and publisher, event date, publication date, verification date, review state, answer/aliases, explanation, available-from date, expiry date and correction history. Published scored editions should be immutable; corrections should be versioned, affected questions withdrawn where necessary, and score implications explained.

For the first release, a reviewed bundled edition is workable if clearly dated. For a continuing service, publish validated, versioned JSON from a controlled backend/CDN, cache the last valid edition, enforce expiry and keep an evergreen fallback. Provider credentials belong in the backend, never an `EXPO_PUBLIC_` variable. Reject malformed content before it becomes playable. A changing date badge is not a news service.

| Source option | Appropriate use and verified constraints |
| --- | --- |
| [Premier League news](https://www.premierleague.com/en/news), [UEFA news](https://www.uefa.com/uefachampionsleague/news/) and official club announcements | Useful primary references for verifying individual events. Public readability is not a commercial feed licence. [UEFA terms, section 6](https://www.uefa.com/termsconditions/) limit content use and expressly prohibit systematic collection and scraping. Do not build an automated UEFA scraper or reuse article text/images. |
| [Guardian Open Platform](https://open-platform.theguardian.com/access/) | Provides a news API. Its developer access is for non-commercial use; commercial products, including products derived from the journalism, require commercial access. Request an appropriate agreement before using it as Leo's production source. |
| [football-data.org](https://www.football-data.org/about) | A candidate for structured match facts. Published terms require visible attribution and separate rights for graphics; they also restrict continued reference to supplied data after cancellation. Confirm the proposed quiz/archive use, retention rights, competitions and current plan terms before integration. |
| [API-Football](https://www.api-football.com/terms) | Broad structured-data candidate, but its terms explicitly say it does not grant publication licences or competition commercial rights. Confirm required rights; an API subscription alone is insufficient evidence of permission. |

Use original wording and owned artwork; do not copy competitors' question banks, headlines, player photos or club crests. Source attribution aids verification but does not replace permissions. Agree the production licence and archive rights before committing to a paid continuously updated product.

## Commercial plan and measurements

Keep the daily quiz and core practice free. First test a one-time Legends or competition pack with an honest free preview. **Pricing hypothesis:** test local equivalents around £2.99–£4.99 with adult buyers; this range is a proposed experiment, not evidence of demand. Test one clearly described offer at a time. A paid archive, family pack or season pass should follow only if players return and the content service can be sustained.

Recruit a small, explicitly opt-in pilot with adult football fans and families. Observe time to first answer, round completion, explanation use, repeat visits, result sharing and reasons for abandoning a round. Do not assume an adult-targeted pricing experiment permits advertising or analytics to children. Preserve the current guest/local-first experience unless the collection model is deliberately changed and disclosed.

Instrument or manually record the following with appropriate consent and minimal data:

- Activation: first round completed / first round started.
- Retention: first-time players returning on day 1 and day 7; report cohort size alongside percentages.
- News value: news start-to-finish rate, source opens, corrections per published question and percentage of days with a fresh verified edition.
- Acquisition: share actions and attributable invited starts, distinguishing a share-sheet open from a confirmed share.
- Commerce: preview-to-offer rate, adult offer-to-purchase rate, restores, refunds and support requests.
- Unit economics: net store receipts minus store fees, taxes where applicable, refunds, licences, hosting, editorial time and support. Include content production time even when the founder does it.

Set success gates after collecting a baseline; do not present invented retention numbers as industry benchmarks. Pause paid acquisition when measured contribution per acquired payer cannot cover acquisition and ongoing service costs. A profitable small quiz product needs retained users and sustainable editorial economics, not merely more downloads.

## Suggested next release sequence

**First testable release:** dated news rounds with source/explanation review, stale-content fallback, dependable resume, understandable daily scoring and natural mobile sharing. Keep existing free play and the gated pack preview.

**Before taking money:** independently review the sold bank, verify the actual store product/entitlements, exercise purchase/cancel/restore flows in sandbox on iOS and Android, settle content rights, and establish a support/correction channel. A web preview cannot validate native billing.

**After retention is demonstrated:** choose between private leagues, club personalisation and expanded paid packs using pilot evidence. Add an ongoing subscription only with a reliable content schedule, cancellation support and a product players demonstrably use over time.
