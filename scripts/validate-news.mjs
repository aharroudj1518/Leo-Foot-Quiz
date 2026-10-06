import {readFileSync} from 'node:fs';
import {parseNewsFeed, getEditionStatus} from '../src/core/news.ts';
import {validateBank} from '../src/core/quiz.ts';

const file = process.argv[2] ?? 'src/content/news.json';
try {
  const feed = parseNewsFeed(JSON.parse(readFileSync(file, 'utf8')));
  const errors = validateBank(feed.editions.flatMap(edition => edition.questions));
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Validated ${feed.editions.length} edition(s). Schema checks do not verify football facts.`);
  for (const edition of feed.editions) console.log(`${edition.id}: ${getEditionStatus(edition)} · ${edition.questions.length} questions · expires ${edition.expiresAt}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'News validation failed.');
  process.exitCode = 1;
}
