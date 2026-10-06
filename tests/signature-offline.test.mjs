import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const inspector = fileURLToPath(new URL('../scripts/InspectAabSignature.java', import.meta.url));
const javaModules = spawnSync('java', ['--list-modules'], { encoding: 'utf8' });
const keytool = spawnSync('keytool', ['-help'], { encoding: 'utf8' });
const haveJdk = javaModules.status === 0 && keytool.status === 0
  && javaModules.stdout.includes('jdk.compiler@') && javaModules.stdout.includes('jdk.jartool@');
const skip = haveJdk ? false : 'Requires a JDK with compiler, JAR signing module and keytool; no signing checks ran.';

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 30_000 });
  assert.equal(result.status, 0, `${command} fixture preparation failed: ${result.error?.message ?? result.stderr}`);
  return result;
}

// The fixtures contain synthetic bytes, not real APK code or production keys.
const fixtureSource = `
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;
class SignatureFixture {
  static void write(Path path, Map<String, byte[]> files) throws Exception {
    try (var out = new ZipOutputStream(Files.newOutputStream(path))) {
      for (var item : files.entrySet()) {
        out.putNextEntry(new ZipEntry(item.getKey()));
        out.write(item.getValue()); out.closeEntry();
      }
    }
  }
  public static void main(String[] args) throws Exception {
    Path root = Path.of(args[0]);
    Map<String, byte[]> files = new LinkedHashMap<>();
    if (args[1].equals("create")) {
      for (String name : List.of("BundleConfig.pb", "base/manifest/AndroidManifest.xml",
          "z_feature/manifest/AndroidManifest.xml", "a_feature/manifest/AndroidManifest.xml",
          "base/assets/one.txt", "base/assets/two.txt", "META-INF/services/example"))
        files.put(name, ("synthetic-" + name).getBytes(java.nio.charset.StandardCharsets.UTF_8));
      write(root.resolve("unsigned.aab"), files);
    } else {
      try (var zip = new ZipFile(root.resolve("signed.aab").toFile())) {
        for (var entries = zip.entries(); entries.hasMoreElements();) {
          var entry = entries.nextElement();
          try (var input = zip.getInputStream(entry)) { files.put(entry.getName(), input.readAllBytes()); }
        }
      }
      var changed = new LinkedHashMap<>(files);
      changed.put("base/assets/one.txt", new byte[] { 42 });
      write(root.resolve("modified.aab"), changed);
      changed = new LinkedHashMap<>(files);
      changed.put("base/assets/unsigned.txt", new byte[] { 42 });
      write(root.resolve("added.aab"), changed);
      changed = new LinkedHashMap<>(files);
      changed.put("META-INF/services/unsigned", new byte[] { 42 });
      write(root.resolve("metadata-added.aab"), changed);
      changed = new LinkedHashMap<>(files);
      changed.remove("BundleConfig.pb");
      write(root.resolve("missing-config.aab"), changed);
      changed = new LinkedHashMap<>(files);
      changed.remove("base/manifest/AndroidManifest.xml");
      write(root.resolve("missing-manifest.aab"), changed);
      changed = new LinkedHashMap<>(files);
      changed.put("../hidden/manifest/AndroidManifest.xml", new byte[] { 42 });
      write(root.resolve("invalid-module.aab"), changed);
    }
  }
}`;

