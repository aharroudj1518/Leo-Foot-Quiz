import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('native smoke refuses changed APKs and stale UI captures and redacts short log credentials', () => {
  const code = String.raw`
import hashlib, importlib.util, tempfile, os
from pathlib import Path
pins = {'SMOKE_BUILD_ID': '5f7931d6-c2a6-4a73-9397-12899c5d23a4', 'SMOKE_SOURCE_COMMIT': 'faeb0a4e6328d11166478dc34ad7c09650daa58c', 'SMOKE_VERSION_CODE': '6', 'SMOKE_API_LEVEL': '36'}
os.environ.update(pins)
spec = importlib.util.spec_from_file_location('native_smoke', 'scripts/android-native-smoke.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    apk = root / 'app.apk'
    apk.write_bytes(b'test-only-artifact')
    metadata = {**module.smoke_target(), 'apkSha256': hashlib.sha256(apk.read_bytes()).hexdigest(), 'apkBytes': apk.stat().st_size}
    module.verify_test_apk(apk, metadata)
    apk.write_bytes(b'changed-artifact')
    try:
        module.verify_test_apk(apk, metadata)
        raise AssertionError('Changed APK passed')
    except RuntimeError:
        pass
    for field, values in {'SMOKE_BUILD_ID': ['', 'latest', '5f7931d6', '5F7931D6-c2a6-4a73-9397-12899c5d23a4'],
                          'SMOKE_SOURCE_COMMIT': ['', 'main', 'a' * 39, 'A' * 40],
                          'SMOKE_VERSION_CODE': ['', '0', '06', '-1', '6.0', '2100000001']}.items():
        for value in values:
            try:
                module.smoke_target({**pins, field: value})
                raise AssertionError('Invalid candidate pin passed')
            except RuntimeError:
                pass
    for incomplete in [{}, {key: value for key, value in pins.items() if key != 'SMOKE_BUILD_ID'}]:
        try:
            module.smoke_target(incomplete)
            raise AssertionError('Missing candidate pin fell back to an old build')
        except RuntimeError:
            pass
    assert module.smoke_api({'SMOKE_API_LEVEL': '32'}) == 32
    assert module.smoke_api({'SMOKE_API_LEVEL': '36'}) == 36
    for value in [None, '', 'latest', '35', 32]:
        try:
            module.smoke_api({'SMOKE_API_LEVEL': value})
            raise AssertionError('Unsupported or implicit API was accepted')
        except RuntimeError:
            pass
    os.environ['SMOKE_VERSION_CODE'] = '7'
    apk.write_bytes(b'test-only-artifact')
    try:
        module.verify_test_apk(apk, metadata)
        raise AssertionError('Previous version APK matched a new candidate pin')
    except RuntimeError:
        pass
    os.environ['SMOKE_VERSION_CODE'] = '6'
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
    component = module.PACKAGE + '/' + module.PACKAGE + '.MainActivity'
    assert module.checked_component(module.PACKAGE + '/.MainActivity') == component
    badging = "package: name='com.leoqo.footballquiz' versionCode='6' versionName='0.1.0'\nlaunchable-activity: name='com.leoqo.footballquiz.MainActivity' label='Leoqo' icon='private/icon/path'\napplication-label:'goog_private_value'\n"
    summary = module.parse_apk_badging(badging)
    assert summary == {'package': module.PACKAGE, 'versionCode': 6, 'declaredLauncherComponents': [component]}
    assert 'private' not in str(summary)
    assert module.parse_apk_badging("package: name='com.leoqo.footballquiz' versionCode='6'\n")['declaredLauncherComponents'] == []
    assert module.parse_launcher_components(module.PACKAGE + '/.MainActivity\n') == [component]
    assert module.parse_launcher_components('No activities found\n') == []
    for invalid in ['com.other.app/.MainActivity', module.PACKAGE + '/.MainActivity\nAuthorization: Bearer private-value', module.PACKAGE + '/private key']:
        try:
            module.parse_launcher_components(invalid)
            raise AssertionError('Unsafe or foreign launcher output passed')
        except RuntimeError as error:
            assert 'private' not in str(error)
    for bad in [badging.replace("versionCode='6'", "versionCode='7'"), badging.replace("name='com.leoqo.footballquiz'", "name='com.other.app'")]:
        try:
            module.parse_apk_badging(bad)
            raise AssertionError('Unexpected APK identity passed')
        except RuntimeError:
            pass
    import json
    (root / 'apk-launcher-summary.json').write_text(json.dumps({**summary, 'status': 'verified', 'apkSha256': 'a' * 64}))
    launcher_smoke = module.Smoke(root)
    launcher_smoke.report['testApkSha256'] = 'a' * 64
    launcher_calls = []
    def launcher_adb(*args, **kwargs):
        launcher_calls.append(args)
        if args[3] == 'list':
            return 'package:' + module.PACKAGE + ' versionCode:6\n'
        return module.PACKAGE + '/.MainActivity\n'
    launcher_smoke.adb = launcher_adb
    assert launcher_smoke.launcher() == component
    assert all('--query-flags' in call and call[call.index('--query-flags') + 1] == '0' for call in launcher_calls[1:])
    launcher_smoke.adb = lambda *args, **kwargs: ('package:' + module.PACKAGE + ' versionCode:6\n') if args[3] == 'list' else 'No activities found\n'
    try:
        launcher_smoke.launcher()
        raise AssertionError('Absent actual launcher was bypassed')
    except RuntimeError:
        pass
    launcher_smoke.adb = launcher_adb
    launcher_smoke.report['testApkSha256'] = 'b' * 64
    try:
        launcher_smoke.launcher()
        raise AssertionError('Different APK launcher evidence was accepted')
    except RuntimeError:
        pass
`;
  const result = spawnSync('python3', ['-c', code], { cwd: new URL('../', import.meta.url), encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
