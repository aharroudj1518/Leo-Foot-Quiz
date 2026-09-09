import { Platform } from 'react-native';
const KEY = 'leoqo.profile.v1';
let database: Promise<import('expo-sqlite').SQLiteDatabase> | undefined;
async function db() {
  if (!database) database = import('expo-sqlite').then(async ({ openDatabaseAsync }) => {
    const connection = await openDatabaseAsync('leoqo.db');
    await connection.execAsync('PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
    return connection;
  }).catch(error => {
    // A temporary open failure must not poison every subsequent Retry attempt.
    database = undefined;
    throw error;
  });
  return database;
}
export async function readProfile(): Promise<string | null> {
  if (Platform.OS === 'web') return globalThis.localStorage.getItem(KEY);
  const row = await (await db()).getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', KEY);
  return row?.value ?? null;
}
export async function writeProfile(value: string): Promise<void> {
  if (Platform.OS === 'web') { globalThis.localStorage.setItem(KEY, value); return; }
  await (await db()).runAsync('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', KEY, value);
}