test('AAB signature verification accepts a self-signed upload certificate and rejects changed or unsigned payloads', { skip }, async t => {
  const temporary = mkdtempSync(join(tmpdir(), 'leoqo-signature-'));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const fixture = join(temporary, 'SignatureFixture.java');
  const store = join(temporary, 'fixture.p12');
  const certificate = join(temporary, 'certificate.der');
  writeFileSync(fixture, fixtureSource);
  run('java', [fixture, temporary, 'create']);
  run('keytool', ['-genkeypair', '-alias', 'fixture', '-keyalg', 'RSA', '-keysize', '2048',
    '-validity', '30', '-dname', 'CN=Sensitive fixture name never logged',
    '-storetype', 'PKCS12', '-keystore', store, '-storepass', 'fixture-password', '-noprompt']);
  run('keytool', ['-exportcert', '-alias', 'fixture', '-keystore', store,
    '-storepass', 'fixture-password', '-file', certificate]);
  run('java', ['-m', 'jdk.jartool/sun.security.tools.jarsigner.Main', '-keystore', store,
    '-storepass', 'fixture-password', '-signedjar', join(temporary, 'signed.aab'),
    join(temporary, 'unsigned.aab'), 'fixture']);
  run('java', [fixture, temporary, 'mutate']);

  await t.test('valid signature prints only the fingerprint and integrity result', () => {
    const result = run('java', [inspector, join(temporary, 'signed.aab')]);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), {
      certificateSha256: createHash('sha256').update(readFileSync(certificate)).digest('hex').toUpperCase(),
      signedPayloadEntries: 7,
      manifestModules: ['a_feature', 'base', 'z_feature'],
      cryptographicallySigned: true,
    });
  });
  for (const name of ['unsigned.aab', 'modified.aab', 'added.aab', 'metadata-added.aab',
    'missing-config.aab', 'missing-manifest.aab', 'invalid-module.aab', 'absent.aab']) {
    await t.test(`rejects ${name} without disclosing verifier details`, () => {
      const result = spawnSync('java', [inspector, join(temporary, name)], { encoding: 'utf8', timeout: 30_000 });
      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      assert.equal(result.stderr, 'AAB signature verification failed.\n');
    });
  }
  await t.test('duplicate ZIP paths are rejected before verification', () => {
    const bytes = readFileSync(join(temporary, 'signed.aab'));
    const needle = Buffer.from('base/assets/two.txt');
    const replacement = Buffer.from('base/assets/one.txt');
    let position = bytes.indexOf(needle);
    let replacements = 0;
    while (position !== -1) {
      replacement.copy(bytes, position);
      replacements++;
      position = bytes.indexOf(needle, position + needle.length);
    }
    assert.equal(replacements, 2, 'Replace the local and central ZIP directory names');
    const duplicate = join(temporary, 'duplicate.aab');
    writeFileSync(duplicate, bytes);
    const result = spawnSync('java', [inspector, duplicate], { encoding: 'utf8', timeout: 30_000 });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'AAB signature verification failed.\n');
  });
  await t.test('a cryptographic signature does not excuse an expired certificate', () => {
    run('keytool', ['-genkeypair', '-alias', 'expired', '-keyalg', 'RSA', '-keysize', '2048',
      '-startdate', '2000/01/01 00:00:00', '-validity', '1', '-dname', 'CN=Expired fixture',
      '-keystore', store, '-storepass', 'fixture-password', '-noprompt']);
    const expired = join(temporary, 'expired.aab');
    run('java', ['-m', 'jdk.jartool/sun.security.tools.jarsigner.Main', '-keystore', store,
      '-storepass', 'fixture-password', '-signedjar', expired, join(temporary, 'unsigned.aab'), 'expired']);
    const result = spawnSync('java', [inspector, expired], { encoding: 'utf8', timeout: 30_000 });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'AAB signature verification failed.\n');
  });
  await t.test('multiple valid upload signers are rejected instead of reporting an arbitrary identity', () => {
    run('keytool', ['-genkeypair', '-alias', 'second', '-keyalg', 'RSA', '-keysize', '2048',
      '-validity', '30', '-dname', 'CN=Second fixture', '-keystore', store,
      '-storepass', 'fixture-password', '-noprompt']);
    const multiple = join(temporary, 'multiple.aab');
    run('java', ['-m', 'jdk.jartool/sun.security.tools.jarsigner.Main', '-keystore', store,
      '-storepass', 'fixture-password', '-signedjar', multiple, join(temporary, 'signed.aab'), 'second']);
    const result = spawnSync('java', [inspector, multiple], { encoding: 'utf8', timeout: 30_000 });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'AAB signature verification failed.\n');
  });
});
