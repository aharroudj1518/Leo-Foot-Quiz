# Publishing Matchday briefings

The current release includes one original, source-checked development edition. Evidence, exact URLs and date limitations are in [news-research.json](news-research.json). It is not a live news scrape, and independent editorial approval remains false.

## Content contract

Use [src/content/news.json](../src/content/news.json) as the working example. A feed has `version: 1` and at most 12 editions. Each edition requires:

- A stable unique `id`, a short `title`, and a neutral `summary` that does not disclose the answers.
- `publishedAt` and `expiresAt` as UTC ISO timestamps. Expiry must be after publication and no more than 14 days later. Before publication an edition is hidden; at expiry it becomes a playable archive.
- Exactly five questions with unique `news-` IDs, four distinct answer options, one accepted correct option, explanation, hint, category, difficulty, era, HTTPS source link and publisher `sourceName`.
- An article `publishedAt` and/or `updatedAt`. A calendar date is allowed when the publisher does not supply a time. An update date must be labelled as an update; never invent an original publication date. Neither source date may postdate the edition's publication.

Question text should anchor a changing fact to an event date. News questions are free: `premium: true` is rejected. Schema validation is necessary but cannot establish that football facts are correct.

```sh
npm run content:check
node scripts/validate-news.mjs path/to/proposed-feed.json
```

These commands work without npm dependencies on Node 24. They print current/archive/upcoming status using the actual clock.

## Connect updates

1. Review the sources and original question wording. Confirm results and official transfers; do not quiz rumours as facts. Record correction decisions and get another editor to check the answers and distractors.
2. Publish validated JSON on your controlled HTTPS host/CDN. Serve `Content-Type: application/json`; enable CORS for the web app (or `*` for this public, credential-free feed). Keep payloads under 1 MiB. Use a short cache lifetime, for example five minutes. Use the final URL directly; redirects are not supported by the client.
3. Set `EXPO_PUBLIC_NEWS_FEED_URL` in the app's build environment and rebuild. This variable is public. Never put a provider key or secret in it.
4. In the app, open **All briefings → Check for new editions** and complete the existing adult step. Fetches are on demand; there is no background tracking or automatic request during free play. Failed checks retain the previous valid cache. A successful response is persisted before it is shown.
5. Use fresh edition and question IDs for corrections. Existing IDs are immutable while retained in the feed. Keep your publisher's permanent ID/correction registry: the device's bounded feed cache cannot police IDs that have already aged out. Remove a withdrawn edition from future feeds. Existing sessions retain their original snapshots; already-delivered factual errors may require a separate app correction notice.

The app intentionally does not generate or publish news automatically. A sustainable commercial release needs an editor, a content schedule and appropriate source/feed rights. The [market review](market-review.md) describes researched provider restrictions and operating costs.

## Offline and failure behaviour

- Bundled and previously cached editions play without a connection.
- An expired edition is labelled archive; its historical facts remain playable.
- Future editions are not offered early.
- Malformed JSON, invalid sources, duplicate IDs, overwritten editions, oversized downloads and request timeouts cannot replace a valid cached feed.
- Active rounds and completed results store question snapshots. The newest classic bank wins for new rounds; active rounds and result review use their original wording.
- The app retains the most recent 100 completed rounds. Older news questions can leave the local learning archive after their snapshots are evicted; only available mistakes are offered for revision. Daily completion dates are retained separately for streaks.
- Device clock changes affect local publication/streak dates. These are personal scores, not a verified competitive leaderboard.

Set `EXPO_PUBLIC_APP_URL` to a real public app/store page to include a destination in shared scores. Leave it blank until that destination exists; no placeholder URL is shown.
