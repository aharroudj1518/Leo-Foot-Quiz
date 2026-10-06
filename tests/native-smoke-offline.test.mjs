import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('native smoke refuses changed APKs and stale UI captures and redacts short log credentials', () => {
  const code = String.raw`
import hashlib, importlib.util, tempfile
from pathlib import Path
spec = importlib.util.spec_from_file_location('native_smoke', 'scripts/android-native-smoke.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    apk = root / 'app.apk'
    apk.write_bytes(b'test-only-artifact')
    metadata = {'package': module.PACKAGE, 'buildId': module.BUILD_ID, 'sourceCommit': module.SOURCE_COMMIT,
                'versionCode': 6, 'apkSha256': hashlib.sha256(apk.read_bytes()).hexdigest(), 'apkBytes': apk.stat().st_size}
    module.verify_test_apk(apk, metadata)
    apk.write_bytes(b'changed-artifact')
    try:
        module.verify_test_apk(apk, metadata)
        raise AssertionError('Changed APK passed')
    except RuntimeError:
        pass
    smoke = module.Smoke(root)
    calls = []
    def stale_dump(*args, **kwargs):
        calls.append(args)
        return 'ERROR: could not get idle state.'
    smoke.adb = stale_dump
    try:
        smoke.dump()
        raise AssertionError('Stale hierarchy passed')
    except RuntimeError:
        pass
    assert calls[0] == ('shell', 'rm', '-f', '/sdcard/leoqo-smoke-window.xml')
    assert not any(call[0] == 'exec-out' for call in calls)
    failed_logs = module.Smoke(root)
    original_run = module.subprocess.run
    module.subprocess.run = lambda *args, **kwargs: module.subprocess.CompletedProcess(args[0], 1, b'', b'private-command-error')
    try:
        try:
            failed_logs.capture_logs()
            raise AssertionError('Failed logcat query was treated as zero crashes')
        except RuntimeError as error:
            assert 'private-command-error' not in str(error)
    finally:
        module.subprocess.run = original_run
    for message in ['{"EXPO_TOKEN":"synthetic-short-value"}', 'Authorization: Bearer synthetic-short-value', 'API_KEY=synthetic-short-value']:
        assert 'synthetic-short-value' not in module.redact(message)
    assert 'hidden' not in module.redact('https://example.com/log?token=hidden')
    module.finalize(root)
    import json
    assert json.loads((root / 'native-smoke-report.json').read_text())['status'] == 'not_completed'
    assert module.android_failure_reason(b'', b'adb: failed to install /private/apk/path: Failure [INSTALL_FAILED_INVALID_APK: goog_private_value EXPO_TOKEN=private-token]') == 'INSTALL_FAILED_INVALID_APK'
    assert module.android_failure_reason(b'', b'unknown option --private-option') == 'Android command option unsupported'
    assert 'private' not in module.android_failure_reason(b'private-value', b'/private/path goog_private_key')
    diagnostic = module.Smoke(root)
    original_run = module.subprocess.run
    module.subprocess.run = lambda *args, **kwargs: module.subprocess.CompletedProcess(args[0], 1, b'', b'Failure [INSTALL_FAILED_INSUFFICIENT_STORAGE: /private/apk/path sk_private_value]')
    try:
        try:
            diagnostic.adb('install', '--no-streaming', '/private/apk/path')
            raise AssertionError('Install failure passed')
        except module.AndroidCommandError as error:
            assert 'install_test_apk' in str(error)
            assert 'INSTALL_FAILED_INSUFFICIENT_STORAGE' in str(error)
            assert 'private' not in str(error)
        assert diagnostic.report['failedCommand'] == {'stage': 'install_test_apk', 'exitCode': 1, 'reason': 'INSTALL_FAILED_INSUFFICIENT_STORAGE'}
    finally:
        module.subprocess.run = original_run
`;
  const result = spawnSync('python3', ['-c', code], { cwd: new URL('../', import.meta.url), encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
