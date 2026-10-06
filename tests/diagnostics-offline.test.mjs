import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSummary, selectSourceBuild, validateDiagnosticBuild } from '../scripts/diagnose-android-build.mjs';

const sourceCommit = 'faeb0a4e6328d11166478dc34ad7c09650daa58c';
const build = {
  id: '12345678-1234-1234-1234-123456789abc', app: { id: '99891114-dac6-4d4c-973c-3a246db2a7b1' },
  platform: 'ANDROID', buildProfile: 'production-paid', gitCommitHash: sourceCommit,
  status: 'IN_PROGRESS', appBuildVersion: '14', logFiles: ['https://example.com/private?token=hidden'],
};

test('source diagnostics select only one exact project, platform, profile and commit', () => {
  const unrelated = [
    { ...build, gitCommitHash: '0'.repeat(40) }, { ...build, platform: 'IOS' },
    { ...build, buildProfile: 'production' }, { ...build, app: { id: 'another-project' } },
  ];
  assert.equal(selectSourceBuild([...unrelated, build], sourceCommit).id, build.id);
  for (const values of [[], unrelated, [build, build], { error: 'not a list' }, [{ ...build, id: 'invalid\nID' }]]) {
    assert.throws(() => selectSourceBuild(values, sourceCommit));
  }
  assert.throws(() => selectSourceBuild([build], 'short-hash'));
});

test('exact view metadata must still match the selected ID and source', () => {
  assert.equal(validateDiagnosticBuild(build, { buildId: build.id, sourceCommit }), build);
  assert.throws(() => validateDiagnosticBuild(build, { buildId: '87654321-1234-1234-1234-123456789abc', sourceCommit }));
  assert.throws(() => validateDiagnosticBuild(build, { buildId: build.id, sourceCommit: '0'.repeat(40) }));
});

test('progress summaries omit signed metadata and untrusted status or version values', () => {
  const summary = buildSummary(build);
  assert.match(summary, /status IN_PROGRESS; version code 14/);
  assert.match(summary, /https:\/\/expo.dev\/accounts\/amoharroudj\/projects\/leoqo-football-quiz\/builds\//);
  assert.ok(!summary.includes('private'));
  assert.ok(!summary.includes('hidden'));
  const invalid = buildSummary({ ...build, status: 'secret-status', appBuildVersion: 'secret-version' });
  assert.match(invalid, /status UNKNOWN; version code not assigned/);
  assert.ok(!invalid.includes('secret'));
});
