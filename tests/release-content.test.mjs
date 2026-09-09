import { expect, it } from 'vitest';
import { contentHash, releaseIssues } from '../scripts/release-content.mjs';

function fixture() {
  const q = { id: 'sample', prompt: 'Which team won?', answer: 'Team A', options: ['Team A', 'Team B', 'Team C', 'Team D'], explanation: 'A test fixture.', hint: 'A clue.', era: '2000', source: 'https://example.com/fact', category: 'clubs', difficulty: 'starter' };
  return { bank: [q], editorial: { independentEditorialApproval: true, questions: 1 }, ledger: { schemaVersion: 1, questions: { sample: { status: 'approved', author: 'Author', reviewer: 'Editor', contentSha256: contentHash(q), verifiedAt: '2026-09-01', reviewBy: '2027-09-01' } } }, assets: { schemaVersion: 1, assets: [] } };
}
const check = f => releaseIssues(f.bank, f.editorial, f.ledger, f.assets, new Date('2026-09-09T12:00:00Z'));
it('accepts independently reviewed unchanged text content', () => expect(check(fixture())).toEqual([]));
it('invalidates approval when a fact or explanation changes', () => {
  const f = fixture(); f.bank[0].explanation = 'Changed after review';
  expect(check(f)).toContain('sample: content changed since review.');
});
it('does not invalidate review merely for key ordering', () => {
  const f = fixture(); f.bank[0] = Object.fromEntries(Object.entries(f.bank[0]).reverse());
  expect(check(f)).toEqual([]);
});
it('rejects self-review, expired review and impossible dates', () => {
  const f = fixture(), review = f.ledger.questions.sample;
  review.reviewer = ' author '; review.verifiedAt = '2026-02-30'; review.reviewBy = '2026-09-08';
  expect(check(f)).toEqual(expect.arrayContaining(['sample: distinct author and reviewer required.', 'sample: invalid verification date.', 'sample: review is expired or invalid.']));
});
it('blocks an undeclared portrait even if question review is current', () => {
  const f = fixture(); f.bank[0].assetIds = ['portrait']; f.ledger.questions.sample.contentSha256 = contentHash(f.bank[0]);
  expect(check(f)).toContain('sample: unknown asset portrait.');
});
it('requires commercial and both-platform image clearance', () => {
  const f = fixture(); f.bank[0].assetIds = ['portrait']; f.ledger.questions.sample.contentSha256 = contentHash(f.bank[0]);
  f.assets.assets.push({ id: 'portrait', status: 'approved', creator: 'Artist', reviewer: 'Rights reviewer', licenseEvidence: 'contracts/commission-001', territories: 'UK', commercialUse: false, platforms: ['ios'], likenessAndMarksAssessment: 'Recorded assessment', referenceImageAssessment: 'Recorded assessment', expiresAt: '2027-09-01' });
  expect(check(f)).toContain('sample: asset portrait lacks release clearance.');
  f.assets.assets[0].commercialUse = true; f.assets.assets[0].platforms.push('android');
  expect(check(f)).toEqual([]);
  f.assets.assets[0].expiresAt = '2026-09-08';
  expect(check(f)).toContain('sample: asset portrait clearance expired or undated.');
});
