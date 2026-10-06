#!/usr/bin/env python3
"""Exercise the inspected app through Android UI only; never enter billing flows."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

PACKAGE = "com.leoqo.footballquiz"
LIMITATIONS = [
    "APK was generated from the inspected signed AAB and signed with a disposable emulator test key.",
    "This is not a Play-installed or Play-signed billing candidate; purchases, restoration and licensing were not tested.",
    "Screenshots are actual emulator captures; the Android API is recorded in the report. These are not physical-phone or Google Play listing approval.",
    "No app rebuild, store submission, account login, paid unlock, clock override or direct app-storage edit was performed.",
]


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def redact(message):
    text = re.sub(r'https?://[^\s"<>]+', '[URL omitted]', str(message))
    text = re.sub(r'\b(?:goog|appl|sk|test)_[\w.-]+', '[SDK key omitted]', text)
    text = re.sub(r'\b(?:Bearer|Basic)\s+[A-Za-z0-9+/_=.-]+', '[authorization omitted]', text, flags=re.I)
    text = re.sub(r'''(["']?[\w.-]*(?:TOKEN|SECRET|PASSWORD|API[_-]?KEY|AUTHORIZATION)[\w.-]*["']?\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)''', r'\1[omitted]', text, flags=re.I)
    text = re.sub(r'\b[A-Za-z0-9+/_=-]{32,}\b', '[long value omitted]', text)
    return text[:700]


def normalized(text):
    return ' '.join(text.split())


def smoke_target(env=None):
    env = os.environ if env is None else env
    build_id, source, code = (env.get(key, '') for key in ('SMOKE_BUILD_ID', 'SMOKE_SOURCE_COMMIT', 'SMOKE_VERSION_CODE'))
    if (not isinstance(build_id, str) or not re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', build_id)
            or not isinstance(source, str) or not re.fullmatch(r'[0-9a-f]{40}', source)
            or not isinstance(code, str) or not re.fullmatch(r'[1-9][0-9]{0,9}', code) or int(code) > 2100000000):
        raise RuntimeError('Provide explicit valid Android smoke build ID, source commit and version code pins.')
    return {'buildId': build_id, 'sourceCommit': source, 'versionCode': int(code), 'package': PACKAGE,
            'projectId': '99891114-dac6-4d4c-973c-3a246db2a7b1', 'buildProfile': 'production-paid',
            'distribution': 'STORE', 'easStatus': 'FINISHED', 'targetSdk': 36, 'debuggable': False}


def smoke_api(env=None):
    env = os.environ if env is None else env
    value = env.get('SMOKE_API_LEVEL')
    if value not in ('32', '36'):
        raise RuntimeError('Explicit Android smoke API must be 32 or 36.')
    return int(value)


def command_stage(args):
    stages = {
        ('install',): 'install_test_apk',
        ('shell', 'pm', 'clear'): 'clear_test_app_data',
        ('shell', 'cmd', 'package', 'list'): 'verify_installed_enabled_package',
        ('shell', 'cmd', 'package', 'query-activities'): 'query_installed_launcher',
        ('shell', 'cmd', 'package', 'resolve-activity'): 'resolve_installed_launcher',
        ('shell', 'am', 'start'): 'launch_test_app',
        ('shell', 'wm', 'size'): 'configure_display_size',
        ('shell', 'wm', 'density'): 'configure_display_density',
        ('shell', 'getprop', 'ro.build.version.sdk'): 'read_android_api',
        ('shell', 'getprop', 'ro.product.cpu.abi'): 'read_android_abi',
        ('shell', 'pidof'): 'check_app_process',
        ('shell', 'uiautomator'): 'capture_ui_hierarchy',
        ('shell', 'rm'): 'clear_old_ui_hierarchy',
        ('shell', 'input'): 'interact_with_native_ui',
        ('exec-out', 'screencap'): 'capture_native_screenshot',
        ('exec-out', 'cat'): 'read_ui_hierarchy',
        ('logcat', '-c'): 'clear_test_logcat',
        ('logcat',): 'collect_test_logcat',
    }
    return next((stage for prefix, stage in stages.items() if tuple(args[:len(prefix)]) == prefix), 'android_test_command')


def android_failure_reason(stdout=b'', stderr=b''):
    # Return only fixed codes/phrases, never raw command output, paths or values.
    text = '\n'.join(value.decode('utf-8', errors='replace') if isinstance(value, bytes) else str(value) for value in (stdout, stderr))[-65536:]
    for code in ('INSTALL_FAILED_INVALID_APK', 'INSTALL_FAILED_INSUFFICIENT_STORAGE', 'INSTALL_FAILED_NO_MATCHING_ABIS',
                 'INSTALL_FAILED_TEST_ONLY', 'INSTALL_FAILED_UPDATE_INCOMPATIBLE', 'INSTALL_FAILED_VERSION_DOWNGRADE',
                 'INSTALL_FAILED_OLDER_SDK', 'INSTALL_FAILED_NEWER_SDK', 'INSTALL_FAILED_MISSING_SPLIT',
                 'INSTALL_FAILED_USER_RESTRICTED', 'INSTALL_FAILED_INTERNAL_ERROR', 'INSTALL_FAILED_DEXOPT',
                 'INSTALL_FAILED_VERIFICATION_FAILURE', 'INSTALL_FAILED_CONFLICTING_PROVIDER',
                 'INSTALL_PARSE_FAILED_NO_CERTIFICATES', 'INSTALL_PARSE_FAILED_BAD_MANIFEST',
                 'INSTALL_PARSE_FAILED_INCONSISTENT_CERTIFICATES', 'INSTALL_FAILED_BAD_SIGNATURE'):
        if re.search(r'\b' + code + r'\b', text):
            return code
    for pattern, reason in (
        (r'device offline', 'ADB device offline'), (r'unauthorized', 'ADB device unauthorized'),
        (r'no devices/emulators|device .* not found', 'ADB device unavailable'),
        (r'more than one device', 'Multiple ADB devices'),
        (r"Can.t find service.*package", 'Android package service unavailable'),
        (r'Error type 3|Activity class .* does not exist', 'Android activity not found'),
        (r'unable to resolve Intent', 'Android launch intent unresolved'),
        (r'SecurityException|Permission Denial|permission denied', 'Android permission denied'),
        (r'unknown option|unrecognized option', 'Android command option unsupported'),
        (r'No such file or directory', 'Android command file unavailable'),
    ):
        if re.search(pattern, text, re.I):
            return reason
    return 'Android rejected the command; no recognized safe error code was returned'


class AndroidCommandError(RuntimeError):
    pass


def verify_test_apk(apk, verification):
    if (any(verification.get(key) != expected or type(verification.get(key)) is not type(expected) for key, expected in smoke_target().items())
            or not re.fullmatch(r'[0-9a-f]{64}', verification.get('apkSha256', ''))
            or apk.is_symlink() or not apk.is_file()):
        raise RuntimeError('Verified emulator APK provenance does not match the explicitly pinned candidate.')
    digest = hashlib.sha256()
    with apk.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    if digest.hexdigest() != verification['apkSha256'] or apk.stat().st_size != verification.get('apkBytes'):
        raise RuntimeError('The test APK changed after preparation; installation was blocked.')


def checked_component(value):
    # Components are public manifest names, not arbitrary tool output.
    if not isinstance(value, str) or len(value) > 250:
        raise RuntimeError('Android launcher component format was invalid.')
    match = re.fullmatch(re.escape(PACKAGE) + r'/(\.?[A-Za-z_$][A-Za-z0-9_$.]*)', value)
    if not match:
        raise RuntimeError('Android launcher component did not belong to the inspected app.')
    name = match[1]
    name = PACKAGE + name if name.startswith('.') else name
    if not name.startswith(PACKAGE + '.'):
        raise RuntimeError('Android launcher activity was outside the expected app namespace.')
    return PACKAGE + '/' + name


def parse_apk_badging(raw):
    if len(raw) > 1024 * 1024:
        raise RuntimeError('APK manifest badging exceeded the diagnostic limit.')
    identity = re.findall(r"^package: name='([^']+)' versionCode='(\d+)'", raw, re.M)
    version = smoke_target()['versionCode']
    if identity != [(PACKAGE, str(version))]:
        raise RuntimeError('The generated APK manifest did not match the exact pinned package and version.')
    names = re.findall(r"^launchable-activity: name='([^']+)'", raw, re.M)
    components = sorted(set(checked_component(PACKAGE + '/' + name) for name in names))
    if len(components) > 10:
        raise RuntimeError('The generated APK declared an unexpected number of launcher activities.')
    return {'package': PACKAGE, 'versionCode': version, 'declaredLauncherComponents': components}


def inspect_apk_launcher(apk, output):
    output.mkdir(parents=True, exist_ok=True)
    report = {'kind': 'generated-apk-launcher-inspection', 'status': 'failed'}
    try:
        verification = json.loads((output / 'input-verification.json').read_text())
        verify_test_apk(apk, verification)
        roots = [Path(os.environ[key]) for key in ('ANDROID_HOME', 'ANDROID_SDK_ROOT') if os.environ.get(key)]
        candidates = [tool for root in roots for tool in (root / 'build-tools').glob('*/aapt2')
                      if re.fullmatch(r'\d+\.\d+\.\d+', tool.parent.name) and tool.is_file() and os.access(tool, os.X_OK)]
        if not candidates:
            raise RuntimeError('An installed Android SDK aapt2 is required to inspect the generated APK launcher.')
        tool = max(candidates, key=lambda item: tuple(map(int, item.parent.name.split('.'))))
        try:
            result = subprocess.run([str(tool), 'dump', 'badging', str(apk)], capture_output=True, timeout=60, check=False)
        except (subprocess.TimeoutExpired, OSError):
            raise RuntimeError('The local aapt2 APK manifest probe could not complete; raw output was withheld.') from None
        if result.returncode:
            raise RuntimeError('The local aapt2 APK manifest probe failed; raw output was withheld.')
        report.update(parse_apk_badging(result.stdout.decode('utf-8', errors='replace')))
        report.update({'apkSha256': verification['apkSha256'], 'aapt2BuildToolsVersion': tool.parent.name})
        if not report['declaredLauncherComponents']:
            raise RuntimeError('The generated APK has no declared launchable activity; native launch was blocked.')
        report['status'] = 'verified'
        print('APK LAUNCHER: ' + json.dumps(report, sort_keys=True), flush=True)
        return 0
    except Exception as error:
        report['failure'] = redact(str(error)) if isinstance(error, RuntimeError) else 'APK launcher inspection could not read verified inputs.'
        print('FAIL: ' + report['failure'], file=sys.stderr, flush=True)
        return 1
    finally:
        (output / 'apk-launcher-summary.json').write_text(json.dumps(report, indent=2) + '\n')


def parse_launcher_components(raw):
    value = raw.strip()
    if value in ('No activities found', 'No activity found'):
        return []
    lines = value.splitlines()
    if not lines or len(lines) > 10:
        raise RuntimeError('Android launcher query did not return a bounded component list.')
    return sorted(set(checked_component(line.strip()) for line in lines))


class Smoke:
    def __init__(self, output):
        self.output = output
        self.pids = set()
        self.report = {"kind": "native-android-emulator-smoke", "status": "running", "startedAt": utc_now(), "package": PACKAGE, "checks": [], "screenshots": [], "limitations": LIMITATIONS}

    def adb(self, *args, timeout=30, binary=False):
        stage = command_stage(args)
        self.report['lastCommandStage'] = stage
        if stage not in self.report.setdefault('commandStagesStarted', []):
            self.report['commandStagesStarted'].append(stage)
            print(f'ANDROID STAGE: {stage}', flush=True)
        try:
            result = subprocess.run(['adb', *args], capture_output=True, timeout=timeout, check=False)
        except (subprocess.TimeoutExpired, OSError):
            reason = 'Android command timed out or the local tool was unavailable'
            self.report.setdefault('failedCommand', {"stage": stage, "reason": reason})
            raise AndroidCommandError(f'Android stage {stage} failed: {reason}.') from None
        if result.returncode:
            reason = android_failure_reason(result.stdout, result.stderr)
            self.report.setdefault('failedCommand', {"stage": stage, "exitCode": result.returncode, "reason": reason})
            raise AndroidCommandError(f'Android stage {stage} failed (exit {result.returncode}): {reason}.')
        self.report['lastSuccessfulCommandStage'] = stage
        return result.stdout if binary else result.stdout.decode('utf-8', errors='replace')

    def dump(self):
        # The platform dump command can exit zero on failure. Remove our prior
        # hierarchy so a failed dump can never validate a stale screen.
        self.adb('shell', 'rm', '-f', '/sdcard/leoqo-smoke-window.xml')
        result = self.adb('shell', 'uiautomator', 'dump', '--compressed', '/sdcard/leoqo-smoke-window.xml', timeout=20)
        if 'dumped to:' not in result:
            raise RuntimeError('A fresh native UI hierarchy could not be captured.')
        raw = self.adb('exec-out', 'cat', '/sdcard/leoqo-smoke-window.xml', timeout=10)
        start = raw.find('<?xml')
        if start < 0:
            raise RuntimeError('Native UI hierarchy was unavailable.')
        try:
            return ET.fromstring(raw[start:])
        except ET.ParseError:
            raise RuntimeError('Native UI hierarchy was unreadable.') from None

    @staticmethod
    def labels(node):
        return [normalized(node.get(key, '')) for key in ('text', 'content-desc') if node.get(key)]

    def match(self, root, label, contains=False):
        wanted = normalized(label)
        for node in root.iter('node'):
            if any(wanted in value if contains else wanted == value for value in self.labels(node)):
                if self.bounds(node):
                    return node
        return None

    @staticmethod
    def bounds(node):
        match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.get('bounds', ''))
        if not match:
            return None
        left, top, right, bottom = map(int, match.groups())
        left, top, right, bottom = max(0, left), max(0, top), min(1080, right), min(1920, bottom)
        return (left, top, right, bottom) if right > left and bottom > top else None

    def wait(self, predicate, description, timeout=45):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            try:
                root = self.dump()
                result = predicate(root)
                if result is not None and result is not False:
                    return root, result
            except RuntimeError:
                pass
            time.sleep(0.5)
        raise RuntimeError(f'Native UI check timed out: {description}.')

    def scroll(self, down):
        start, end = (1536, 576) if down else (576, 1536)
        self.adb('shell', 'input', 'swipe', '540', str(start), '540', str(end), '350')
        time.sleep(0.35)

    def find(self, label, *, contains=False, direction='down'):
        for _ in range(10):
            root = self.dump()
            node = self.match(root, label, contains)
            if node is not None:
                return root, node
            self.scroll(direction == 'down')
        raise RuntimeError(f'Expected free-app control was not reachable: {label}.')

    def tap(self, root, node):
        parents = {child: parent for parent in root.iter() for child in parent}
        while node is not None and node.get('clickable') != 'true':
            node = parents.get(node)
        if node is None or node.get('enabled') != 'true' or not self.bounds(node):
            raise RuntimeError('Expected native control was not enabled and clickable.')
        left, top, right, bottom = self.bounds(node)
        self.adb('shell', 'input', 'tap', str((left + right) // 2), str((top + bottom) // 2))
        time.sleep(0.5)

    def tap_label(self, label, **kwargs):
        root, node = self.find(label, **kwargs)
        self.tap(root, node)

    def screenshot(self, name, description):
        raw = self.adb('exec-out', 'screencap', '-p', binary=True)
        if not raw.startswith(b'\x89PNG\r\n\x1a\n'):
            raise RuntimeError('Android screenshot did not return a PNG.')
        width, height = int.from_bytes(raw[16:20], 'big'), int.from_bytes(raw[20:24], 'big')
        if (width, height) != (1080, 1920):
            raise RuntimeError('Android screenshot dimensions did not match the configured native display.')
        (self.output / name).write_bytes(raw)
        self.report['screenshots'].append({"file": name, "description": description, "width": width, "height": height, "capturedAt": utc_now(), "sha256": hashlib.sha256(raw).hexdigest()})

    def check(self, description):
        self.report['checks'].append(description)
        print(f'PASS: {description}', flush=True)

    def launcher(self):
        static = json.loads((self.output / 'apk-launcher-summary.json').read_text())
        version = smoke_target()['versionCode']
        if (static.get('status') != 'verified' or static.get('package') != PACKAGE or static.get('versionCode') != version
                or static.get('apkSha256') != self.report.get('testApkSha256')):
            raise RuntimeError('Static launcher evidence did not match the verified test APK.')
        declared = sorted(set(checked_component(item) for item in static.get('declaredLauncherComponents', [])))
        installed = self.adb('shell', 'cmd', 'package', 'list', 'packages', '-e', '--show-versioncode', '--user', 'current', PACKAGE)
        enabled = installed.strip() == f'package:{PACKAGE} versionCode:{version}'
        evidence = {'package': PACKAGE, 'versionCode': version, 'installedAndEnabled': enabled, 'declaredComponents': declared,
                    'action': 'android.intent.action.MAIN', 'category': 'android.intent.category.LAUNCHER', 'queryFlags': 0}
        self.report['launcher'] = evidence
        if not enabled:
            raise RuntimeError('The exact pinned app version was not installed and enabled for the current Android user.')
        intent = ('--components', '--query-flags', '0', '--user', 'current', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', '-p', PACKAGE)
        queried = parse_launcher_components(self.adb('shell', 'cmd', 'package', 'query-activities', *intent))
        resolved = parse_launcher_components(self.adb('shell', 'cmd', 'package', 'resolve-activity', *intent))
        evidence.update({'queriedComponents': queried, 'resolvedComponents': resolved})
        print('INSTALLED LAUNCHER: ' + json.dumps(evidence, sort_keys=True), flush=True)
        if len(queried) != 1 or resolved != queried or queried[0] not in declared:
            raise RuntimeError('An unambiguous enabled MAIN/LAUNCHER activity did not match both the installed resolver and actual APK declaration.')
        return queried[0]

    def launch(self):
        # Android launchers start a resolved MAIN/LAUNCHER component explicitly.
        # An implicit startActivity additionally requires CATEGORY_DEFAULT, which
        # is deliberately absent from normal launcher filters. Never assume an
        # activity name or alter the app's manifest to accommodate this harness.
        component = self.launcher()
        result = self.adb('shell', 'am', 'start', '-W', '-S', '-n', component, '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', timeout=60)
        if 'Status: ok' not in result:
            reason = android_failure_reason(result)
            self.report.setdefault('failedCommand', {"stage": 'launch_test_app', "reason": reason})
            raise AndroidCommandError(f'Android stage launch_test_app did not report success: {reason}.')
        self.wait(lambda root: self.match(root, 'Leoqo home'), 'home navigation after launch', timeout=75)
        pid_text = self.adb('shell', 'pidof', PACKAGE).strip()
        pids = {part for part in pid_text.split() if part.isdigit()}
        if not pids:
            raise RuntimeError('Native app process was not running after launch.')
        self.pids.update(pids)

    def question(self, bank, index):
        pattern = re.compile(rf'QUESTION {index} OF [1-9]\d*')
        self.wait(lambda root: any(pattern.fullmatch(label) for node in root.iter('node') for label in self.labels(node)), f'question {index} progress')
        _, question = self.wait(lambda root: next((q for q in bank if self.match(root, q['prompt']) is not None), None), f'question {index} prompt from the exact-source bank')
        return question

    def capture_logs(self):
        raw = self.adb('logcat', '-d', '-v', 'threadtime', timeout=15)
        relevant = []
        for line in raw.splitlines():
            parts = line.split()
            pid = parts[2] if len(parts) > 3 else ''
            if pid in self.pids or PACKAGE in line:
                relevant.append(line)
        crash_lines = self.adb('logcat', '-b', 'crash', '-d', '-v', 'threadtime', timeout=15).splitlines()
        related = set()
        for index, line in enumerate(crash_lines):
            if PACKAGE in line:
                related.update(range(max(0, index - 4), min(len(crash_lines), index + 40)))
        relevant.extend(crash_lines[index] for index in sorted(related))
        fatal = [line for line in relevant if re.search(r'FATAL EXCEPTION|Fatal signal|ANR in|JavascriptException|Unable to load script|Invariant Violation|ReferenceError:|TypeError:', line)]
        selected = [line for line in relevant if re.search(r'AndroidRuntime|ReactNativeJS|FATAL|Fatal signal|Exception|Error|ANR', line, re.I)]
        (self.output / 'sanitized-logcat.txt').write_text('Only bounded app-process/package diagnostic lines are retained; raw logcat is not uploaded.\n' + '\n'.join(redact(line) for line in selected[-120:]) + '\n', encoding='utf-8')
        self.report['logcat'] = {"appProcessIdsObserved": len(self.pids), "relevantDiagnosticLines": len(selected), "fatalOrRuntimeErrorLines": len(fatal), "rawLogcatUploaded": False}
        return bool(fatal)

    def run(self, apk, bank):
        api = smoke_api()
        if self.adb('shell', 'getprop', 'ro.build.version.sdk').strip() != str(api):
            raise RuntimeError('The emulator API did not match the explicitly requested Android smoke API.')
        self.report['androidApi'] = api
        self.report['abi'] = self.adb('shell', 'getprop', 'ro.product.cpu.abi').strip()
        if self.report['abi'] != 'x86_64':
            raise RuntimeError('This smoke check requires the requested x86_64 emulator.')
        self.adb('shell', 'wm', 'size', '1080x1920')
        self.adb('shell', 'wm', 'density', '420')
        self.adb('install', '--no-streaming', str(apk), timeout=120)
        if 'Success' not in self.adb('shell', 'pm', 'clear', PACKAGE):
            raise RuntimeError('Could not establish a fresh test installation.')
        self.adb('logcat', '-c')
        self.launch()
        self.screenshot('01-native-home.png', f'Actual fresh native home on the test-signed API {api} emulator install.')
        self.tap_label('Let’s play')
        first = self.question(bank, 1)
        self.check('Fresh installation launches the free quiz with an actual first question.')
        self.screenshot('02-native-question.png', 'Actual first question before answering; no question, date or UI content was replaced.')
        seen = set()
        for _ in range(8):
            root = self.dump()
            seen.update(option for option in first['options'] if self.match(root, option) is not None)
            if len(seen) == 4:
                break
            self.scroll(True)
        if len(first['options']) != 4 or len(seen) != 4:
            raise RuntimeError('All four actual answer choices were not reachable through the native UI.')
        self.check('All four answer options are reachable on the native phone display.')
        self.tap_label(first['options'][-1], direction='up')
        # Either result is legitimate: select an actual option without injecting
        # a correct answer or modifying app storage.
        self.find('Next question')
        root = self.dump()
        if not any(self.match(root, text) is not None for text in ('Nicely played.', 'One for the memory bank.')):
            self.find('Read the source')
        self.screenshot('03-native-answer-reveal.png', 'Actual answer reveal after selecting a normal answer option; score is not fabricated.')
        self.tap_label('Next question')
        second = self.question(bank, 2)
        self.check('Answering and advancing displays the next native question.')
        self.tap_label('Save and leave round', direction='up')
        self.find('Continue your round', contains=True)
        self.launch()
        self.tap_label('Continue your round', contains=True)
        resumed = self.question(bank, 2)
        if resumed['id'] != second['id']:
            raise RuntimeError('The saved native question changed across process restart.')
        self.screenshot('04-native-resumed-question.png', 'The same saved second question after force-stop and normal app relaunch.')
        self.check('The unfinished quiz persists through process restart and resumes at the same question.')
        self.tap_label('Save and leave round', direction='up')
        self.tap_label('Settings')
        self.wait(lambda root: self.match(root, 'Your game. Your settings.'), 'settings screen')
        self.screenshot('05-native-settings.png', 'Actual native settings reached through free navigation; no billing screens entered.')
        self.tap_label('Play')
        self.find('Continue your round', contains=True)
        self.check('Settings and Play navigation remain usable after the saved round.')
        if not self.adb('shell', 'pidof', PACKAGE).strip():
            raise RuntimeError('Native app process exited before the smoke flow completed.')


def finalize(output):
    output.mkdir(parents=True, exist_ok=True)
    report_path = output / 'native-smoke-report.json'
    if not report_path.exists():
        report_path.write_text(json.dumps({"kind": "native-android-emulator-smoke", "status": "not_completed", "reason": "The workflow did not reach the native smoke script; inspect artifact verification or emulator setup failure.", "emulatorStepOutcome": os.environ.get('EMULATOR_OUTCOME', 'not_run'), "limitations": LIMITATIONS}, indent=2) + '\n')
    (output / 'README.txt').write_text('ACTUAL NATIVE EMULATOR SMOKE EVIDENCE\n\n' + '\n'.join(LIMITATIONS) + '\n\nRead native-smoke-report.json for actual pass/fail/not-completed status. Input provenance is in input-verification.json when artifact preparation succeeded. No APK, AAB, keystore, raw logcat or app storage is uploaded in this artifact.\n')


def main():
    if len(sys.argv) == 4 and sys.argv[1] == '--inspect-apk':
        return inspect_apk_launcher(Path(sys.argv[2]), Path(sys.argv[3]))
    if len(sys.argv) == 3 and sys.argv[1] == '--finalize':
        finalize(Path(sys.argv[2]))
        return 0
    if len(sys.argv) != 4:
        print('Usage: android-native-smoke.py APK EXACT_SOURCE_QUESTIONS OUTPUT_DIRECTORY', file=sys.stderr)
        return 1
    apk, bank_path, output = map(Path, sys.argv[1:])
    output.mkdir(parents=True, exist_ok=True)
    smoke = Smoke(output)
    try:
        verification = json.loads((output / 'input-verification.json').read_text())
        # The preparation step verified the inspected AAB and test APK hashes.
        # Require that provenance before interacting with an emulator.
        smoke.report['inputVerification'] = 'input-verification.json'
        verify_test_apk(apk, verification)
        smoke.report.update({**smoke_target(), "requestedAndroidApi": smoke_api(), "aabSha256": verification['aabSha256'], "testApkSha256": verification['apkSha256']})
        bank = json.loads(bank_path.read_text())
        if not isinstance(bank, list) or not bank:
            raise RuntimeError('The exact-source question bank was unavailable.')
        smoke.run(apk, bank)
        smoke.report['status'] = 'passed'
    except Exception as error:
        smoke.report['status'] = 'failed'
        smoke.report['failure'] = str(error) if isinstance(error, AndroidCommandError) else redact(str(error))
        print(f'FAIL: {smoke.report["failure"]}', file=sys.stderr, flush=True)
        try:
            smoke.screenshot('99-native-failure.png', 'Actual emulator display at the point the native smoke check failed.')
        except Exception:
            pass
    finally:
        try:
            if smoke.capture_logs():
                smoke.report['status'] = 'failed'
                smoke.report['failure'] = 'App-process logcat reported a fatal or runtime error; see the sanitized diagnostic report.'
        except Exception:
            smoke.report['logcat'] = {"collected": False, "reason": "Emulator logs could not be collected."}
            smoke.report['status'] = 'failed'
            smoke.report.setdefault('failure', 'Native crash-log verification could not be completed; this run is not a verified smoke pass.')
        smoke.report['completedAt'] = utc_now()
        (output / 'native-smoke-report.json').write_text(json.dumps(smoke.report, indent=2) + '\n')
        finalize(output)
    return 0 if smoke.report['status'] == 'passed' else 1


if __name__ == '__main__':
    sys.exit(main())
