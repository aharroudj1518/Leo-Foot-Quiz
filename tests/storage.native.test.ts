import { beforeEach, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ open: vi.fn(), exec: vi.fn(), read: vi.fn(), write: vi.fn(), close: vi.fn() }));
vi.mock('react-native', () => ({ Platform: { OS: 'android' } }));
vi.mock('expo-sqlite', () => ({ openDatabaseAsync: mock.open }));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mock.open.mockResolvedValue({ execAsync: mock.exec, getFirstAsync: mock.read, runAsync: mock.write, closeAsync: mock.close });
  mock.close.mockResolvedValue(undefined);
  mock.exec.mockResolvedValue(undefined);
  mock.read.mockResolvedValue({ value: 'existing progress' });
});
it('retries opening after a transient failure without resetting saved progress', async () => {
  mock.open.mockRejectedValueOnce(new Error('temporarily unavailable'));
  const storage = await import('../src/services/storage');
  await expect(storage.readProfile()).rejects.toThrow('temporarily unavailable');
  await expect(storage.readProfile()).resolves.toBe('existing progress');
  expect(mock.open).toHaveBeenCalledTimes(2);
  expect(mock.write).not.toHaveBeenCalled();
});
it('shares one database initialization between concurrent reads', async () => {
  const storage = await import('../src/services/storage');
  await Promise.all([storage.readProfile(), storage.readProfile()]);
  expect(mock.open).toHaveBeenCalledTimes(1);
});
it.each([false,true])('releases failed setup and preserves progress on retry, cleanup failure %s', async cleanupFails => {
  mock.exec.mockRejectedValueOnce(new Error('setup failed'));
  if (cleanupFails) mock.close.mockRejectedValueOnce(new Error('close failed'));
  const storage=await import('../src/services/storage');
  await expect(storage.readProfile()).rejects.toThrow('setup failed');
  expect(mock.close).toHaveBeenCalledTimes(1);
  await expect(storage.readProfile()).resolves.toBe('existing progress');
  expect(mock.open).toHaveBeenCalledTimes(2);
  expect(mock.write).not.toHaveBeenCalled();
});
