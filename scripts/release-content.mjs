import { createHash } from 'node:crypto';
import { validateBank } from '../src/core/quiz.ts';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
export function contentHash(question) {
  return createHash('sha256').update(JSON.stringify(canonical(question))).digest('hex');
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : null;
}
function text(value) { return typeof value === 'string' && value.trim().length > 0; }

export function releaseIssues(bank, editorial, ledger, assets, now = new Date()) {
  const issues = [];
  const today = now.toISOString().slice(0, 10);
  if (!Array.isArray(bank)) return ['Question bank must be an array.'];
  try { issues.push(...validateBank(bank)); }
  catch { issues.push('Question bank contains malformed records.'); }
  if (editorial?.independentEditorialApproval !== true) issues.push('Independent editorial approval is missing.');
  if (editorial?.questions !== bank.length) issues.push('Editorial question count does not match the bank.');
  if (ledger?.schemaVersion !== 1 || !ledger.questions || typeof ledger.questions !== 'object') return [...issues, 'Review ledger is missing or unsupported.'];
  if (assets?.schemaVersion !== 1 || !Array.isArray(assets.assets)) return [...issues, 'Asset register is missing or unsupported.'];
  const byId = new Map();
  for (const asset of assets.assets) {
    if (!asset || !text(asset.id) || byId.has(asset.id)) { issues.push('Asset IDs must be present and unique.'); continue; }
    byId.set(asset.id, asset);
  }
  for (const q of bank) {
    if (!q || !text(q.id)) { issues.push('Question ID is missing.'); continue; }
    const review = ledger.questions[q.id];
    if (!review || review.status !== 'approved') { issues.push(`${q.id}: independent review missing.`); }
    else {
      if (!text(review.author) || !text(review.reviewer) || review.author.trim().toLowerCase() === review.reviewer.trim().toLowerCase()) issues.push(`${q.id}: distinct author and reviewer required.`);
      if (review.contentSha256 !== contentHash(q)) issues.push(`${q.id}: content changed since review.`);
      if (!date(review.verifiedAt) || review.verifiedAt > today) issues.push(`${q.id}: invalid verification date.`);
      if (!date(review.reviewBy) || review.reviewBy < today || review.reviewBy < review.verifiedAt) issues.push(`${q.id}: review is expired or invalid.`);
    }
    if (q.assetIds !== undefined && (!Array.isArray(q.assetIds) || !q.assetIds.every(text))) { issues.push(`${q.id}: invalid asset references.`); continue; }
    for (const id of q.assetIds ?? []) {
      const asset = byId.get(id);
      if (!asset) { issues.push(`${q.id}: unknown asset ${id}.`); continue; }
      if (asset.status !== 'approved' || !text(asset.creator) || !text(asset.reviewer) || !text(asset.licenseEvidence) || !text(asset.territories)
        || asset.commercialUse !== true || !Array.isArray(asset.platforms) || !['ios', 'android'].every(p => asset.platforms.includes(p))
        || !text(asset.likenessAndMarksAssessment) || !text(asset.referenceImageAssessment)) issues.push(`${q.id}: asset ${id} lacks release clearance.`);
      if (!date(asset.expiresAt) || asset.expiresAt < today) issues.push(`${q.id}: asset ${id} clearance expired or undated.`);
    }
  }
  return issues;
}
