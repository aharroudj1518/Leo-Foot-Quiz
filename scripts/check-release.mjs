import { readFile } from 'node:fs/promises';
import { releaseIssues } from './release-content.mjs';

if (process.argv.includes('--if-production') && process.env.EAS_BUILD_PROFILE !== 'production') {
  console.log('Content release gate: development/validation build; independent review still required for production.');
} else {
  const read = async name => JSON.parse(await readFile(new URL(`../src/content/${name}`, import.meta.url), 'utf8'));
  const [bank, editorial, ledger, assets] = await Promise.all(['questions.json', 'editorial-status.json', 'review-ledger.json', 'asset-register.json'].map(read));
  const issues = releaseIssues(bank, editorial, ledger, assets);
  if (issues.length) {
    console.error(`Content release blocked: ${issues.length} issue(s).`);
    for (const issue of issues.slice(0, 12)) console.error(`- ${issue}`);
    if (issues.length > 12) console.error(`- ${issues.length - 12} more. Complete the review ledger; see docs/CONTENT-RELEASE.md.`);
    process.exitCode = 1;
  } else console.log(`Content and declared image review passed for ${bank.length} questions. Native/store release gates remain separate.`);
}
