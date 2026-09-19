import { Platform } from 'react-native';
const KEY = 'leoqo.profile.v1';
let database: Promise<import('expo-sqlite').SQLiteDatabase> | undefined;
async function db() {
  if (!database) database = import('expo-sqlite').then(async ({ openDatabaseAsync }) => {
    const connection = await openDatabaseAsync('leoqo.db');
    try {
      await connection.execAsync('PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
    } catch (error) {
      // Release the failed initialization handle before a user retries opening the database.
      // Cleanup failure must not hide the original error or prevent the next attempt.
      try { await connection.closeAsync(); } catch {}
      throw error;
    }
    return connection;
  }).catch(error => {
    // A temporary open failure must not poison every subsequent Retry attempt.
    database = undefined;
    throw error;
  });
  return database;
}
async function readValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return globalThis.localStorage.getItem(key);
  const row = await (await db()).getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
  return row?.value ?? null;
}
async function writeValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') { globalThis.localStorage.setItem(key, value); return; }
  await (await db()).runAsync('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, value);
}
export const readProfile = () => readValue(KEY);
export const writeProfile = (value: string) => writeValue(KEY,value);
// Separate from progress exports/resets; this marker never grants paid access.
const RECOVERY_KEY='leoqo.purchase-recovery.v1';
export const readPurchaseRecovery = () => readValue(RECOVERY_KEY);
export const writePurchaseRecovery = (value: string) => writeValue(RECOVERY_KEY,value);
