import java.io.File;
import java.io.InputStream;
import java.security.CodeSigner;
import java.security.MessageDigest;
import java.security.cert.X509Certificate;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

/**
 * Verifies the AAB's JAR signature without requiring a public certificate authority.
 * Android upload certificates are normally self-signed. This proves integrity and
 * reports their identity; the caller must compare that identity with Play Console.
 * Run with a JDK: java scripts/InspectAabSignature.java /path/to/application.aab
 */
class InspectAabSignature {
  private static final long MAX_TOTAL_BYTES = 2L * 1024 * 1024 * 1024;
  private static final long MAX_ENTRY_BYTES = 512L * 1024 * 1024;
  private static final long MAX_SIGNATURE_BYTES = 16L * 1024 * 1024;
  private static final int MAX_ENTRIES = 100_000;

  private static boolean signatureMetadata(String name) {
    String upper = name.toUpperCase(Locale.ROOT);
    if (!upper.startsWith("META-INF/")) return false;
    String basename = upper.substring("META-INF/".length());
    if (basename.contains("/")) return false;
    return basename.equals("MANIFEST.MF") || basename.endsWith(".SF")
        || basename.endsWith(".RSA") || basename.endsWith(".DSA")
        || basename.endsWith(".EC") || basename.startsWith("SIG-");
  }

  private static void require(boolean valid) {
    if (!valid) throw new IllegalArgumentException();
  }

  private static String inspect(String filename) throws Exception {
    File file = new File(filename);
    require(file.isFile() && file.length() <= MAX_TOTAL_BYTES);
    try (JarFile jar = new JarFile(file, true)) {
      Set<String> names = new HashSet<>();
      Set<String> signatureNames = new HashSet<>();
      Set<String> manifestModules = new TreeSet<>();
      long declaredBytes = 0;
      // Bound metadata before JarFile initializes its signature parser, and reject
      // duplicate names so ZIP readers cannot select different versions of a file.
      for (Enumeration<JarEntry> entries = jar.entries(); entries.hasMoreElements();) {
        JarEntry entry = entries.nextElement();
        require(names.add(entry.getName()) && names.size() <= MAX_ENTRIES);
        if (entry.getName().endsWith("/manifest/AndroidManifest.xml")) {
          require(entry.getName().matches("[A-Za-z0-9_]+/manifest/AndroidManifest\\.xml"));
          manifestModules.add(entry.getName().substring(0, entry.getName().indexOf('/')));
        }
        require(entry.getSize() >= 0 && entry.getSize() <= MAX_ENTRY_BYTES);
        require(!entry.isDirectory() || entry.getSize() == 0);
        declaredBytes += entry.getSize();
        require(declaredBytes <= MAX_TOTAL_BYTES);
        if (signatureMetadata(entry.getName())) {
          require(signatureNames.add(entry.getName().toUpperCase(Locale.ROOT)));
          require(entry.getSize() <= MAX_SIGNATURE_BYTES);
        }
      }
      require(names.contains("base/manifest/AndroidManifest.xml"));
      require(names.contains("BundleConfig.pb"));

      byte[] certificate = null;
      byte[] buffer = new byte[64 * 1024];
      long totalBytes = 0;
      int signedPayloadEntries = 0;
      for (Enumeration<JarEntry> entries = jar.entries(); entries.hasMoreElements();) {
        JarEntry entry = entries.nextElement();
        if (entry.isDirectory()) continue;
        long entryBytes = 0;
        try (InputStream input = jar.getInputStream(entry)) {
          int count;
          while ((count = input.read(buffer)) != -1) {
            entryBytes += count;
            totalBytes += count;
            require(entryBytes <= MAX_ENTRY_BYTES && totalBytes <= MAX_TOTAL_BYTES);
          }
        }
        require(entryBytes == entry.getSize());
        if (signatureMetadata(entry.getName())) continue;
        // getCodeSigners is meaningful only after reading the entire entry.
        // Do not exempt META-INF/services or other non-signature metadata.
        CodeSigner[] signers = entry.getCodeSigners();
        require(signers != null && signers.length == 1);
        var chain = signers[0].getSignerCertPath().getCertificates();
        require(!chain.isEmpty() && chain.get(0) instanceof X509Certificate);
        X509Certificate leaf = (X509Certificate) chain.get(0);
        leaf.checkValidity();
        byte[] encoded = leaf.getEncoded();
        if (certificate == null) certificate = encoded;
        else require(MessageDigest.isEqual(certificate, encoded));
        signedPayloadEntries++;
      }
      require(certificate != null && signedPayloadEntries > 0);
      String fingerprint = HexFormat.of().withUpperCase().formatHex(
          MessageDigest.getInstance("SHA-256").digest(certificate));
      return "{\"certificateSha256\":\"" + fingerprint
          + "\",\"signedPayloadEntries\":" + signedPayloadEntries
          + ",\"manifestModules\":[\"" + String.join("\",\"", manifestModules) + "\"]"
          + ",\"cryptographicallySigned\":true}";
    }
  }

  public static void main(String[] args) {
    try {
      require(args.length == 1);
      System.out.println(inspect(args[0]));
    } catch (Exception | LinkageError failure) {
      // Raw verifier exceptions can include signer subjects, aliases or paths.
      System.err.println("AAB signature verification failed.");
      System.exit(1);
    }
  }
}
